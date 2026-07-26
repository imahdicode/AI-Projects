package com.mediscript.clinic.repository;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.mediscript.clinic.model.Patient;

public interface PatientRepository extends JpaRepository<Patient, String> {
    List<Patient> findByDoctorId(String doctorId);
    List<Patient> findByDoctorId(String doctorId, Pageable pageable);
    long countByDoctorId(String doctorId);
}