package com.mediscript.clinic;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.mediscript.clinic.model.ClinicSettings;
import com.mediscript.clinic.model.MedicineTemplate;
import com.mediscript.clinic.model.User;
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
            UserRepository userRepository) {
        return args -> {
            settingsRepository.findById("default").orElseGet(() -> settingsRepository.save(defaultSettings()));

            if (templateRepository.count() == 0) {
                templateRepository.save(new MedicineTemplate("1", "Paracetamol", "500mg", "Twice daily", "5 days", "After food"));
                templateRepository.save(new MedicineTemplate("2", "Amoxicillin", "250mg", "Thrice daily", "7 days", "Complete course"));
                templateRepository.save(new MedicineTemplate("3", "Cetirizine", "10mg", "Once daily", "5 days", "At night"));
            }

            if (userRepository.count() == 0) {
                userRepository.save(new User("doc-1", "dr.smith", "password123", "Dr. Alex Smith", "General Physician", "MD-987654", "(555) 123-4567", "DOCTOR"));
                userRepository.save(new User("doc-2", "dr.johnson", "password123", "Dr. Sarah Johnson", "Consultant Pediatrician", "MD-881245", "(555) 234-5678", "DOCTOR"));
                userRepository.save(new User("doc-3", "dr.patel", "password123", "Dr. Rajesh Patel", "General Surgeon", "MD-772390", "(555) 345-6789", "DOCTOR"));
            }
        };
    }

    private ClinicSettings defaultSettings() {
        ClinicSettings settings = new ClinicSettings();
        settings.setName("City Care Clinic");
        settings.setAddress("123 Health Blvd, Wellness City, ST 12345");
        settings.setPhone("(555) 123-4567");
        settings.setDoctorName("Dr. Alex Smith");
        settings.setSpecialization("General Physician");
        settings.setLicenseNumber("MD-987654");
        settings.setFooterText("Get well soon! Please bring this prescription for your next visit.");
        return settings;
    }
}