package com.mediscript.clinic.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.InventoryItem;
import com.mediscript.clinic.repository.InventoryRepository;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    public InventoryController(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @GetMapping
    public List<InventoryItem> list() {
        return inventoryRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryItem create(@RequestBody InventoryItem item) {
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId("inv-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return inventoryRepository.save(item);
    }

    @PutMapping("/{id}")
    public InventoryItem update(@PathVariable String id, @RequestBody InventoryItem item) {
        item.setId(id);
        return inventoryRepository.save(item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        inventoryRepository.deleteById(id);
    }
}
