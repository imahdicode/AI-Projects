package com.mediscript.clinic.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mediscript.clinic.exception.ResourceNotFoundException;
import com.mediscript.clinic.model.Patient;
import com.mediscript.clinic.repository.PatientRepository;
import com.mediscript.clinic.repository.VisitRepository;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private VisitRepository visitRepository;

    @InjectMocks
    private PatientService patientService;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
        testPatient = new Patient();
        testPatient.setId("P-1001");
        testPatient.setName("Test Patient");
        testPatient.setAge(30);
        testPatient.setDoctorId("doc-1");
    }

    @Test
    void testListPatientsAsAdminReturnsAll() {
        when(patientRepository.findAll()).thenReturn(List.of(testPatient));
        List<Patient> result = patientService.listPatients("doc-1", "ADMIN");
        assertEquals(1, result.size());
        verify(patientRepository).findAll();
    }

    @Test
    void testListPatientsAsDoctorReturnsFiltered() {
        when(patientRepository.findByDoctorId("doc-1")).thenReturn(List.of(testPatient));
        List<Patient> result = patientService.listPatients("doc-1", "DOCTOR");
        assertEquals(1, result.size());
        verify(patientRepository).findByDoctorId("doc-1");
    }

    @Test
    void testGetPatientSuccess() {
        when(patientRepository.findById("P-1001")).thenReturn(Optional.of(testPatient));
        Patient result = patientService.getPatient("P-1001", "doc-1", "DOCTOR");
        assertNotNull(result);
        assertEquals("Test Patient", result.getName());
    }

    @Test
    void testGetPatientUnauthorizedThrowsException() {
        when(patientRepository.findById("P-1001")).thenReturn(Optional.of(testPatient));
        assertThrows(ResourceNotFoundException.class, () -> {
            patientService.getPatient("P-1001", "doc-2", "DOCTOR");
        });
    }

    @Test
    void testCreatePatientAssignsUUID() {
        when(patientRepository.save(any(Patient.class))).thenAnswer(i -> i.getArgument(0));
        Patient newPatient = new Patient();
        newPatient.setName("New Patient");
        Patient created = patientService.createPatient(newPatient, "doc-1", "DOCTOR");
        assertNotNull(created.getId());
        assertTrue(created.getId().startsWith("P-"));
        assertEquals("doc-1", created.getDoctorId());
    }
}
