package com.farmos.farmos.controller;

import com.farmos.farmos.service.LeafDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/leaf")
public class LeafDetectionController {

    private final LeafDetectionService leafDetectionService;

    public LeafDetectionController(LeafDetectionService leafDetectionService) {
        this.leafDetectionService = leafDetectionService;
    }

    // accepts image upload from React
    // returns top prediction + treatment
    @PostMapping("/detect")
    public ResponseEntity<Map<String, Object>> detect(
            @RequestParam("image") MultipartFile image) {
        try {
            // get raw bytes from uploaded image
            byte[] imageBytes = image.getBytes();

            // send to Hugging Face
            List<Map<String, Object>> predictions = leafDetectionService.detectDisease(imageBytes);

            if (predictions == null || predictions.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No predictions returned"));
            }

            // top prediction is first result
            Map<String, Object> top = predictions.get(0);
            String label = (String) top.get("label");
            Double score = (Double) top.get("score");

            // get treatment for this disease
            Map<String, String> treatment = leafDetectionService.getTreatment(label);

            // build response
            Map<String, Object> response = new HashMap<>();
            response.put("label", label);
            response.put("confidence", Math.round(score * 100));
            response.put("disease", treatment.get("disease"));
            response.put("severity", treatment.get("severity"));
            response.put("recommendation", treatment.get("recommendation"));
            response.put("action", treatment.get("action"));

            // also return top 3 predictions
            List<Map<String, Object>> top3 = predictions.subList(0, Math.min(3, predictions.size()));
            response.put("allPredictions", top3);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // print full error to console
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Detection failed: " + e.getMessage()));
        }
    }
}