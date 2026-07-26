package com.mediscript.clinic.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.MedicineTemplate;
import com.mediscript.clinic.repository.MedicineTemplateRepository;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final MedicineTemplateRepository templateRepository;

    public TemplateController(MedicineTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @GetMapping
    public List<MedicineTemplate> list() {
        return templateRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicineTemplate save(@RequestBody MedicineTemplate template) {
        if (template.getId() == null || template.getId().isBlank()) {
            template.setId(UUID.randomUUID().toString());
        }
        return templateRepository.save(template);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        templateRepository.deleteById(id);
    }
}