package com.mediscript.clinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mediscript.clinic.model.ClinicSettings;

public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, String> {
}