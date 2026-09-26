package com.barea.modules.discovery.domain;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbySearchResultDTO {
    private UUID productId;
    private String productName;
    private String productType;
    private String category;
    private String pricing;
    private String pricingTiers;
    private String specifications;
    private String tags;
    private BigDecimal rating;
    private Integer reviewCount;
    private Integer totalSales;

    private UUID companyId;
    private String companyName;
    private String verificationStatus;

    private UUID storeId;
    private String storeName;
    private String city;
    private BigDecimal storeLatitude;
    private BigDecimal storeLongitude;
    private BigDecimal localPrice;
    private Integer stockQuantity;

    private Double distanceKm;
    private Double finalRelevanceScore;
}
