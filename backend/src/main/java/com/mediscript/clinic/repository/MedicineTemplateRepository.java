package com.mediscript.clinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mediscript.clinic.model.MedicineTemplate;

public interface MedicineTemplateRepository extends JpaRepository<MedicineTemplate, String> {
}