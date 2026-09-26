package com.barea.modules.catalog.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.barea.modules.catalog.domain.StoreInventory;

@Repository
public interface StoreInventoryRepository extends JpaRepository<StoreInventory, UUID> {
    List<StoreInventory> findByProductId(UUID productId);
    List<StoreInventory> findByStoreId(UUID storeId);
    void deleteByProductId(UUID productId);
}
