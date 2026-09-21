/**
 * Persistence model for multi-location store inventory mapping.
 * Maps to the `store_inventory` table created by V2__multi_location_and_expanded_products.sql.
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
@Table(name = "store_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreInventory {

    @Id
    @Column(name = "inventory_id", nullable = false, updatable = false)
    private UUID inventoryId;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "local_price", precision = 12, scale = 2)
    private BigDecimal localPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (inventoryId == null) {
            inventoryId = UUID.randomUUID();
        }
        if (stockQuantity == null) {
            stockQuantity = 0;
        }
        if (isAvailable == null) {
            isAvailable = true;
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        System.out.println("[StoreInventory] @PrePersist — inventoryId: " + inventoryId + " storeId: " + storeId + " productId: " + productId);
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
        System.out.println("[StoreInventory] @PreUpdate — inventoryId: " + inventoryId);
    }
}
