package com.mediscript.clinic.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mediscript.clinic.controller.ResourceNotFoundException;
import com.mediscript.clinic.model.Patient;
import com.mediscript.clinic.model.Visit;
import com.mediscript.clinic.repository.PatientRepository;
import com.mediscript.clinic.repository.VisitRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public PatientService(PatientRepository patientRepository, VisitRepository visitRepository) {
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
    }

    public List<Patient> listPatients(String doctorId, String role) {
        if ("ADMIN".equalsIgnoreCase(role) || doctorId == null || doctorId.isBlank()) {
            return patientRepository.findAll();
        }
        return patientRepository.findAccessiblePatients(List.of(doctorId, "1"));
    }

    public Patient getPatient(String id, String doctorId, String role) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }

    public Patient createPatient(Patient patient, String doctorId, String role) {
        if (patient.getId() == null || patient.getId().isBlank()) {
            patient.setId("P-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (patient.getCreatedAt() == null) {
            patient.setCreatedAt(LocalDateTime.now());
        }
        if (doctorId != null && !doctorId.isBlank()) {
            patient.setDoctorId(doctorId);
        } else if (patient.getDoctorId() == null || patient.getDoctorId().isBlank()) {
            patient.setDoctorId("1");
        }
        return patientRepository.save(patient);
    }

    public Patient updatePatient(String id, Patient patient, String doctorId, String role) {
        Patient existing = getPatient(id, doctorId, role);
        patient.setId(id);
        if (patient.getDoctorId() == null || patient.getDoctorId().isBlank()) {
            patient.setDoctorId(existing.getDoctorId());
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public void deletePatient(String id, String doctorId, String role) {
        Patient existing = patientRepository.findById(id).orElse(null);
        if (existing != null) {
            if (!"ADMIN".equalsIgnoreCase(role) && doctorId != null && !doctorId.equals(existing.getDoctorId())) {
                throw new ResourceNotFoundException("Patient not found");
            }
            visitRepository.deleteByPatientId(id);
            patientRepository.deleteById(id);
        }
    }

    public List<Visit> getPatientVisits(String id, String doctorId, String role) {
        Patient patient = patientRepository.findById(id).orElse(null);
        if (patient != null && !"ADMIN".equalsIgnoreCase(role) && doctorId != null && !doctorId.equals(patient.getDoctorId())) {
            return List.of();
        }
        return visitRepository.findByPatientIdOrderByDateDesc(id);
    }

    public Visit createVisit(String id, Visit visit, String doctorId, String role) {
        visit.setId(visit.getId() == null || visit.getId().isBlank() ? UUID.randomUUID().toString() : visit.getId());
        visit.setPatientId(id);
        if (visit.getDate() == null) {
            visit.setDate(LocalDateTime.now());
        }
        if (visit.getDoctorId() == null || visit.getDoctorId().isBlank()) {
            visit.setDoctorId(doctorId);
        }
        return visitRepository.save(visit);
    }

    public List<Visit> listRecentVisits(String doctorId, String role) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return visitRepository.findAllByOrderByDateDesc();
        }
        if (doctorId != null && !doctorId.isBlank()) {
            return visitRepository.findByDoctorIdOrderByDateDesc(doctorId);
        }
        return List.of();
    }
}
