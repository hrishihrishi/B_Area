/**
 * Public search endpoint.
 *
 *   GET /api/search?q={query}&limit={optional, default 20}
 *
 * This endpoint is intentionally public (no auth required) so anonymous
 * visitors can discover companies and products on the B_Area marketplace.
 * See SecurityConfig \u2014 /api/search is explicitly permitted for all.
 */
package com.barea.modules.discovery.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barea.modules.discovery.domain.SearchResult;
import com.barea.modules.discovery.service.SearchService;

@RestController
@CrossOrigin(
    origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.OPTIONS}
)
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Unified full-text + fuzzy search.
     *
     * @param q     User-provided search query string. Required.
     * @param limit Maximum results to return. Optional, defaults to 20.
     * @return      JSON array of SearchResult objects, sorted by relevance score.
     */
    @GetMapping
    public ResponseEntity<List<SearchResult>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") int limit) {

        System.out.println("[SearchController] GET /api/search?q='" + q + "'&limit=" + limit);

        // Guard: reject clearly empty or very short queries
        if (q == null || q.trim().length() < 1) {
            System.out.println("[SearchController] Query too short \u2014 returning empty list.");
            return ResponseEntity.ok(List.of());
        }

        // Cap limit to 50 to prevent accidental table scans
        int safeLimit = Math.min(limit, 50);

        List<SearchResult> results = searchService.search(q.trim(), safeLimit);
        System.out.println("[SearchController] Returning " + results.size() + " results.");
        return ResponseEntity.ok(results);
    }
}
