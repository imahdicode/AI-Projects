package com.mediscript.clinic.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
import com.mediscript.clinic.repository.PatientRepository;
import com.mediscript.clinic.repository.VisitRepository;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public PatientController(PatientRepository patientRepository, VisitRepository visitRepository) {
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
    }

    // ── GET ALL PATIENTS ───────────────────────────────────────────────────
    // Admin sees everyone; doctors see only their own patients
    @GetMapping
    public List<Patient> list(
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        if ("ADMIN".equals(role)) {
            return patientRepository.findAll();
        }
        if (doctorId != null && !doctorId.isBlank()) {
            return patientRepository.findByDoctorId(doctorId);
        }
        return List.of(); // No identity = no data
    }

    // ── GET SINGLE PATIENT ─────────────────────────────────────────────────
    @GetMapping("/{id}")
    public Patient get(
        @PathVariable String id,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Access check: doctors can only access their own patients
        if (!"ADMIN".equals(role) && doctorId != null && !doctorId.equals(patient.getDoctorId())) {
            throw new ResourceNotFoundException("Patient not found");
        }
        return patient;
    }

    // ── CREATE PATIENT ─────────────────────────────────────────────────────
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(
        @RequestBody Patient patient,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        if (patient.getId() == null || patient.getId().isBlank()) {
            long nextNum = 1001 + patientRepository.count();
            patient.setId("P-" + nextNum);
        }
        if (patient.getCreatedAt() == null) {
            patient.setCreatedAt(LocalDateTime.now());
        }
        // Assign patient to the creating doctor (admin's patients get id "1")
        if (patient.getDoctorId() == null || patient.getDoctorId().isBlank()) {
            patient.setDoctorId(doctorId != null ? doctorId : "1");
        }
        return patientRepository.save(patient);
    }

    // ── UPDATE PATIENT ─────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public Patient update(
        @PathVariable String id,
        @RequestBody Patient patient,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        Patient existing = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Access check
        if (!"ADMIN".equals(role) && doctorId != null && !doctorId.equals(existing.getDoctorId())) {
            throw new ResourceNotFoundException("Patient not found");
        }

        patient.setId(id);
        // Preserve the original doctorId — don't let it get overwritten
        if (patient.getDoctorId() == null || patient.getDoctorId().isBlank()) {
            patient.setDoctorId(existing.getDoctorId());
        }
        return patientRepository.save(patient);
    }

    // ── DELETE PATIENT ─────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable String id,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        Patient existing = patientRepository.findById(id).orElse(null);
        if (existing != null) {
            // Access check
            if (!"ADMIN".equals(role) && doctorId != null && !doctorId.equals(existing.getDoctorId())) {
                throw new ResourceNotFoundException("Patient not found");
            }
            visitRepository.deleteByPatientId(id);
            patientRepository.deleteById(id);
        }
    }

    // ── GET PATIENT VISITS ─────────────────────────────────────────────────
    @GetMapping("/{id}/visits")
    public List<Visit> visits(
        @PathVariable String id,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        // Verify patient access first
        Patient patient = patientRepository.findById(id).orElse(null);
        if (patient != null && !"ADMIN".equals(role) && doctorId != null && !doctorId.equals(patient.getDoctorId())) {
            return List.of();
        }
        return visitRepository.findByPatientIdOrderByDateDesc(id);
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
        visit.setId(visit.getId() == null || visit.getId().isBlank() ? UUID.randomUUID().toString() : visit.getId());
        visit.setPatientId(id);
        if (visit.getDate() == null) {
            visit.setDate(LocalDateTime.now());
        }
        // Stamp the visit with the creating doctor's ID
        if (visit.getDoctorId() == null || visit.getDoctorId().isBlank()) {
            visit.setDoctorId(doctorId);
        }
        return visitRepository.save(visit);
    }
}