package com.medval.controller;

import com.medval.dto.MedicalConditionDto;
import com.medval.model.MedicalCondition;
import com.medval.service.MedicalConditionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-conditions")
public class MedicalConditionController {

    private final MedicalConditionService conditionService;

    public MedicalConditionController(MedicalConditionService conditionService) {
        this.conditionService = conditionService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getConditionsByPatient(@PathVariable String patientId) {
        try {
            List<MedicalCondition> conditions = conditionService.getConditionsByPatientId(patientId);
            return ResponseEntity.ok(conditions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching medical conditions failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch medical conditions."));
        }
    }

    @PostMapping
    public ResponseEntity<?> addCondition(@RequestBody MedicalConditionDto dto) {
        try {
            MedicalCondition condition = conditionService.addCondition(dto);
            return ResponseEntity.ok(condition);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Adding medical condition failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to add medical condition."));
        }
    }

    @PutMapping("/{conditionId}")
    public ResponseEntity<?> updateCondition(
            @PathVariable String conditionId,
            @RequestBody MedicalConditionDto dto) {
        try {
            MedicalCondition condition = conditionService.updateCondition(conditionId, dto);
            return ResponseEntity.ok(condition);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Updating medical condition failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update medical condition."));
        }
    }

    @DeleteMapping("/{conditionId}")
    public ResponseEntity<?> deleteCondition(@PathVariable String conditionId) {
        try {
            conditionService.deleteCondition(conditionId);
            return ResponseEntity.ok(Map.of("message", "Medical condition deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Deleting medical condition failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to delete medical condition."));
        }
    }
}