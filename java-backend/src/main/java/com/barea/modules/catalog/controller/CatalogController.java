/**
 * REST controller for the product catalog.
 */
package com.barea.modules.catalog.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
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

import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CatalogController(ProductService productService) {
        this.productService = productService;
    }

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

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> payload) {
        System.out.println("[CatalogController] POST /api/products — payload keys: " + payload.keySet());
        Product product = mapPayloadToEntity(payload);

        List<UUID> storeIds = parseStoreIds(payload.get("storeIds"));
        BigDecimal localPrice = parseBigDecimal(payload.get("localPrice"));
        Integer stockQuantity = parseInteger(payload.get("stockQuantity"));

        Product saved = productService.createProductWithStores(product, storeIds, localPrice, stockQuantity);
        System.out.println("[CatalogController] Product created with id: " + saved.getProductId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable UUID productId,
            @RequestBody Map<String, Object> payload) {
        System.out.println("[CatalogController] PUT /api/products/" + productId + " — payload keys: " + payload.keySet());
        Product product = mapPayloadToEntity(payload);
        Product updated = productService.updateProduct(productId, product);
        System.out.println("[CatalogController] Product updated: " + productId);
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID productId) {
        System.out.println("[CatalogController] DELETE /api/products/" + productId);
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    private Product mapPayloadToEntity(Map<String, Object> p) {
        String companyIdStr = p.get("companyId") == null ? null : p.get("companyId").toString();
        String type = str(p, "productType", "type");
        if (type == null) type = "Product";

        String[] tags = parseTags(p.get("tags"));
        String specsJson = parseJsonString(p.get("specifications"));
        String tiersJson = parseJsonString(p.get("pricing_tiers"), p.get("pricingTiers"));

        return Product.builder()
                .companyId(companyIdStr != null ? UUID.fromString(companyIdStr) : null)
                .productName(str(p, "productName", "name"))
                .companyName(str(p, "companyName"))
                .productType(type)
                .type(type)
                .category(str(p, "category"))
                .availability(str(p, "availability"))
                .pricing(str(p, "pricing", "price"))
                .productDescription(str(p, "productDescription", "description"))
                .logo(str(p, "logo"))
                .tags(tags)
                .specifications(specsJson)
                .pricingTiers(tiersJson)
                .build();
    }

    private Map<String, Object> toResponse(Product p) {
        Map<String, Object> r = new HashMap<>();
        r.put("productId", p.getProductId());
        r.put("companyId", p.getCompanyId());
        r.put("productName", p.getProductName());
        r.put("name", p.getProductName());
        r.put("companyName", p.getCompanyName());
        r.put("productType", p.getProductType());
        r.put("type", p.getType() != null ? p.getType() : p.getProductType());
        r.put("category", p.getCategory());
        r.put("availability", p.getAvailability() != null ? p.getAvailability() : "AVAILABLE");
        r.put("status", p.getAvailability() != null ? p.getAvailability() : "AVAILABLE");
        r.put("pricing", p.getPricing());
        r.put("price", p.getPricing());
        r.put("productDescription", p.getProductDescription());
        r.put("logo", p.getLogo());
        r.put("tags", p.getTags());
        r.put("specifications", p.getSpecifications());
        r.put("pricingTiers", p.getPricingTiers());
        r.put("rating", p.getRating());
        r.put("reviewCount", p.getReviewCount());
        r.put("totalSales", p.getTotalSales());
        r.put("createdAt", p.getCreatedAt());
        r.put("updatedAt", p.getUpdatedAt());
        return r;
    }

    private String str(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object val = map.get(key);
            if (val != null) return val.toString();
        }
        return null;
    }

    private String[] parseTags(Object val) {
        if (val == null) return new String[0];
        if (val instanceof List<?> list) {
            return list.stream().map(Object::toString).toArray(String[]::new);
        }
        if (val instanceof String str) {
            return str.split(",");
        }
        return new String[0];
    }

    private String parseJsonString(Object... candidates) {
        for (Object val : candidates) {
            if (val == null) continue;
            if (val instanceof String str) {
                if (!str.isBlank()) return str;
            } else {
                try {
                    return objectMapper.writeValueAsString(val);
                } catch (Exception e) {
                    System.err.println("[CatalogController] Failed to serialize JSON object: " + e.getMessage());
                }
            }
        }
        return null;
    }

    private List<UUID> parseStoreIds(Object val) {
        List<UUID> result = new ArrayList<>();
        if (val == null) return result;
        if (val instanceof List<?> list) {
            for (Object item : list) {
                if (item != null) {
                    try {
                        result.add(UUID.fromString(item.toString()));
                    } catch (Exception ignored) {}
                }
            }
        }
        return result;
    }

    private BigDecimal parseBigDecimal(Object val) {
        if (val == null) return null;
        try {
            return new BigDecimal(val.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private Integer parseInteger(Object val) {
        if (val == null) return 100;
        try {
            return Integer.parseInt(val.toString());
        } catch (Exception e) {
            return 100;
        }
    }
}
