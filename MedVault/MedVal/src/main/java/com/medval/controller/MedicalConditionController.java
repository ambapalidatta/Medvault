package com.medval.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medval.dto.MedicalConditionDto;
import com.medval.model.MedicalCondition;
import com.medval.service.MedicalConditionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/medical-conditions")
public class MedicalConditionController {

    @Autowired
    private MedicalConditionService conditionService;

    // ... (GET, POST, PUT, DELETE methods are all unchanged) ...

    // GET conditions for a specific patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalConditionDto>> getConditionsForPatient(@PathVariable String patientId) { 
        List<MedicalCondition> conditions = conditionService.getConditionsByPatientId(patientId);
        List<MedicalConditionDto> dtos = conditions.stream().map(this::convertToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // POST a new condition for a patient
    @PostMapping
    public ResponseEntity<MedicalConditionDto> addCondition(@Valid @RequestBody MedicalConditionDto dto) {
        if (dto.getPatientId() == null || dto.getConditionName() == null) {
        return ResponseEntity.badRequest().build();
    }
    try {
            MedicalCondition savedCondition = conditionService.addCondition(dto);
            return ResponseEntity.ok(convertToDto(savedCondition));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null); 
        }
    }

    // PUT (Update) an existing condition
    @PutMapping("/{conditionId}")
    public ResponseEntity<MedicalConditionDto> updateCondition(@PathVariable String conditionId, @Valid @RequestBody MedicalConditionDto dto) { 
        try {
            MedicalCondition updatedCondition = conditionService.updateCondition(conditionId, dto);
            return ResponseEntity.ok(convertToDto(updatedCondition));
        }
        catch (SecurityException e) {
             return ResponseEntity.status(403).body(null); 
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    // DELETE a condition
    @DeleteMapping("/{conditionId}")
    public ResponseEntity<Void> deleteCondition(@PathVariable String conditionId) { 
        try {
            conditionService.deleteCondition(conditionId);
            return ResponseEntity.noContent().build(); 
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // Helper to convert Entity to DTO
    private MedicalConditionDto convertToDto(MedicalCondition condition) {
        MedicalConditionDto dto = new MedicalConditionDto();
        
        // --- THIS IS THE FIX ---
        dto.setConditionId(condition.getConditionId()); // Changed from condition.getId()

        dto.setPatientId(condition.getPatient().getPatientId());
        dto.setConditionName(condition.getConditionName());
        dto.setDiagnosedDate(condition.getDiagnosedDate() != null ? condition.getDiagnosedDate().toString() : null);
        dto.setStatus(condition.getStatus());
        dto.setNotes(condition.getNotes());
        return dto;
    }
}