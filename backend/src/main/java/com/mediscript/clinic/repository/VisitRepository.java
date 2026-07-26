package com.mediscript.clinic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.mediscript.clinic.model.Visit;

public interface VisitRepository extends JpaRepository<Visit, String> {

    List<Visit> findByPatientIdOrderByDateDesc(String patientId);

    List<Visit> findAllByOrderByDateDesc();

    List<Visit> findByDoctorIdOrderByDateDesc(String doctorId);

    @Transactional
    @Modifying
    void deleteByPatientId(String patientId);
}