/**
 * Immutable DTO representing a single item in a unified search result set.
 *
 * A result can be either a "company" or a "product" \u2014 the `resultType` field
 * tells the frontend which badge to render.  Fields are a superset of both
 * entity types; irrelevant fields will be null.
 */
package com.barea.modules.discovery.domain;

import java.util.UUID;

/**
 * SearchResult is a Java record \u2014 immutable, auto-generates equals/hashCode/toString.
 * It is used only as a response DTO; it has no JPA mapping.
 */
public record SearchResult(

    /** "company" or "product" */
    String resultType,

    /** The UUID of the company or product */
    UUID id,

    /** Display name (company name or product name) */
    String name,

    /** Company name \u2014 populated for "product" results for context */
    String companyName,

    /** Industry (company) or Category (product) */
    String category,

    /** Location (company) or Pricing (product) */
    String meta,

    /** Logo URL */
    String logoUrl,

    /** Fuzzy relevance score from PostgreSQL (higher = better match) */
    Double score
) {}
