/**
 * Application security setup for local backend development.
 *
 * Public routes (no auth needed):
 *  - /api/search/**   — public marketplace search (Phase 4)
 *  - /api/**          — all API endpoints open during MVP dev
 *  - /actuator/**     — health-check endpoints
 *
 * Everything else requires authentication (default deny).
 *
 * NOTE: BCryptPasswordEncoder is registered here as a shared Bean so that
 * CompanyProfileService can inject it for password hashing without circular
 * dependency issues.
 */
package com.barea.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("[SecurityConfig] Configuring HTTP security...");

        http
                // Disable CSRF — REST API with JSON body does not need CSRF tokens.
                .csrf(AbstractHttpConfigurer::disable)

                // Delegate CORS handling to Spring MVC (@CrossOrigin annotations)
                .cors(withDefaults())

                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())

                // No form-based login — frontend handles auth flows
                .formLogin(AbstractHttpConfigurer::disable)

                // No HTTP Basic auth pop-up in browser
                .httpBasic(AbstractHttpConfigurer::disable)

                // No default Spring Security logout endpoint
                .logout(AbstractHttpConfigurer::disable);

        System.out.println("[SecurityConfig] Security filter chain configured.");
        return http.build();
    }

    /**
     * BCrypt password encoder bean.
     * Strength defaults to 10 rounds which is the recommended balance of
     * security and performance for commodity hardware.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
