package com.mediscript.clinic.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.service.AiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    public static class SymptomAnalysisRequest {
        private String symptoms;
        private int age;
        private String gender;

        public String getSymptoms() { return symptoms; }
        public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
    }

    public static class MedicineSuggestionRequest {
        private String diagnosis;

        public String getDiagnosis() { return diagnosis; }
        public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody SymptomAnalysisRequest request) {
        String symptoms = request.getSymptoms() != null ? request.getSymptoms() : "";
        int age = request.getAge() > 0 ? request.getAge() : 30;
        String gender = request.getGender() != null ? request.getGender() : "Male";
        return aiService.analyzeSymptoms(symptoms, age, gender);
    }

    @PostMapping("/suggest-medicines")
    public List<Map<String, String>> suggestMedicines(@RequestBody MedicineSuggestionRequest request) {
        String diagnosis = request.getDiagnosis() != null ? request.getDiagnosis() : "";
        return aiService.suggestMedicines(diagnosis);
    }
}
