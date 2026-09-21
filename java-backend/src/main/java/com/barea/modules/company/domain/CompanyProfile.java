/**
 * Persistence model for a company profile.
 *
 * Maps to the `companies` table created by V2__multi_location_and_expanded_products.sql.
 */
package com.barea.modules.company.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile {

    @Id
    @Column(name = "company_id", nullable = false, updatable = false)
    private UUID companyId;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "phone")
    private String phone;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "founder")
    private String founder;

    @Column(name = "located")
    private String located;

    @Column(name = "website")
    private String website;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "industry")
    private String industry;

    @Column(name = "logo")
    private String logo;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (companyId == null) {
            companyId = UUID.randomUUID();
        }
        if (verificationStatus == null) {
            verificationStatus = "UNVERIFIED";
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        System.out.println("[CompanyProfile] @PrePersist — companyId: " + companyId);
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
        System.out.println("[CompanyProfile] @PreUpdate — companyId: " + companyId);
    }
}
