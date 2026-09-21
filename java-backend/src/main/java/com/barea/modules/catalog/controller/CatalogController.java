/**
 * REST controller for the product catalog.
 *
 * Exposes CRUD endpoints for products/services listed by a company:
 *
 *   GET    /api/products?companyId={uuid}  — list a company's products
 *   GET    /api/products/{productId}       — single product lookup
 *   POST   /api/products                  — create a new product
 *   PUT    /api/products/{productId}       — update an existing product
 *   DELETE /api/products/{productId}       — hard-delete a product
 */
package com.barea.modules.catalog.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barea.modules.catalog.domain.Product;
import com.barea.modules.catalog.service.ProductService;

@RestController
@CrossOrigin(
    origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
@RequestMapping("/api/products")
public class CatalogController {

    private final ProductService productService;

    public CatalogController(ProductService productService) {
        this.productService = productService;
    }

    // ------------------------------------------------------------------ READ

    /**
     * GET /api/products?companyId={uuid}
     * Returns all products for the given company.
     * The frontend My-Company Products page calls this on mount.
     */
    @GetMapping
    public ResponseEntity<?> getProductsByCompany(@RequestParam UUID companyId) {
        System.out.println("[CatalogController] GET /api/products?companyId=" + companyId);
        List<Map<String, Object>> products = productService.getProductsByCompany(companyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        System.out.println("[CatalogController] Returning " + products.size() + " products.");
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/{productId}
     * Single product detail lookup.
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable UUID productId) {
        System.out.println("[CatalogController] GET /api/products/" + productId);
        return productService.getProductById(productId)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    System.out.println("[CatalogController] Product not found: " + productId);
                    return ResponseEntity.notFound().build();
                });
    }

    // ----------------------------------------------------------------- WRITE

    /**
     * POST /api/products
     * Creates a new product listing. The frontend sends a JSON body.
     */
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> payload) {
        System.out.println("[CatalogController] POST /api/products \u2014 payload: " + payload.keySet());
        Product product = mapPayloadToEntity(payload);
        Product saved = productService.createProduct(product);
        System.out.println("[CatalogController] Product created with id: " + saved.getProductId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    /**
     * PUT /api/products/{productId}
     * Partial update — only fields present in the payload are overwritten.
     */
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable UUID productId,
            @RequestBody Map<String, Object> payload) {
        System.out.println("[CatalogController] PUT /api/products/" + productId + " \u2014 payload keys: " + payload.keySet());
        Product product = mapPayloadToEntity(payload);
        Product updated = productService.updateProduct(productId, product);
        System.out.println("[CatalogController] Product updated: " + productId);
        return ResponseEntity.ok(toResponse(updated));
    }

    /**
     * DELETE /api/products/{productId}
     * Permanently removes the product listing.
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID productId) {
        System.out.println("[CatalogController] DELETE /api/products/" + productId);
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    // --------------------------------------------------------- PRIVATE HELPERS

    /**
     * Maps an incoming JSON payload map to a Product entity.
     * Uses null-safe reads — missing keys result in null fields
     * (handled gracefully by the service layer's partial-update logic).
     */
    private Product mapPayloadToEntity(Map<String, Object> p) {
        String companyIdStr = p.get("companyId") == null ? null : p.get("companyId").toString();

        return Product.builder()
                .companyId(companyIdStr != null ? UUID.fromString(companyIdStr) : null)
                .productName(str(p, "productName", "name"))
                .companyName(str(p, "companyName"))
                .productType(str(p, "productType", "type"))
                .category(str(p, "category"))
                .availability(str(p, "availability"))
                .pricing(str(p, "pricing", "price"))
                .productDescription(str(p, "productDescription", "description"))
                .logo(str(p, "logo"))
                .build();
    }

    /**
     * Converts a Product entity to a Map so the response JSON is stable and
     * independent of the entity field names.
     */
    private Map<String, Object> toResponse(Product p) {
        Map<String, Object> r = new HashMap<>();
        r.put("productId", p.getProductId());
        r.put("companyId", p.getCompanyId());
        r.put("productName", p.getProductName());
        r.put("name", p.getProductName()); // alias for frontend convenience
        r.put("companyName", p.getCompanyName());
        r.put("productType", p.getProductType());
        r.put("category", p.getCategory());
        r.put("availability", p.getAvailability() != null ? p.getAvailability() : "AVAILABLE");
        r.put("status", p.getAvailability() != null ? p.getAvailability() : "AVAILABLE"); // alias
        r.put("pricing", p.getPricing());
        r.put("price", p.getPricing()); // alias
        r.put("productDescription", p.getProductDescription());
        r.put("logo", p.getLogo());
        r.put("createdAt", p.getCreatedAt());
        r.put("updatedAt", p.getUpdatedAt());
        return r;
    }

    // Helper: reads a key from the map, falling back through multiple aliases.
    private String str(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object val = map.get(key);
            if (val != null) return val.toString();
        }
        return null;
    }
}
