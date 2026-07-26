package com.mediscript.clinic.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.User;
import com.mediscript.clinic.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ── LOGIN ──────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username or license number is required.");
        }

        String inputKey = request.getUsername().trim();

        // 1. Search by username (case-insensitive)
        User user = userRepository.findByUsernameIgnoreCase(inputKey).orElse(null);

        // 2. Fallback: Search by license number (case-insensitive)
        if (user == null) {
            user = userRepository.findByLicenseNumberIgnoreCase(inputKey).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.status(401).body("No account found matching '" + inputKey + "'.");
        }

        // Reject PENDING accounts — they must activate first
        if ("PENDING".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(403).body(
                "Account not yet activated. Please use 'First Login' tab to set your username and password."
            );
        }

        // Password check (plain text comparison for clinic internal use)
        String expectedPassword = user.getPassword() != null ? user.getPassword() : "";
        String providedPassword = request.getPassword() != null ? request.getPassword() : "";

        if (!expectedPassword.equals(providedPassword)) {
            return ResponseEntity.status(401).body("Incorrect password.");
        }

        return ResponseEntity.ok(user);
    }

    // ── GET ALL DOCTORS (role = DOCTOR only, excludes admin) ───────────────
    @GetMapping("/doctors")
    public List<User> getDoctors() {
        return userRepository.findByRole("DOCTOR");
    }

    // ── REGISTER DOCTOR (admin only — creates PENDING account) ─────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(@RequestBody RegisterRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Doctor name is required.");
        }
        if (req.getLicenseNumber() == null || req.getLicenseNumber().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("License number is required.");
        }

        String cleanLicense = req.getLicenseNumber().trim();

        // Validate license number is unique
        if (userRepository.findByLicenseNumberIgnoreCase(cleanLicense).isPresent()) {
            return ResponseEntity.badRequest().body("A doctor with license number '" + cleanLicense + "' already exists.");
        }

        User doctor = new User();
        long nextId = userRepository.count() + 101;
        doctor.setId("doc-" + nextId);
        doctor.setName(req.getName().trim());
        doctor.setSpecialization(req.getSpecialization() != null && !req.getSpecialization().trim().isEmpty() ? req.getSpecialization().trim() : "General Physician");
        doctor.setLicenseNumber(cleanLicense);
        doctor.setPhone(req.getPhone() != null ? req.getPhone().trim() : "");
        doctor.setAssignedBranchId(req.getAssignedBranchId());
        doctor.setRole("DOCTOR");
        doctor.setStatus("PENDING"); // Must activate via /activate before they can log in

        return ResponseEntity.ok(userRepository.save(doctor));
    }

    // ── ACTIVATE ACCOUNT (doctor's first login — sets username + password) ──
    @PostMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestBody ActivateRequest req) {
        if (req.getLicenseNumber() == null || req.getLicenseNumber().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("License number is required.");
        }
        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required.");
        }
        if (req.getPassword() == null || req.getPassword().trim().length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters long.");
        }

        String cleanLicense = req.getLicenseNumber().trim();
        String cleanUsername = req.getUsername().trim().toLowerCase();

        // Find PENDING doctor by license number
        User doctor = userRepository.findByLicenseNumberIgnoreCaseAndStatus(cleanLicense, "PENDING").orElse(null);

        if (doctor == null) {
            return ResponseEntity.status(404).body(
                "No pending account found for license '" + cleanLicense + "'. " +
                "It may have already been activated or the license number is invalid."
            );
        }

        // Check username is not already taken
        if (userRepository.findByUsernameIgnoreCase(cleanUsername).isPresent()) {
            return ResponseEntity.badRequest().body(
                "Username '" + cleanUsername + "' is already taken. Please choose another username."
            );
        }

        // Activate the account
        doctor.setUsername(cleanUsername);
        doctor.setPassword(req.getPassword());
        doctor.setStatus("ACTIVE");

        return ResponseEntity.ok(userRepository.save(doctor));
    }

    // ── DELETE DOCTOR BY ID ────────────────────────────────────────────────
    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctorById(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── DELETE DOCTOR BY USERNAME ──────────────────────────────────────────
    @DeleteMapping("/doctors/username/{username}")
    public ResponseEntity<?> deleteDoctorByUsername(@PathVariable String username) {
        userRepository.findByUsernameIgnoreCase(username).ifPresent(userRepository::delete);
        return ResponseEntity.ok().build();
    }

    // ── DELETE DOCTOR BY LICENSE NUMBER ────────────────────────────────────
    @DeleteMapping("/doctors/license/{licenseNumber}")
    public ResponseEntity<?> deleteDoctorByLicense(@PathVariable String licenseNumber) {
        userRepository.findByLicenseNumberIgnoreCase(licenseNumber).ifPresent(userRepository::delete);
        return ResponseEntity.ok().build();
    }

    // ── REQUEST DTOs ───────────────────────────────────────────────────────
    public static class LoginRequest {
        private String username;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String name;
        private String specialization;
        private String licenseNumber;
        private String phone;
        private String assignedBranchId;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String s) { this.specialization = s; }
        public String getLicenseNumber() { return licenseNumber; }
        public void setLicenseNumber(String l) { this.licenseNumber = l; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAssignedBranchId() { return assignedBranchId; }
        public void setAssignedBranchId(String id) { this.assignedBranchId = id; }
    }

    public static class ActivateRequest {
        private String licenseNumber;
        private String username;
        private String password;
        public String getLicenseNumber() { return licenseNumber; }
        public void setLicenseNumber(String l) { this.licenseNumber = l; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}