/**
 * Search service that combines full-text search (tsvector @@) and fuzzy
 * trigram similarity (pg_trgm %) across the company_info and products tables.
 *
 * Query strategy:
 *  1. Products: use the generated `search_vector` TSVECTOR column (GIN indexed)
 *     for high-relevance keyword hits, plus pg_trgm similarity on `product_name`
 *     for typo tolerance.
 *  2. Companies: pg_trgm similarity on `company_name` (GIN trgm indexed).
 *
 * The two result sets are unioned and sorted by descending score so the most
 * relevant result appears first regardless of type.
 *
 * NOTE: We use native queries here because JPQL does not support PostgreSQL-
 * specific operators like @@ and %. The query is parameterised to prevent
 * SQL injection.
 */
package com.barea.modules.discovery.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barea.modules.discovery.domain.SearchResult;

@Service
public class SearchService {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Unified full-text + fuzzy search across products and companies.
     *
     * @param query  The raw user-typed search string (e.g. "steel coil Mumbai")
     * @param limit  Maximum number of results to return (default: 20)
     * @return       Ranked list of SearchResult DTOs
     */
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<SearchResult> search(String query, int limit) {
        System.out.println("[SearchService] search() called with query='" + query + "', limit=" + limit);

        // Build a tsquery-safe string: split on whitespace, join with ' & '
        // e.g. "steel coil" -> "steel & coil"
        String tsQuery = buildTsQuery(query);
        System.out.println("[SearchService] tsQuery constructed: " + tsQuery);

        // -----------------------------------------------------------------
        // SQL: Union of product results + company results, sorted by score.
        // -----------------------------------------------------------------
        String sql = """
            SELECT result_type, id::text, name, company_name, category, meta, logo_url, score
            FROM (
                -- ---- Product results (full-text + trgm) ----
                SELECT
                    'product'                                    AS result_type,
                    p.product_id                                 AS id,
                    p.product_name                               AS name,
                    p.company_name                               AS company_name,
                    p.category                                   AS category,
                    COALESCE(p.pricing, 'Contact for price')     AS meta,
                    p.logo                                       AS logo_url,
                    (
                        ts_rank(p.search_vector, to_tsquery('english', :tsQuery)) * 2.0
                        + similarity(p.product_name, :rawQuery)
                    )                                            AS score
                FROM products p
                WHERE
                    p.search_vector @@ to_tsquery('english', :tsQuery)
                    OR similarity(p.product_name, :rawQuery) > 0.2

                UNION ALL

                -- ---- Company results (trgm on name + industry) ----
                SELECT
                    'company'                                    AS result_type,
                    c.company_id                                 AS id,
                    c.company_name                               AS name,
                    c.company_name                               AS company_name,
                    COALESCE(c.industry, 'General')              AS category,
                    COALESCE(c.located, 'Location unknown')      AS meta,
                    c.logo                                       AS logo_url,
                    similarity(c.company_name, :rawQuery)        AS score
                FROM company_info c
                WHERE
                    similarity(c.company_name, :rawQuery) > 0.1
                    OR c.company_name ILIKE :likeQuery
            ) combined
            ORDER BY score DESC
            LIMIT :limit
            """;

        // Build ILIKE pattern for partial-prefix matching ("apexn%" etc.)
        String likeQuery = "%" + query.trim() + "%";

        Query nativeQuery = entityManager.createNativeQuery(sql)
                .setParameter("tsQuery", tsQuery)
                .setParameter("rawQuery", query.trim())
                .setParameter("likeQuery", likeQuery)
                .setParameter("limit", limit);

        List<Object[]> rows = nativeQuery.getResultList();
        System.out.println("[SearchService] Raw DB rows returned: " + rows.size());

        List<SearchResult> results = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            // Columns: result_type, id(text), name, company_name, category, meta, logo_url, score
            String resultType = (String) row[0];
            UUID id            = UUID.fromString((String) row[1]);
            String name        = (String) row[2];
            String companyName = (String) row[3];
            String category    = (String) row[4];
            String meta        = (String) row[5];
            String logoUrl     = (String) row[6];
            Double score       = row[7] instanceof Number ? ((Number) row[7]).doubleValue() : 0.0;

            results.add(new SearchResult(resultType, id, name, companyName, category, meta, logoUrl, score));
        }

        System.out.println("[SearchService] Mapped " + results.size() + " SearchResult objects.");
        return results;
    }

    /**
     * Converts a raw query string into a valid PostgreSQL tsquery string.
     * Each word becomes a lexeme connected with the AND operator (&).
     * Single-character words are dropped because they are usually stop words.
     *
     * Example: "steel coil Mumbai" -> "steel & coil & Mumbai"
     */
    private String buildTsQuery(String raw) {
        String[] words = raw.trim().split("\\s+");
        List<String> lexemes = new ArrayList<>();
        for (String w : words) {
            String cleaned = w.replaceAll("[^a-zA-Z0-9]", "");
            if (cleaned.length() > 1) {
                lexemes.add(cleaned);
            }
        }
        // Fallback to original query if nothing remains after cleaning
        if (lexemes.isEmpty()) {
            return raw.trim().replaceAll("[^a-zA-Z0-9]", "");
        }
        return String.join(" & ", lexemes);
    }
}
