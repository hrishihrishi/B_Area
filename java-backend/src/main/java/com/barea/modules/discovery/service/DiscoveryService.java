package com.barea.modules.discovery.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barea.modules.discovery.domain.NearbySearchResultDTO;
import com.barea.modules.discovery.repository.DiscoveryRepository;

@Service
public class DiscoveryService {

    private final DiscoveryRepository discoveryRepository;

    public DiscoveryService(DiscoveryRepository discoveryRepository) {
        this.discoveryRepository = discoveryRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> searchNearby(
            Double lat,
            Double lng,
            Double radiusKm,
            String query,
            String type,
            int page,
            int size) {

        System.out.println("[DiscoveryService] searchNearby() called with lat=" + lat + ", lng=" + lng 
                + ", radiusKm=" + radiusKm + ", query='" + query + "', type='" + type + "', page=" + page + ", size=" + size);

        double safeRadius = (radiusKm == null || radiusKm <= 0) ? 50.0 : radiusKm;
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        int offset = safePage * safeSize;

        List<NearbySearchResultDTO> content = discoveryRepository.findNearbyProducts(
                lat, lng, safeRadius, query, type, safeSize, offset);

        System.out.println("[DiscoveryService] Search returned " + content.size() + " items for page " + safePage);

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("numberOfElements", content.size());
        response.put("lat", lat);
        response.put("lng", lng);
        response.put("radiusKm", safeRadius);

        return response;
    }
}
