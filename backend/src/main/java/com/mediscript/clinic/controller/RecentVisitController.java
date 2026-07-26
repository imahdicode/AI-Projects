package com.mediscript.clinic.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.Visit;
import com.mediscript.clinic.service.PatientService;

@RestController
@RequestMapping("/api/visits")
public class RecentVisitController {

    private final PatientService patientService;

    public RecentVisitController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<Visit> list(
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        return patientService.listRecentVisits(doctorId, role);
    }
}