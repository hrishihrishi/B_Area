/**
 * Application service for product catalog management.
 *
 * This is the transaction boundary between the REST controller and the
 * database.  All business rules around products live here, keeping both
 * the controller and the repository clean.
 */
package com.barea.modules.catalog.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barea.modules.catalog.domain.Product;
import com.barea.modules.catalog.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ---------- READ ----------

    public List<Product> getProductsByCompany(UUID companyId) {
        System.out.println("[ProductService] getProductsByCompany() for companyId: " + companyId);
        return productRepository.findAllByCompanyId(companyId);
    }

    public Optional<Product> getProductById(UUID productId) {
        System.out.println("[ProductService] getProductById() for productId: " + productId);
        return productRepository.findById(productId);
    }

    // ---------- WRITE ----------

    @Transactional
    public Product createProduct(Product product) {
        System.out.println("[ProductService] createProduct() \u2014 name: " + product.getProductName()
                + ", companyId: " + product.getCompanyId());
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID productId, Product updated) {
        System.out.println("[ProductService] updateProduct() for productId: " + productId);

        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        // Partial update — only overwrite fields that are present in the payload.
        if (updated.getProductName() != null)        existing.setProductName(updated.getProductName());
        if (updated.getCompanyName() != null)         existing.setCompanyName(updated.getCompanyName());
        if (updated.getProductType() != null)         existing.setProductType(updated.getProductType());
        if (updated.getCategory() != null)            existing.setCategory(updated.getCategory());
        if (updated.getAvailability() != null)        existing.setAvailability(updated.getAvailability());
        if (updated.getPricing() != null)             existing.setPricing(updated.getPricing());
        if (updated.getProductDescription() != null)  existing.setProductDescription(updated.getProductDescription());
        if (updated.getLogo() != null)                existing.setLogo(updated.getLogo());

        return productRepository.save(existing);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        System.out.println("[ProductService] deleteProduct() for productId: " + productId);
        productRepository.deleteById(productId);
        System.out.println("[ProductService] Product deleted: " + productId);
    }
}
