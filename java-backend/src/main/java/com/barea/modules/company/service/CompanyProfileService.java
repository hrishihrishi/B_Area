/**
 * Core application service for managing company accounts.
 *
 * This layer is intentionally thin and acts as the transaction boundary between
 * the REST layer and the database repository. It centralizes validation-like
 * business logic, updates, and delete operations without leaking persistence
 * details into the controller.
 *
 * SECURITY NOTE: Passwords are ALWAYS hashed via BCryptPasswordEncoder before
 * being written to the database. Plain-text passwords never reach the DB layer.
 */
package com.barea.modules.company.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barea.modules.company.domain.CompanyProfile;
import com.barea.modules.company.repository.CompanyProfileRepository;

@Service
public class CompanyProfileService {

    private final CompanyProfileRepository companyProfileRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor injection — both dependencies are Spring-managed beans.
    public CompanyProfileService(
            CompanyProfileRepository companyProfileRepository,
            PasswordEncoder passwordEncoder) {
        this.companyProfileRepository = companyProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<CompanyProfile> getAllProfiles() {
        return companyProfileRepository.findAll();
    }

    public Optional<CompanyProfile> getProfileById(UUID companyId) {
        return companyProfileRepository.findById(companyId);
    }

    public Optional<CompanyProfile> getProfileByEmail(String email) {
        return companyProfileRepository.findByEmail(email);
    }

    @Transactional
    public CompanyProfile createProfile(CompanyProfile companyProfile) {
        // Hash the plain-text password before persisting.
        // This is the ONE place passwords are hashed — keeps the controller clean.
        System.out.println("[CompanyProfileService] createProfile() called for email: " + companyProfile.getEmail());
        if (companyProfile.getPassword() != null && !companyProfile.getPassword().isBlank()) {
            System.out.println("[CompanyProfileService] Hashing password before save.");
            companyProfile.setPassword(passwordEncoder.encode(companyProfile.getPassword()));
        }
        return companyProfileRepository.save(companyProfile);
    }

    @Transactional
    public CompanyProfile updateProfile(UUID companyId, CompanyProfile updatedProfile) {
        System.out.println("[CompanyProfileService] updateProfile() called for companyId: " + companyId);

        CompanyProfile existing = companyProfileRepository.findById(companyId)
            .orElseThrow(() -> new IllegalArgumentException("Company profile not found for id: " + companyId));

        existing.setEmail(updatedProfile.getEmail() != null ? updatedProfile.getEmail() : existing.getEmail());

        // Only re-hash if a new plain-text password was supplied.
        // An empty/null password field means "keep existing hash" — avoids hashing an empty string.
        if (updatedProfile.getPassword() != null && !updatedProfile.getPassword().isBlank()) {
            System.out.println("[CompanyProfileService] New password detected — re-hashing.");
            existing.setPassword(passwordEncoder.encode(updatedProfile.getPassword()));
        }

        existing.setPhone(updatedProfile.getPhone() != null ? updatedProfile.getPhone() : existing.getPhone());
        existing.setCompanyName(updatedProfile.getCompanyName() != null ? updatedProfile.getCompanyName() : existing.getCompanyName());
        existing.setFounder(updatedProfile.getFounder() != null ? updatedProfile.getFounder() : existing.getFounder());
        existing.setLocated(updatedProfile.getLocated() != null ? updatedProfile.getLocated() : existing.getLocated());
        existing.setWebsite(updatedProfile.getWebsite() != null ? updatedProfile.getWebsite() : existing.getWebsite());
        existing.setAbout(updatedProfile.getAbout() != null ? updatedProfile.getAbout() : existing.getAbout());
        existing.setIndustry(updatedProfile.getIndustry() != null ? updatedProfile.getIndustry() : existing.getIndustry());
        existing.setLogo(updatedProfile.getLogo() != null ? updatedProfile.getLogo() : existing.getLogo());

        return companyProfileRepository.save(existing);
    }

    @Transactional
    public void deleteProfile(UUID companyId) {
        companyProfileRepository.deleteById(companyId);
    }
}
