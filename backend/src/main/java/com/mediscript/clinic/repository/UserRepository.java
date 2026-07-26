package com.mediscript.clinic.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mediscript.clinic.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);
    List<User> findByRole(String role);
    Optional<User> findByLicenseNumber(String licenseNumber);
    Optional<User> findByLicenseNumberIgnoreCase(String licenseNumber);
    Optional<User> findByLicenseNumberAndStatus(String licenseNumber, String status);
    Optional<User> findByLicenseNumberIgnoreCaseAndStatus(String licenseNumber, String status);
}
