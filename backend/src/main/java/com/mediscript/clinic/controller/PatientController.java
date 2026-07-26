package com.mediscript.clinic.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.Patient;
import com.mediscript.clinic.model.Visit;
import com.mediscript.clinic.service.PatientService;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // ── GET ALL PATIENTS ───────────────────────────────────────────────────
    @GetMapping
    public List<Patient> list(
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        return patientService.listPatients(doctorId, role);
    }

    // ── GET SINGLE PATIENT ─────────────────────────────────────────────────
    @GetMapping("/{id}")
    public Patient get(
        @PathVariable String id,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        return patientService.getPatient(id, doctorId, role);
    }

    // ── CREATE PATIENT ─────────────────────────────────────────────────────
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(
        @Valid @RequestBody Patient patient,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        return patientService.createPatient(patient, doctorId, role);
    }

    // ── UPDATE PATIENT ─────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public Patient update(
        @PathVariable String id,
        @Valid @RequestBody Patient patient,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        return patientService.updatePatient(id, patient, doctorId, role);
    }

    // ── DELETE PATIENT ─────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable String id,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        patientService.deletePatient(id, doctorId, role);
    }

    // ── GET PATIENT VISITS ─────────────────────────────────────────────────
    @GetMapping("/{id}/visits")
    public List<Visit> visits(
        @PathVariable String id,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        return patientService.getPatientVisits(id, doctorId, role);
    }

    // ── CREATE VISIT ───────────────────────────────────────────────────────
    @PostMapping("/{id}/visits")
    @ResponseStatus(HttpStatus.CREATED)
    public Visit createVisit(
        @PathVariable String id,
        @RequestBody Visit visit,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        return patientService.createVisit(id, visit, doctorId, role);
    }
    }
}