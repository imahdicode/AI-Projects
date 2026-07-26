package com.mediscript.clinic;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.mediscript.clinic.model.ClinicBranch;
import com.mediscript.clinic.model.ClinicSettings;
import com.mediscript.clinic.model.MedicineTemplate;
import com.mediscript.clinic.model.User;
import com.mediscript.clinic.repository.ClinicBranchRepository;
import com.mediscript.clinic.repository.ClinicSettingsRepository;
import com.mediscript.clinic.repository.MedicineTemplateRepository;
import com.mediscript.clinic.repository.UserRepository;

@SpringBootApplication
public class ClinicApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicApplication.class, args);
    }

    @Bean
    CommandLineRunner seedData(
            ClinicSettingsRepository settingsRepository, 
            MedicineTemplateRepository templateRepository,
            UserRepository userRepository,
            ClinicBranchRepository branchRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Clinic Settings
            settingsRepository.findById("default").orElseGet(() -> settingsRepository.save(defaultSettings()));

            // Seed Medicine Templates
            if (templateRepository.count() == 0) {
                templateRepository.save(new MedicineTemplate("1", "Paracetamol", "500mg", "Twice daily", "5 days", "After food"));
                templateRepository.save(new MedicineTemplate("2", "Amoxicillin", "250mg", "Thrice daily", "7 days", "Complete course"));
                templateRepository.save(new MedicineTemplate("3", "Cetirizine", "10mg", "Once daily", "5 days", "At night"));
            }

            // Seed Clinic Branches
            if (branchRepository.count() == 0) {
                branchRepository.save(new ClinicBranch("branch-1", "MediScript Main Clinic - Connaught Place", "ND-01", "123 MG Road, Connaught Place, New Delhi", "+91 98765 43210", 2, "ACTIVE"));
                branchRepository.save(new ClinicBranch("branch-2", "City Care Polyclinic - Park Street", "KO-02", "45 Park Street, Chowringhee, Kolkata", "+91 98123 45678", 1, "ACTIVE"));
                branchRepository.save(new ClinicBranch("branch-3", "Aarogya Health Center - Indiranagar", "BLR-03", "12 Indiranagar 100ft Road, Bengaluru", "+91 97654 32109", 1, "ACTIVE"));
            }

            // Ensure Super Admin 'mahdi' exists in database
            if (userRepository.findByUsernameIgnoreCase("mahdi").isEmpty()) {
                User admin = new User("1", "mahdi", passwordEncoder.encode("admin123"), "Mahdi (Super Admin)", "System Administrator & Owner", "ADMIN-001", "+91 99000 00000", "ADMIN");
                admin.setStatus("ACTIVE");
                admin.setAssignedBranchId("branch-1");
                userRepository.save(admin);
            } else {
                User admin = userRepository.findByUsernameIgnoreCase("mahdi").get();
                if (!admin.getPassword().startsWith("$2a$") && !admin.getPassword().startsWith("$2b$")) {
                    admin.setPassword(passwordEncoder.encode(admin.getPassword()));
                    userRepository.save(admin);
                }
            }

            // Ensure Doctor 'farid' exists in database
            if (userRepository.findByUsernameIgnoreCase("farid").isEmpty()) {
                User docFarid = new User("2", "farid", passwordEncoder.encode("password123"), "Dr. Farid Ansari", "General Physician", "MCI-2026-4469", "+91 98765 11111", "DOCTOR");
                docFarid.setStatus("ACTIVE");
                docFarid.setAssignedBranchId("branch-1");
                userRepository.save(docFarid);
            } else {
                User docFarid = userRepository.findByUsernameIgnoreCase("farid").get();
                if (!docFarid.getPassword().startsWith("$2a$") && !docFarid.getPassword().startsWith("$2b$")) {
                    docFarid.setPassword(passwordEncoder.encode(docFarid.getPassword()));
                    userRepository.save(docFarid);
                }
            }

            // Ensure Doctor 'shoeb' exists in database
            if (userRepository.findByUsernameIgnoreCase("shoeb").isEmpty()) {
                User docShoeb = new User("3", "shoeb", passwordEncoder.encode("password123"), "Dr. Shoeb", "Consultant Physician", "MCI-2026-5865", "+91 98765 22222", "DOCTOR");
                docShoeb.setStatus("ACTIVE");
                docShoeb.setAssignedBranchId("branch-2");
                userRepository.save(docShoeb);
            } else {
                User docShoeb = userRepository.findByUsernameIgnoreCase("shoeb").get();
                if (!docShoeb.getPassword().startsWith("$2a$") && !docShoeb.getPassword().startsWith("$2b$")) {
                    docShoeb.setPassword(passwordEncoder.encode(docShoeb.getPassword()));
                    userRepository.save(docShoeb);
                }
            }
        };
    }

    private ClinicSettings defaultSettings() {
        ClinicSettings settings = new ClinicSettings();
        settings.setName("MediScript Main Clinic");
        settings.setAddress("123 MG Road, Connaught Place, New Delhi");
        settings.setPhone("+91 98765 43210");
        settings.setDoctorName("Mahdi (Super Admin)");
        settings.setSpecialization("System Administrator & Owner");
        settings.setLicenseNumber("ADMIN-001");
        settings.setFooterText("Get well soon! Please bring this prescription for your next visit.");
        return settings;
    }
}