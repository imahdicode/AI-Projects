package com.mediscript.clinic.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.Visit;
import com.mediscript.clinic.repository.VisitRepository;

@RestController
@RequestMapping("/api/visits")
public class RecentVisitController {

    private final VisitRepository visitRepository;

    public RecentVisitController(VisitRepository visitRepository) {
        this.visitRepository = visitRepository;
    }

    @GetMapping
    public List<Visit> list(
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        if ("ADMIN".equals(role)) {
            return visitRepository.findAllByOrderByDateDesc();
        }
        if (doctorId != null && !doctorId.isBlank()) {
            return visitRepository.findByDoctorIdOrderByDateDesc(doctorId);
        }
        return List.of();
    }
}