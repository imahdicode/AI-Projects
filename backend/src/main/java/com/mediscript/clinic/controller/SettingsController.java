package com.mediscript.clinic.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.ClinicSettings;
import com.mediscript.clinic.repository.ClinicSettingsRepository;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final ClinicSettingsRepository settingsRepository;

    public SettingsController(ClinicSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @GetMapping
    public ClinicSettings get() {
        return settingsRepository.findById("default").orElseGet(() -> settingsRepository.save(new ClinicSettings()));
    }

    @PutMapping
    public ClinicSettings save(@RequestBody ClinicSettings settings) {
        settings.setId("default");
        return settingsRepository.save(settings);
    }
}