/**
 * Spring Data repository for product persistence.
 *
 * Exposes standard CRUD plus a compound query to list all products
 * belonging to a specific company (used by the /my-company/products page).
 */
package com.barea.modules.catalog.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.barea.modules.catalog.domain.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    // Returns every product owned by the given company — used by the frontend
    // "Product Catalog" page that shows a company's own listings.
    List<Product> findAllByCompanyId(UUID companyId);
}
