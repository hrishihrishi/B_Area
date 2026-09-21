/**
 * Location-aware discovery controller.
 *
 * GET /api/v1/discovery/nearby?lat={lat}&lng={lng}&radiusKm={radius}&query={q}&type={type}
 */
package com.barea.modules.discovery.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barea.modules.discovery.service.DiscoveryService;

@RestController
@CrossOrigin(
    origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.OPTIONS}
)
@RequestMapping("/api/v1/discovery")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    public DiscoveryController(DiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> getNearbyProducts(
            @RequestParam(required = false, defaultValue = "12.9716") Double lat,
            @RequestParam(required = false, defaultValue = "77.5946") Double lng,
            @RequestParam(required = false, defaultValue = "50") Double radiusKm,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {

        System.out.println("[DiscoveryController] GET /api/v1/discovery/nearby — lat=" + lat 
                + ", lng=" + lng + ", radiusKm=" + radiusKm + ", query='" + query + "', type='" + type + "'");

        Map<String, Object> result = discoveryService.searchNearby(
                lat, lng, radiusKm, query, type, page, size);

        return ResponseEntity.ok(result);
    }
}
