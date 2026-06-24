package com.medval.service;

import com.medval.dto.MedicalConditionDto;
import com.medval.model.MedicalCondition;
import com.medval.model.Patient;
import com.medval.repository.MedicalConditionRepository;
import com.medval.repository.PatientRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.ResolverStyle;
import java.util.List;
import java.util.Locale;

@Service
public class MedicalConditionService {

    private final MedicalConditionRepository conditionRepository;
    private final PatientRepository patientRepository;

    public MedicalConditionService(
            MedicalConditionRepository conditionRepository,
            PatientRepository patientRepository) {
        this.conditionRepository = conditionRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public List<MedicalCondition> getConditionsByPatientId(String patientId) {
        return conditionRepository.findByPatientPatientId(patientId);
    }

    @Transactional
    public MedicalCondition addCondition(MedicalConditionDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found."));

        MedicalCondition condition = new MedicalCondition();
        condition.setPatient(patient);
        condition.setConditionName(dto.getConditionName());
        condition.setDiagnosedDate(parseFlexibleDate(dto.getDiagnosedDate()));
        condition.setStatus(dto.getStatus());
        condition.setNotes(dto.getNotes());

        return conditionRepository.save(condition);
    }

    @Transactional
    public MedicalCondition updateCondition(String conditionId, MedicalConditionDto dto) {
        MedicalCondition condition = conditionRepository.findById(conditionId)
                .orElseThrow(() -> new RuntimeException("Medical condition not found."));

        if (!condition.getPatient().getPatientId().equals(dto.getPatientId())) {
            throw new SecurityException("Cannot update condition for a different patient.");
        }

        condition.setConditionName(dto.getConditionName());
        condition.setDiagnosedDate(parseFlexibleDate(dto.getDiagnosedDate()));
        condition.setStatus(dto.getStatus());
        condition.setNotes(dto.getNotes());

        return conditionRepository.save(condition);
    }

    @Transactional
    public void deleteCondition(String conditionId) {
        if (!conditionRepository.existsById(conditionId)) {
            throw new RuntimeException("Medical condition not found.");
        }

        conditionRepository.deleteById(conditionId);
    }

    private LocalDate parseFlexibleDate(String input) {
        if (input == null || input.isBlank()) {
            return null;
        }

        DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                .parseCaseInsensitive()
                .appendOptional(DateTimeFormatter.ofPattern("uuuu-MM-dd"))
                .appendOptional(DateTimeFormatter.ofPattern("dd-MM-uuuu"))
                .toFormatter(Locale.US)
                .withResolverStyle(ResolverStyle.STRICT);

        return LocalDate.parse(input, formatter);
    }
}