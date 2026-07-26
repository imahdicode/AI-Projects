package com.mediscript.clinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mediscript.clinic.model.ClinicBranch;

@Repository
public interface ClinicBranchRepository extends JpaRepository<ClinicBranch, String> {
}
