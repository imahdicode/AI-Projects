package com.mediscript.clinic.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.User;
import com.mediscript.clinic.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ── LOGIN ──────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.authenticate(request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ── GET ALL DOCTORS (role = DOCTOR only, excludes admin) ───────────────
    @GetMapping("/doctors")
    public List<User> getDoctors() {
        return authService.getDoctors();
    }

    // ── REGISTER DOCTOR (admin only — creates PENDING account) ─────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(@RequestBody RegisterRequest req) {
        try {
            User doctor = authService.registerDoctor(req);
            return ResponseEntity.ok(doctor);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── ACTIVATE ACCOUNT (doctor's first login — sets username + password) ──
    @PostMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestBody ActivateRequest req) {
        try {
            User doctor = authService.activateAccount(req);
            return ResponseEntity.ok(doctor);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── DELETE DOCTOR BY ID / USERNAME / LICENSE ────────────────────────────
    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctorById(@PathVariable String id) {
        authService.deleteDoctor(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/doctors/username/{username}")
    public ResponseEntity<?> deleteDoctorByUsername(@PathVariable String username) {
        authService.deleteDoctor(username);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/doctors/license/{licenseNumber}")
    public ResponseEntity<?> deleteDoctorByLicense(@PathVariable String licenseNumber) {
        authService.deleteDoctor(licenseNumber);
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