package com.mediscript.clinic.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.ClinicBranch;
import com.mediscript.clinic.repository.ClinicBranchRepository;

@RestController
@RequestMapping("/api/branches")
public class ClinicBranchController {

    @Autowired
    private ClinicBranchRepository clinicBranchRepository;

    @GetMapping
    public List<ClinicBranch> getAllBranches() {
        List<ClinicBranch> list = clinicBranchRepository.findAll();
        if (list.isEmpty()) {
            ClinicBranch defaultBranch = new ClinicBranch(
                "branch-1",
                "MediScript Main Clinic - Connaught Place",
                "ND-01",
                "123 MG Road, Connaught Place, New Delhi",
                "+91 98765 43210",
                2,
                "ACTIVE"
            );
            clinicBranchRepository.save(defaultBranch);
            return List.of(defaultBranch);
        }
        return list;
    }

    @PostMapping
    public ClinicBranch createBranch(@RequestBody ClinicBranch branch) {
        if (branch.getId() == null || branch.getId().trim().isEmpty()) {
            branch.setId("branch-" + UUID.randomUUID());
        }
        if (branch.getStatus() == null) {
            branch.setStatus("ACTIVE");
        }
        return clinicBranchRepository.save(branch);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBranch(@PathVariable String id) {
        clinicBranchRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
