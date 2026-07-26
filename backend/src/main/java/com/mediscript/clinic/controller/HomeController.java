package com.mediscript.clinic.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "status", "UP",
            "message", "MediScript Clinic Management System API is running successfully!",
            "documentation", "/swagger-ui/index.html",
            "version", "1.0.0"
        );
    }
}
