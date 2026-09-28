package com.barea.modules.company.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.barea.modules.company.domain.CompanyProfile;
import com.barea.modules.company.service.CompanyProfileService;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowedHeaders = "*", methods = {RequestMethod.POST, RequestMethod.OPTIONS})
@RequestMapping("/api/auth")
public class AuthController {

    private final CompanyProfileService companyProfileService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(CompanyProfileService companyProfileService, PasswordEncoder passwordEncoder) {
        this.companyProfileService = companyProfileService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        System.out.println("[AuthController] POST /api/auth/login for email: " + email);

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<CompanyProfile> profileOpt = companyProfileService.getProfileByEmail(email);
        if (profileOpt.isEmpty()) {
            System.out.println("[AuthController] Account not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Account not found"));
        }

        CompanyProfile profile = profileOpt.get();

        // Check password matching if password is set on profile
        if (profile.getPassword() != null && !profile.getPassword().isBlank()) {
            boolean matches = passwordEncoder.matches(password, profile.getPassword());
            if (!matches) {
                System.out.println("[AuthController] Invalid password for email: " + email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("companyId", profile.getCompanyId());
        response.put("email", profile.getEmail());
        response.put("companyName", profile.getCompanyName());
        response.put("name", profile.getFounder());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPassword = body.get("newPassword");

        System.out.println("[AuthController] POST /api/auth/reset-password for email: " + email);

        if (email == null || email.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and newPassword are required"));
        }

        Optional<CompanyProfile> profileOpt = companyProfileService.getProfileByEmail(email);
        if (profileOpt.isEmpty()) {
            System.out.println("[AuthController] Account not found for password reset, email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Account not found"));
        }

        CompanyProfile profile = profileOpt.get();
        profile.setPassword(newPassword); // Will be encoded by updateProfile
        companyProfileService.updateProfile(profile.getCompanyId(), profile);

        System.out.println("[AuthController] Password updated successfully for email: " + email);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
