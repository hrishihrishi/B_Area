/**
 * Persistence model for a physical store branch location.
 * Maps to the `stores` table created by V2__multi_location_and_expanded_products.sql.
 */
package com.barea.modules.company.domain;

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
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @Column(name = "store_id", nullable = false, updatable = false)
    private UUID storeId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "city")
    private String city;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (storeId == null) {
            storeId = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        System.out.println("[Store] @PrePersist — new storeId: " + storeId + " for companyId: " + companyId);
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
        System.out.println("[Store] @PreUpdate — storeId: " + storeId);
    }
}
