/**
 * Core application service for managing company accounts.
 *
 * This layer is intentionally thin and acts as the transaction boundary between
 * the REST layer and the database repository. It centralizes validation-like
 * business logic, updates, and delete operations without leaking persistence
 * details into the controller.
 */
package com.barea.modules.company.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barea.modules.company.domain.CompanyProfile;
import com.barea.modules.company.repository.CompanyProfileRepository;

@Service
public class CompanyProfileService {

    private final CompanyProfileRepository companyProfileRepository;

    public CompanyProfileService(CompanyProfileRepository companyProfileRepository) {
        this.companyProfileRepository = companyProfileRepository;
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
        return companyProfileRepository.save(companyProfile);
    }

    @Transactional
    public CompanyProfile updateProfile(UUID companyId, CompanyProfile updatedProfile) {
        CompanyProfile existing = companyProfileRepository.findById(companyId)
            .orElseThrow(() -> new IllegalArgumentException("Company profile not found for id: " + companyId));

        existing.setEmail(updatedProfile.getEmail() != null ? updatedProfile.getEmail() : existing.getEmail());
        existing.setPassword(updatedProfile.getPassword() != null ? updatedProfile.getPassword() : existing.getPassword());
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
