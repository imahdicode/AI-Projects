package com.mediscript.clinic.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> analyzeSymptoms(String symptoms, int age, String gender) {
        String apiKey = getEffectiveApiKey();
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String prompt = String.format(
                    "You are a medical diagnostic AI assistant for a licensed doctor. Analyze the following patient symptoms:\n" +
                    "Symptoms: %s\nAge: %d\nGender: %s\n\n" +
                    "Return ONLY a valid JSON object with the following fields:\n" +
                    "- \"possibleConditions\": array of strings (top 3 potential diagnoses)\n" +
                    "- \"recommendedChecks\": array of strings (vitals or labs to check)\n" +
                    "- \"advice\": string (brief clinical advice for the doctor)",
                    symptoms, age, gender
                );

                String jsonResponse = callGeminiApi(prompt, apiKey);
                if (jsonResponse != null) {
                    JsonNode node = objectMapper.readTree(jsonResponse);
                    return objectMapper.convertValue(node, Map.class);
                }
            } catch (Exception e) {
                System.err.println("Gemini Server Call Failed, switching to Built-in Clinical Rule Engine: " + e.getMessage());
            }
        }

        return getFallbackSymptomAnalysis(symptoms, age, gender);
    }

    public List<Map<String, String>> suggestMedicines(String diagnosis) {
        String apiKey = getEffectiveApiKey();
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String prompt = String.format(
                    "Suggest 3 common medicines for the diagnosis: \"%s\".\n" +
                    "Return ONLY a valid JSON array where each object has:\n" +
                    "- \"medicine\": string (generic name)\n" +
                    "- \"dosage\": string (typical adult dosage)\n" +
                    "- \"frequency\": string (e.g. Twice daily)\n" +
                    "- \"instructions\": string (e.g. After food)",
                    diagnosis
                );

                String jsonResponse = callGeminiApi(prompt, apiKey);
                if (jsonResponse != null) {
                    JsonNode node = objectMapper.readTree(jsonResponse);
                    return objectMapper.convertValue(node, List.class);
                }
            } catch (Exception e) {
                System.err.println("Gemini Server Call Failed, switching to Fallback Medicine Engine: " + e.getMessage());
            }
        }

        return getFallbackMedicineSuggestions(diagnosis);
    }

    private String getEffectiveApiKey() {
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            return geminiApiKey;
        }
        return System.getenv("GEMINI_API_KEY");
    }

    private String callGeminiApi(String prompt, String apiKey) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            ),
            "generationConfig", Map.of("responseMimeType", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            return textNode.asText();
        }
        return null;
    }

    private Map<String, Object> getFallbackSymptomAnalysis(String symptoms, int age, String gender) {
        String s = symptoms.toLowerCase();
        if (s.contains("plantar") || s.contains("fasciitis") || s.contains("heel") || s.contains("foot pain")) {
            return Map.of(
                "possibleConditions", List.of(
                    "Plantar Fasciitis (Inferior Calcaneal Heel Pain)",
                    "Calcaneal Spur / Retrocalcaneal Bursitis",
                    "Tarsal Tunnel Syndrome"
                ),
                "recommendedChecks", List.of(
                    "Weight-Bearing X-Ray Foot & Heel (Lateral View)",
                    "Ultrasound Soft Tissue Heel / Foot",
                    "Serum Uric Acid Level"
                ),
                "advice", "Advise plantar fascia stretching exercises, silicone heel pads, supportive cushioned footwear, ice massage, and avoidance of barefoot walking."
            );
        }
        if (s.contains("back pain") || s.contains("sciatica") || s.contains("spine")) {
            return Map.of(
                "possibleConditions", List.of(
                    "Acute Lumbar Musculoskeletal Strain",
                    "Lumbar Disc Herniation / Sciatica",
                    "Lumbar Spondylosis"
                ),
                "recommendedChecks", List.of(
                    "Straight Leg Raise Test (SLR)",
                    "X-Ray Lumbar Spine (AP & Lateral)",
                    "MRI Lumbar Spine"
                ),
                "advice", "Advise firm bed rest during acute phase, lumbar support belt, warm compress, and avoidance of forward bending & heavy lifting."
            );
        }
        return Map.of(
            "possibleConditions", List.of(
                "Acute Musculoskeletal Strain",
                "Viral Syndrome / Febrile Illness",
                "General Clinical Fatigue"
            ),
            "recommendedChecks", List.of(
                "Complete Blood Count (CBC)",
                "Vital Signs Monitoring (BP, Temp, Pulse, SpO2)",
                "Random Blood Sugar (RBS)"
            ),
            "advice", "Ensure adequate oral hydration, bed rest, symptom monitoring, and follow up if symptoms persist beyond 48 hours."
        );
    }

    private List<Map<String, String>> getFallbackMedicineSuggestions(String diagnosis) {
        String d = diagnosis.toLowerCase();
        if (d.contains("plantar") || d.contains("heel") || d.contains("foot") || d.contains("arthritis")) {
            return List.of(
                Map.of("medicine", "Aceclofenac 100mg + Paracetamol 325mg", "dosage", "1 tablet", "frequency", "Twice daily", "instructions", "After food for 5 days"),
                Map.of("medicine", "Methylcobalamin & Calcium Supplement", "dosage", "1 tablet", "frequency", "Once daily", "instructions", "After dinner"),
                Map.of("medicine", "Diclofenac Topical Pain Gel", "dosage", "Apply gently to heel/foot", "frequency", "Thrice daily", "instructions", "For external local application")
            );
        }
        return List.of(
            Map.of("medicine", "Paracetamol 500mg", "dosage", "1 tablet", "frequency", "As needed (SOS)", "instructions", "After food"),
            Map.of("medicine", "Multivitamin & Mineral Tab", "dosage", "1 tablet", "frequency", "Once daily", "instructions", "After breakfast"),
            Map.of("medicine", "Pantoprazole 40mg", "dosage", "1 tablet", "frequency", "Once daily", "instructions", "Before food")
        );
    }
}
