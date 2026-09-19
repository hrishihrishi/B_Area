/**
 * Application security setup for local backend development.
 *
 * The project currently allows the public API endpoints used by the Next.js app
 * to communicate with the Java backend during development. This keeps the flow
 * simple while still preserving a secured default for any non-API routes.
 */
package com.barea.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
// Enables Spring Security's web security support and integrates it with Spring MVC
@EnableWebSecurity
public class SecurityConfig {

    // Registers the returned SecurityFilterChain as a Spring Bean to handle HTTP request filtering
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // disables cross-site request forgery
            .csrf(AbstractHttpConfigurer::disable)
            // url based authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**", "/actuator/**").permitAll()
                .anyRequest().authenticated()
                )
            // disables form login
                .formLogin(AbstractHttpConfigurer::disable)
            // disbales browser pop-up login
                .httpBasic(AbstractHttpConfigurer::disable)
            // diables default logout endpoint provided by spring security
            .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
