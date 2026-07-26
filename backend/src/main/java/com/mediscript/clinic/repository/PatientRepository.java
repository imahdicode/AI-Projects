package com.mediscript.clinic.repository;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mediscript.clinic.model.Patient;

public interface PatientRepository extends JpaRepository<Patient, String> {
    List<Patient> findByDoctorId(String doctorId);
    List<Patient> findByDoctorId(String doctorId, Pageable pageable);
    
    @Query("SELECT p FROM Patient p WHERE p.doctorId IN :doctorIds OR p.doctorId IS NULL OR p.doctorId = ''")
    List<Patient> findAccessiblePatients(@Param("doctorIds") List<String> doctorIds);

    long countByDoctorId(String doctorId);
}