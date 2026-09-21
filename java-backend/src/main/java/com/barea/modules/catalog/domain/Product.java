/**
 * Persistence model for a B2B product/service listing (Expanded Schema).
 *
 * Maps to the `products` table created by V2__multi_location_and_expanded_products.sql.
 */
package com.barea.modules.catalog.domain;

import java.math.BigDecimal;
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

    @Column(name = "company_id", nullable = false, updatable = false)
    private UUID companyId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "product_type", nullable = false)
    private String productType;

    @Column(name = "type")
    private String type;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "availability")
    private String availability;

    @Column(name = "pricing")
    private String pricing;

    @Column(name = "product_description", columnDefinition = "TEXT")
    private String productDescription;

    @Column(name = "logo")
    private String logo;

    @Column(name = "tags")
    private String[] tags;

    @Column(name = "specifications", columnDefinition = "jsonb")
    private String specifications;

    @Column(name = "pricing_tiers", columnDefinition = "jsonb")
    private String pricingTiers;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "total_sales")
    private Integer totalSales;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (productId == null) {
            productId = UUID.randomUUID();
        }
        if (type == null) {
            type = productType;
        }
        if (rating == null) {
            rating = BigDecimal.ZERO;
        }
        if (reviewCount == null) {
            reviewCount = 0;
        }
        if (totalSales == null) {
            totalSales = 0;
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        System.out.println("[Product] @PrePersist — product id: " + productId);
    }

    @PreUpdate
    public void preUpdate() {
        if (type == null) {
            type = productType;
        }
        updatedAt = Instant.now();
        System.out.println("[Product] @PreUpdate — product id: " + productId);
    }
}
