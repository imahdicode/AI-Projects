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
            return ResponseEntity.badRequest().body("Username is required.");
        }

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

        // Also allow login by license number (in case doctor forgets their username)
        if (user == null) {
            user = userRepository.findByLicenseNumber(request.getUsername()).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.status(401).body("No account found with that username.");
        }

        // Reject PENDING accounts — they must activate first
        if ("PENDING".equals(user.getStatus())) {
            return ResponseEntity.status(403).body(
                "Account not yet activated. Please use 'First Login' to set your username and password."
            );
        }

        // Password check (plain text comparison — fine for internal clinic system)
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            if (!user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.status(401).body("Incorrect password.");
            }
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
        // Validate license number is unique
        if (req.getLicenseNumber() != null && !req.getLicenseNumber().trim().isEmpty()) {
            if (userRepository.findByLicenseNumber(req.getLicenseNumber().trim()).isPresent()) {
                return ResponseEntity.badRequest().body("A doctor with this license number already exists.");
            }
        }

        User doctor = new User();
        long nextId = userRepository.count() + 1;
        doctor.setId(String.valueOf(nextId));
        doctor.setName(req.getName());
        doctor.setSpecialization(req.getSpecialization() != null ? req.getSpecialization() : "General Physician");
        doctor.setLicenseNumber(req.getLicenseNumber());
        doctor.setPhone(req.getPhone());
        doctor.setAssignedBranchId(req.getAssignedBranchId());
        doctor.setRole("DOCTOR");
        doctor.setStatus("PENDING"); // Must activate via /activate before they can log in
        // Username and password are NOT set by admin — doctor sets them on first login

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
            return ResponseEntity.badRequest().body("Password must be at least 6 characters.");
        }

        // Find PENDING doctor by license number
        User doctor = userRepository.findByLicenseNumberAndStatus(
            req.getLicenseNumber().trim(), "PENDING"
        ).orElse(null);

        if (doctor == null) {
            return ResponseEntity.status(404).body(
                "No pending account found for that license number. " +
                "Either it was already activated or the license number is incorrect."
            );
        }

        // Check username is not already taken
        if (userRepository.findByUsername(req.getUsername().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(
                "Username '" + req.getUsername() + "' is already taken. Please choose another."
            );
        }

        // Activate the account
        doctor.setUsername(req.getUsername().trim().toLowerCase());
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
        userRepository.findByUsername(username).ifPresent(userRepository::delete);
        return ResponseEntity.ok().build();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return "Doctor";
        return "Dr. " + str.substring(0, 1).toUpperCase() + str.substring(1);
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