/**
 * HTTP entry point for company-related operations and physical store branches.
 */
package com.barea.modules.company.controller;

import java.math.BigDecimal;
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

import com.barea.modules.company.domain.CompanyProfile;
import com.barea.modules.company.domain.Store;
import com.barea.modules.company.service.CompanyProfileService;
import com.barea.modules.company.service.StoreService;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping("/api/company")
public class CompanyController {

    private final CompanyProfileService companyProfileService;
    private final StoreService storeService;

    public CompanyController(CompanyProfileService companyProfileService, StoreService storeService) {
        this.companyProfileService = companyProfileService;
        this.storeService = storeService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfileByEmail(@RequestParam String email) {
        System.out.println("[CompanyController] GET /api/company/profile?email=" + email);
        return companyProfileService.getProfileByEmail(email)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> {
                System.out.println("[CompanyController] No profile found for email: " + email);
                return ResponseEntity.notFound().build();
            });
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<?> getProfileById(@PathVariable UUID companyId) {
        System.out.println("[CompanyController] GET /api/company/" + companyId);
        return companyProfileService.getProfileById(companyId)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> {
                System.out.println("[CompanyController] No profile found for id: " + companyId);
                return ResponseEntity.notFound().build();
            });
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createProfile(@RequestBody Map<String, Object> payload) {
        System.out.println("[CompanyController] POST /api/company/profile — payload keys: " + payload.keySet());
        CompanyProfile profile = mapPayloadToEntity(payload);
        CompanyProfile saved = companyProfileService.createProfile(profile);

        // Optionally create an initial store branch if latitude & longitude are supplied in payload
        if (payload.containsKey("latitude") || payload.containsKey("longitude") || payload.containsKey("city")) {
            BigDecimal lat = parseBigDecimal(payload.get("latitude"));
            BigDecimal lng = parseBigDecimal(payload.get("longitude"));
            String city = payload.get("city") != null ? payload.get("city").toString() : (profile.getLocated() != null ? profile.getLocated() : "Main Branch");
            String storeName = payload.get("storeName") != null ? payload.get("storeName").toString() : (profile.getCompanyName() + " Main Branch");
            
            Store initialStore = Store.builder()
                .companyId(saved.getCompanyId())
                .storeName(storeName)
                .city(city)
                .latitude(lat)
                .longitude(lng)
                .build();
            storeService.createStore(initialStore);
            System.out.println("[CompanyController] Automatically created primary store branch for new company.");
        }

        System.out.println("[CompanyController] Company profile created with id: " + saved.getCompanyId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/profile/{companyId}")
    public ResponseEntity<?> updateProfile(@PathVariable UUID companyId, @RequestBody Map<String, Object> payload) {
        System.out.println("[CompanyController] PUT /api/company/profile/" + companyId + " — payload keys: " + payload.keySet());
        CompanyProfile profile = mapPayloadToEntity(payload);
        CompanyProfile updated = companyProfileService.updateProfile(companyId, profile);
        System.out.println("[CompanyController] Company profile updated for id: " + companyId);
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID companyId) {
        System.out.println("[CompanyController] DELETE /api/company/" + companyId);
        companyProfileService.deleteProfile(companyId);
        System.out.println("[CompanyController] Company profile deleted for id: " + companyId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------- STORES / BRANCHES
    @GetMapping("/{companyId}/stores")
    public ResponseEntity<List<Store>> getStores(@PathVariable UUID companyId) {
        System.out.println("[CompanyController] GET /api/company/" + companyId + "/stores");
        List<Store> stores = storeService.getStoresByCompany(companyId);
        return ResponseEntity.ok(stores);
    }

    @PostMapping("/{companyId}/stores")
    public ResponseEntity<Store> createStore(@PathVariable UUID companyId, @RequestBody Map<String, Object> payload) {
        System.out.println("[CompanyController] POST /api/company/" + companyId + "/stores — payload: " + payload);
        String storeName = payload.get("storeName") != null ? payload.get("storeName").toString() : "Branch Store";
        String city = payload.get("city") != null ? payload.get("city").toString() : "";
        BigDecimal lat = parseBigDecimal(payload.get("latitude"));
        BigDecimal lng = parseBigDecimal(payload.get("longitude"));

        Store store = Store.builder()
            .companyId(companyId)
            .storeName(storeName)
            .city(city)
            .latitude(lat)
            .longitude(lng)
            .build();

        Store saved = storeService.createStore(store);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/stores/{storeId}")
    public ResponseEntity<Void> deleteStore(@PathVariable UUID storeId) {
        System.out.println("[CompanyController] DELETE /api/company/stores/" + storeId);
        storeService.deleteStore(storeId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------- PRIVATE HELPERS
    private CompanyProfile mapPayloadToEntity(Map<String, Object> payload) {
        String email = payload.get("email") == null ? null : payload.get("email").toString();
        String password = payload.get("password") == null ? null : payload.get("password").toString();
        String phone = payload.get("phone") == null ? null : payload.get("phone").toString();
        String companyName = payload.get("companyName") == null ? payload.get("title") == null ? null : payload.get("title").toString() : payload.get("companyName").toString();
        String founder = payload.get("founder") == null ? null : payload.get("founder").toString();
        String located = payload.get("located") == null ? payload.get("location") == null ? null : payload.get("location").toString() : payload.get("located").toString();
        String website = payload.get("website") == null ? null : payload.get("website").toString();
        String about = payload.get("about") == null ? null : payload.get("about").toString();
        String industry = payload.get("industry") == null ? payload.get("specialization") == null ? null : payload.get("specialization").toString() : payload.get("industry").toString();
        String logo = payload.get("logo") == null ? payload.get("logoUrl") == null ? null : payload.get("logoUrl").toString() : payload.get("logo").toString();
        String verificationStatus = payload.get("verificationStatus") == null ? "UNVERIFIED" : payload.get("verificationStatus").toString();
        return CompanyProfile.builder()
            .email(email)
            .password(password)
            .phone(phone)
            .companyName(companyName)
            .founder(founder)
            .located(located)
            .website(website)
            .about(about)
            .industry(industry)
            .logo(logo)
            .verificationStatus(verificationStatus)
            .build();
    }

    private Map<String, Object> toResponse(CompanyProfile profile) {
        Map<String, Object> response = new HashMap<>();
        response.put("companyId", profile.getCompanyId());
        response.put("email", profile.getEmail());
        response.put("companyName", profile.getCompanyName());
        response.put("title", profile.getCompanyName());
        response.put("founder", profile.getFounder());
        response.put("located", profile.getLocated());
        response.put("location", profile.getLocated());
        response.put("website", profile.getWebsite());
        response.put("about", profile.getAbout());
        response.put("industry", profile.getIndustry());
        response.put("specialization", profile.getIndustry());
        response.put("phone", profile.getPhone());
        response.put("logo", profile.getLogo());
        response.put("logoUrl", profile.getLogo());
        response.put("verificationStatus", profile.getVerificationStatus());
        response.put("businessType", "manufacturer");
        response.put("locatedIn", profile.getLocated());
        response.put("phoneNumbers", profile.getPhone() == null || profile.getPhone().isBlank() ? new String[0] : new String[] { profile.getPhone() });
        response.put("emails", profile.getEmail() == null || profile.getEmail().isBlank() ? new String[0] : new String[] { profile.getEmail() });
        response.put("socialLinks", Map.of("linkedin", "", "twitter", ""));
        return response;
    }

    private BigDecimal parseBigDecimal(Object val) {
        if (val == null) return null;
        try {
            return new BigDecimal(val.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
