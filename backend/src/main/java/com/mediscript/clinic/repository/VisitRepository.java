package com.mediscript.clinic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mediscript.clinic.model.Visit;

public interface VisitRepository extends JpaRepository<Visit, String> {

    List<Visit> findByPatientIdOrderByDateDesc(String patientId);

    List<Visit> findAllByOrderByDateDesc();

    List<Visit> findByDoctorIdOrderByDateDesc(String doctorId);

    void deleteByPatientId(String patientId);
}