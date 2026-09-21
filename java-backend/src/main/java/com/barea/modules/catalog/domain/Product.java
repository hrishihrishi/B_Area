/**
 * Persistence model for a B2B product/service listing.
 *
 * Maps to the `products` table created by V1__init_schema.sql.
 * The `search_vector` column is a DB-generated TSVECTOR — we do NOT map it
 * here because JPA cannot update a GENERATED ALWAYS STORED column.
 * Search queries use native SQL directly against that column.
 */
package com.barea.modules.catalog.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @Column(name = "product_id", nullable = false, updatable = false)
    private UUID productId;

    // Foreign key to company_info — we store it as a plain UUID (no JPA
    // @ManyToOne join) to keep the catalog module decoupled from the company module.
    @Column(name = "company_id", nullable = false, updatable = false)
    private UUID companyId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    // Denormalised company name so search results are self-contained.
    @Column(name = "company_name", nullable = false)
    private String companyName;

    // "product" | "service"
    @Column(name = "product_type", nullable = false)
    private String productType;

    @Column(name = "category", nullable = false)
    private String category;

    // "AVAILABLE" | "OUT_OF_STOCK" | etc. Default set in DB schema.
    @Column(name = "availability")
    private String availability;

    // Free-form pricing string, e.g. "₹85,000 / ton" or "Contact for quote"
    @Column(name = "pricing")
    private String pricing;

    @Column(name = "product_description", columnDefinition = "TEXT")
    private String productDescription;

    @Column(name = "logo")
    private String logo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        // Auto-assign UUID here (Postgres also sets DEFAULT gen_random_uuid(),
        // but we set it in Java so the object is fully populated after save()).
        if (productId == null) {
            productId = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        System.out.println("[Product] @PrePersist — new product id: " + productId);
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
        System.out.println("[Product] @PreUpdate — updated product id: " + productId);
    }
}
