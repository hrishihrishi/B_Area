/**
 * Spring Data repository for company profile persistence.
 * [KNOW MORE]
 * This repository exposes the query methods needed by the service layer for
 * lookup-by-email and lookup-by-id operations without embedding database logic
 * elsewhere in the codebase.
 */
package com.barea.modules.company.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.barea.modules.company.domain.CompanyProfile;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, UUID> {
    Optional<CompanyProfile> findByEmail(String email);
}
