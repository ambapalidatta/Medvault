package com.medval.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.ResolverStyle;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medval.dto.MedicalConditionDto;
import com.medval.model.MedicalCondition;
import com.medval.model.Patient;
import com.medval.repository.MedicalConditionRepository;
import com.medval.repository.PatientRepository;

@Service
public class MedicalConditionService {

    @Autowired
    private MedicalConditionRepository conditionRepository;

    @Autowired
    private PatientRepository patientRepository;

    // userRepository no longer needed; patientId is used directly

    // Get all conditions for a specific patient
    @Transactional(readOnly = true)
    public List<MedicalCondition> getConditionsByPatientId(String patientId) { // Change String to Long if needed
        // Option 1: Find patient first (if you need patient object later)
        // Patient patient = patientRepository.findById(patientId)
        //        .orElseThrow(() -> new RuntimeException("Patient not found"));
        // return conditionRepository.findByPatient(patient);

        // Option 2: Directly query by patientId (more efficient if you only need the list)
        return conditionRepository.findByPatientPatientId(patientId);
    }

    // Add a new condition for a patient
    @Transactional
    public MedicalCondition addCondition(MedicalConditionDto dto) {
        // dto.patientId refers to the Patient entity ID, not the User ID
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found for ID: " + dto.getPatientId()));

        MedicalCondition condition = new MedicalCondition();
        condition.setPatient(patient);
        condition.setConditionName(dto.getConditionName());
        condition.setDiagnosedDate(parseFlexibleDate(dto.getDiagnosedDate()));
        condition.setStatus(dto.getStatus());
        condition.setNotes(dto.getNotes());

        return conditionRepository.save(condition);
    }

    private LocalDate parseFlexibleDate(String input) {
        if (input == null || input.isBlank()) return null;
        DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                .parseCaseInsensitive()
                .appendOptional(DateTimeFormatter.ofPattern("uuuu-MM-dd"))
                .appendOptional(DateTimeFormatter.ofPattern("dd-MM-uuuu"))
                .toFormatter(Locale.US)
                .withResolverStyle(ResolverStyle.STRICT);
        return LocalDate.parse(input, formatter);
    }

    // (Optional: Add methods for updating or deleting conditions later)
     @Transactional
     public MedicalCondition updateCondition(String conditionId, MedicalConditionDto dto) { // Change String to Long if needed
         MedicalCondition condition = conditionRepository.findById(conditionId)
             .orElseThrow(() -> new RuntimeException("Medical condition not found"));

         // Basic check: Ensure the condition belongs to the patient specified in DTO (important for security)
         if (!condition.getPatient().getPatientId().equals(dto.getPatientId())) { // Change comparison logic if using Long
             throw new SecurityException("Cannot update condition for a different patient.");
         }

         // Update fields
         condition.setConditionName(dto.getConditionName());
         condition.setDiagnosedDate(parseFlexibleDate(dto.getDiagnosedDate()));
         condition.setStatus(dto.getStatus());
         condition.setNotes(dto.getNotes());

         return conditionRepository.save(condition);
     }

     @Transactional
     public void deleteCondition(String conditionId) { // Change String to Long if needed
         if (!conditionRepository.existsById(conditionId)) {
             throw new RuntimeException("Medical condition not found");
         }
         conditionRepository.deleteById(conditionId);
     }
}
