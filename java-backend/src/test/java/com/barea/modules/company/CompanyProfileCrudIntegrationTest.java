/**
 * Regression test for the company profile CRUD flow.
 *
 * This test proves that a company profile can be created and retrieved through
 * the repository layer, which is the minimal persistence contract required for
 * the registration/profile workflow.
 */
package com.barea.modules.company;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.barea.modules.company.domain.CompanyProfile;
import com.barea.modules.company.repository.CompanyProfileRepository;

@SpringBootTest
@ActiveProfiles("test")
class CompanyProfileCrudIntegrationTest {

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Test
    void saveAndRetrieveCompanyProfile() {
        CompanyProfile company = CompanyProfile.builder()
                .email("sales@apexnexus.com")
                .password("secret123")
                .companyName("Apex Nexus")
                .founder("Jane Doe")
                .located("Mumbai, India")
                .website("https://apexnexus.com")
                .about("Enterprise solution provider")
                .industry("IT & Software")
                .phone("+91 98765 43210")
                .logo("https://cdn.example.com/logo.png")
                .build();

        CompanyProfile saved = companyProfileRepository.save(company);

        assertThat(saved.getCompanyId()).isNotNull();
        Optional<CompanyProfile> found = companyProfileRepository.findById(saved.getCompanyId());
        assertThat(found).isPresent();
        assertThat(companyProfileRepository.findByEmail("sales@apexnexus.com")).isPresent();
    }
}
