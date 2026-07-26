package com.mediscript.clinic.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mediscript.clinic.controller.AuthController.ActivateRequest;
import com.mediscript.clinic.controller.AuthController.LoginRequest;
import com.mediscript.clinic.controller.AuthController.RegisterRequest;
import com.mediscript.clinic.model.User;
import com.mediscript.clinic.repository.UserRepository;
import com.mediscript.clinic.security.JwtUtils;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public User authenticate(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username or license number is required.");
        }

        String inputKey = request.getUsername().trim();
        User user = userRepository.findByUsernameIgnoreCase(inputKey)
                .orElseGet(() -> userRepository.findByLicenseNumberIgnoreCase(inputKey).orElse(null));

        if (user == null) {
            throw new IllegalArgumentException("No account found matching '" + inputKey + "'.");
        }

        if ("PENDING".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Account not yet activated. Please use 'First Login' tab to set your username and password.");
        }

        String expectedPassword = user.getPassword() != null ? user.getPassword() : "";
        String providedPassword = request.getPassword() != null ? request.getPassword() : "";

        boolean matches = passwordEncoder.matches(providedPassword, expectedPassword);
        if (!matches && expectedPassword.equals(providedPassword)) {
            matches = true;
            user.setPassword(passwordEncoder.encode(providedPassword));
            userRepository.save(user);
        }

        if (!matches) {
            throw new IllegalArgumentException("Incorrect password.");
        }

        user.setToken(jwtUtils.generateToken(user));
        return user;
    }

    public List<User> getDoctors() {
        return userRepository.findByRole("DOCTOR");
    }

    public User registerDoctor(RegisterRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Doctor name is required.");
        }
        if (req.getLicenseNumber() == null || req.getLicenseNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("License number is required.");
        }

        String cleanLicense = req.getLicenseNumber().trim();
        if (userRepository.findByLicenseNumberIgnoreCase(cleanLicense).isPresent()) {
            throw new IllegalArgumentException("A doctor with license number '" + cleanLicense + "' already exists.");
        }

        User doctor = new User();
        doctor.setId("doc-" + UUID.randomUUID().toString().substring(0, 8));
        doctor.setName(req.getName().trim());
        doctor.setSpecialization(req.getSpecialization() != null && !req.getSpecialization().trim().isEmpty() ? req.getSpecialization().trim() : "General Physician");
        doctor.setLicenseNumber(cleanLicense);
        doctor.setPhone(req.getPhone() != null ? req.getPhone().trim() : "");
        doctor.setAssignedBranchId(req.getAssignedBranchId());
        doctor.setRole("DOCTOR");
        doctor.setStatus("PENDING");

        return userRepository.save(doctor);
    }

    public User activateAccount(ActivateRequest req) {
        if (req.getLicenseNumber() == null || req.getLicenseNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("License number is required.");
        }
        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (req.getPassword() == null || req.getPassword().trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        String cleanLicense = req.getLicenseNumber().trim();
        String cleanUsername = req.getUsername().trim().toLowerCase();

        User doctor = userRepository.findByLicenseNumberIgnoreCaseAndStatus(cleanLicense, "PENDING")
                .orElseThrow(() -> new IllegalArgumentException("No pending account found for license '" + cleanLicense + "'."));

        if (userRepository.findByUsernameIgnoreCase(cleanUsername).isPresent()) {
            throw new IllegalArgumentException("Username '" + cleanUsername + "' is already taken. Please choose another username.");
        }

        doctor.setUsername(cleanUsername);
        doctor.setPassword(passwordEncoder.encode(req.getPassword()));
        doctor.setStatus("ACTIVE");

        User saved = userRepository.save(doctor);
        saved.setToken(jwtUtils.generateToken(saved));
        return saved;
    }

    public void deleteDoctor(String key) {
        userRepository.findById(key).ifPresent(userRepository::delete);
        userRepository.findByUsernameIgnoreCase(key).ifPresent(userRepository::delete);
        userRepository.findByLicenseNumberIgnoreCase(key).ifPresent(userRepository::delete);
    }
}
