package com.mediscript.clinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mediscript.clinic.model.InventoryItem;

public interface InventoryRepository extends JpaRepository<InventoryItem, String> {
}
