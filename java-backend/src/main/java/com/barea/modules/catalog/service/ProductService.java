package com.barea.modules.catalog.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.transaction.annotation.Transactional;

import com.barea.modules.catalog.domain.Product;
import com.barea.modules.catalog.domain.StoreInventory;
import com.barea.modules.catalog.repository.ProductRepository;
import com.barea.modules.catalog.repository.StoreInventoryRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreInventoryRepository storeInventoryRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ProductService(
            ProductRepository productRepository,
            StoreInventoryRepository storeInventoryRepository) {
        this.productRepository = productRepository;
        this.storeInventoryRepository = storeInventoryRepository;
    }

    public List<Product> getProductsByCompany(UUID companyId) {
        System.out.println("[ProductService] getProductsByCompany() companyId: " + companyId);
        return productRepository.findAllByCompanyId(companyId);
    }

    public Optional<Product> getProductById(UUID productId) {
        return productRepository.findById(productId);
    }

    @Transactional
    public Product createProduct(Product product) {
        return createProductWithStores(product, List.of(), null, 0);
    }

    @Transactional
    public Product createProductWithStores(
            Product product,
            List<UUID> storeIds,
            BigDecimal localPrice,
            Integer stockQuantity) {

        System.out.println("[ProductService] createProductWithStores() product: " + product.getProductName()
                + ", storeIds count: " + (storeIds != null ? storeIds.size() : 0));

        // Avoid inserting raw JSON strings into jsonb columns (Postgres will reject
        // varchar -> jsonb without casting).
        String specsJson = product.getSpecifications();
        String tiersJson = product.getPricingTiers();
        product.setSpecifications(null);
        product.setPricingTiers(null);

        Product saved = productRepository.save(product);

        // Persist JSONB columns correctly by casting the JSON string values to jsonb
        try {
            if ((specsJson != null && !specsJson.isBlank()) || (tiersJson != null && !tiersJson.isBlank())) {
                String sql = "UPDATE products SET specifications = COALESCE(CAST(:spec AS jsonb), specifications), pricing_tiers = COALESCE(CAST(:tiers AS jsonb), pricing_tiers) WHERE product_id = :id";
                Query q = entityManager.createNativeQuery(sql)
                        .setParameter("spec", specsJson)
                        .setParameter("tiers", tiersJson)
                        .setParameter("id", saved.getProductId());
                q.executeUpdate();
                entityManager.refresh(saved);
            }
        } catch (Exception e) {
            System.err.println("[ProductService] Failed to cast JSON fields to jsonb: " + e.getMessage());
        }

        if (storeIds != null && !storeIds.isEmpty()) {
            for (UUID storeId : storeIds) {
                StoreInventory inventory = StoreInventory.builder()
                        .storeId(storeId)
                        .productId(saved.getProductId())
                        .localPrice(localPrice)
                        .stockQuantity(stockQuantity != null ? stockQuantity : 100)
                        .isAvailable(true)
                        .build();
                storeInventoryRepository.save(inventory);
                System.out.println("[ProductService] Saved StoreInventory mapping for storeId: " + storeId
                        + ", productId: " + saved.getProductId());
            }
        }

        return saved;
    }

    @Transactional
    public Product updateProduct(UUID productId, Product updated) {
        System.out.println("[ProductService] updateProduct() productId: " + productId);
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found for id: " + productId));

        if (updated.getProductName() != null)
            existing.setProductName(updated.getProductName());
        if (updated.getProductType() != null) {
            existing.setProductType(updated.getProductType());
            existing.setType(updated.getProductType());
        }
        if (updated.getCategory() != null)
            existing.setCategory(updated.getCategory());
        if (updated.getAvailability() != null)
            existing.setAvailability(updated.getAvailability());
        if (updated.getPricing() != null)
            existing.setPricing(updated.getPricing());
        if (updated.getProductDescription() != null)
            existing.setProductDescription(updated.getProductDescription());
        if (updated.getLogo() != null)
            existing.setLogo(updated.getLogo());
        if (updated.getTags() != null)
            existing.setTags(updated.getTags());
        if (updated.getSpecifications() != null)
            existing.setSpecifications(updated.getSpecifications());
        if (updated.getPricingTiers() != null)
            existing.setPricingTiers(updated.getPricingTiers());

        return productRepository.save(existing);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        System.out.println("[ProductService] deleteProduct() productId: " + productId);
        storeInventoryRepository.deleteByProductId(productId);
        productRepository.deleteById(productId);
    }
}
