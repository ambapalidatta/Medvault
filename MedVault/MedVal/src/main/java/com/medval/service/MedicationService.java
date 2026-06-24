package com.medval.service;

import com.medval.dto.MedicationDto;
import com.medval.model.Medication;
import com.medval.model.Patient;
import com.medval.repository.MedicationRepository;
import com.medval.repository.PatientRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;

    public MedicationService(
            MedicationRepository medicationRepository,
            PatientRepository patientRepository) {
        this.medicationRepository = medicationRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public MedicationDto save(MedicationDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found."));

        Medication medication = new Medication();
        medication.setPatient(patient);
        medication.setMedicationName(dto.getMedicationName());
        medication.setDosage(dto.getDosage());
        medication.setFrequency(dto.getFrequency());
        medication.setStartDate(dto.getStartDate());
        medication.setEndDate(dto.getEndDate());
        medication.setPrescribedBy(dto.getPrescribedBy());
        medication.setNotes(dto.getNotes());
        medication.setDocumentPath(dto.getDocumentPath());

        Medication saved = medicationRepository.save(medication);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> getByPatientId(String patientId) {
        return medicationRepository.findByPatient_PatientId(patientId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> getByDoctorId(String doctorId) {
        return medicationRepository.findByPrescribedBy(doctorId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private MedicationDto convertToDto(Medication medication) {
        MedicationDto dto = new MedicationDto();

        dto.setMedicationId(medication.getMedicationId());

        if (medication.getPatient() != null) {
            dto.setPatientId(medication.getPatient().getPatientId());
        }

        dto.setMedicationName(medication.getMedicationName());
        dto.setDosage(medication.getDosage());
        dto.setFrequency(medication.getFrequency());
        dto.setStartDate(medication.getStartDate());
        dto.setEndDate(medication.getEndDate());
        dto.setPrescribedBy(medication.getPrescribedBy());
        dto.setDocumentPath(medication.getDocumentPath());
        dto.setNotes(medication.getNotes());
        dto.setIsActive(medication.getIsActive());

        return dto;
    }
}