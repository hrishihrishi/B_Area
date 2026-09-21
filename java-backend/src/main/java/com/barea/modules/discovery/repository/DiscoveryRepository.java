package com.barea.modules.discovery.repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.springframework.stereotype.Repository;

import com.barea.modules.discovery.domain.NearbySearchResultDTO;

@Repository
public class DiscoveryRepository {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Single database round-trip spatial + text + deterministic scoring search query.
     */
    @SuppressWarnings("unchecked")
    public List<NearbySearchResultDTO> findNearbyProducts(
            Double lat,
            Double lng,
            Double radiusKm,
            String queryStr,
            String typeStr,
            int limit,
            int offset) {

        System.out.println("[DiscoveryRepository] findNearbyProducts() — lat=" + lat + ", lng=" + lng 
                + ", radiusKm=" + radiusKm + ", query='" + queryStr + "', type='" + typeStr + "', limit=" + limit + ", offset=" + offset);

        String sql = """
            SELECT 
                p.product_id                                     AS productId,
                p.product_name                                   AS productName,
                COALESCE(p.type, p.product_type)                 AS productType,
                p.category                                       AS category,
                p.pricing                                        AS pricing,
                p.pricing_tiers::text                            AS pricingTiers,
                p.specifications::text                           AS specifications,
                array_to_string(p.tags, ',')                     AS tags,
                p.rating                                         AS rating,
                p.review_count                                   AS reviewCount,
                p.total_sales                                    AS totalSales,
                c.company_id                                     AS companyId,
                c.company_name                                   AS companyName,
                COALESCE(c.verification_status, 'UNVERIFIED')    AS verificationStatus,
                s.store_id                                       AS storeId,
                s.store_name                                     AS storeName,
                s.city                                           AS city,
                s.latitude                                       AS storeLatitude,
                s.longitude                                      AS storeLongitude,
                i.local_price                                    AS localPrice,
                i.stock_quantity                                 AS stockQuantity,
                (ST_DistanceSphere(s.location_geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)) / 1000.0) AS distanceKm,
                (
                    -- 30% Text Match weight
                    (CASE WHEN :query IS NOT NULL AND TRIM(:query) <> '' THEN 
                        LEAST(1.0, (ts_rank(p.search_vector, plainto_tsquery('english', :query)) * 2.0 + similarity(p.product_name, :query)))
                     ELSE 1.0 END * 0.30)
                    +
                    -- 30% Proximity weight (closer stores score higher)
                    (GREATEST(0.0, 1.0 - ((ST_DistanceSphere(s.location_geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)) / 1000.0) / GREATEST(1.0, :radiusKm))) * 0.30)
                    +
                    -- 15% Verification weight
                    (CASE WHEN UPPER(COALESCE(c.verification_status, 'UNVERIFIED')) = 'VERIFIED' THEN 1.0 ELSE 0.0 END * 0.15)
                    +
                    -- 15% Rating and Total Sales metrics weight
                    (((LEAST(1.0, COALESCE(p.rating, 0.0) / 5.0) * 0.5) + (LEAST(1.0, COALESCE(p.total_sales, 0) / 100.0) * 0.5)) * 0.15)
                    +
                    -- 10% Inventory Stock weight
                    (CASE WHEN COALESCE(i.stock_quantity, 0) > 0 THEN LEAST(1.0, i.stock_quantity / 50.0) ELSE 0.0 END * 0.10)
                ) AS finalRelevanceScore
            FROM products p
            JOIN companies c ON p.company_id = c.company_id
            JOIN store_inventory i ON p.product_id = i.product_id
            JOIN stores s ON i.store_id = s.store_id
            WHERE ST_DistanceSphere(s.location_geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)) <= (:radiusKm * 1000.0)
              AND (:query IS NULL OR TRIM(:query) = '' OR p.search_vector @@ plainto_tsquery('english', :query) OR similarity(p.product_name, :query) > 0.1)
              AND (:type IS NULL OR TRIM(:type) = '' OR LOWER(COALESCE(p.type, p.product_type)) = LOWER(:type))
            ORDER BY finalRelevanceScore DESC, distanceKm ASC
            LIMIT :limit OFFSET :offset
            """;

        Query nativeQuery = entityManager.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lng", lng)
                .setParameter("radiusKm", radiusKm)
                .setParameter("query", queryStr == null ? "" : queryStr.trim())
                .setParameter("type", typeStr == null ? "" : typeStr.trim())
                .setParameter("limit", limit)
                .setParameter("offset", offset);

        List<Object[]> rows = nativeQuery.getResultList();
        System.out.println("[DiscoveryRepository] DB returned " + rows.size() + " matching nearby store inventory items.");

        List<NearbySearchResultDTO> results = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            NearbySearchResultDTO dto = NearbySearchResultDTO.builder()
                    .productId(row[0] != null ? UUID.fromString(row[0].toString()) : null)
                    .productName(row[1] != null ? row[1].toString() : null)
                    .productType(row[2] != null ? row[2].toString() : null)
                    .category(row[3] != null ? row[3].toString() : null)
                    .pricing(row[4] != null ? row[4].toString() : null)
                    .pricingTiers(row[5] != null ? row[5].toString() : null)
                    .specifications(row[6] != null ? row[6].toString() : null)
                    .tags(row[7] != null ? row[7].toString() : null)
                    .rating(row[8] instanceof Number ? BigDecimal.valueOf(((Number) row[8]).doubleValue()) : BigDecimal.ZERO)
                    .reviewCount(row[9] instanceof Number ? ((Number) row[9]).intValue() : 0)
                    .totalSales(row[10] instanceof Number ? ((Number) row[10]).intValue() : 0)
                    .companyId(row[11] != null ? UUID.fromString(row[11].toString()) : null)
                    .companyName(row[12] != null ? row[12].toString() : null)
                    .verificationStatus(row[13] != null ? row[13].toString() : "UNVERIFIED")
                    .storeId(row[14] != null ? UUID.fromString(row[14].toString()) : null)
                    .storeName(row[15] != null ? row[15].toString() : null)
                    .city(row[16] != null ? row[16].toString() : null)
                    .storeLatitude(row[17] instanceof Number ? BigDecimal.valueOf(((Number) row[17]).doubleValue()) : null)
                    .storeLongitude(row[18] instanceof Number ? BigDecimal.valueOf(((Number) row[18]).doubleValue()) : null)
                    .localPrice(row[19] instanceof Number ? BigDecimal.valueOf(((Number) row[19]).doubleValue()) : null)
                    .stockQuantity(row[20] instanceof Number ? ((Number) row[20]).intValue() : 0)
                    .distanceKm(row[21] instanceof Number ? ((Number) row[21]).doubleValue() : 0.0)
                    .finalRelevanceScore(row[22] instanceof Number ? ((Number) row[22]).doubleValue() : 0.0)
                    .build();

            results.add(dto);
        }

        return results;
    }
}
