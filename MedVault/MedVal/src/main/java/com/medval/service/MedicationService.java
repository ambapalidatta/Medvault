package com.medval.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.medval.dto.MedicationDto;
import com.medval.model.Medication;
import com.medval.model.Patient;
import com.medval.repository.MedicationRepository;
import com.medval.repository.PatientRepository;
import com.medval.repository.UserRepository;

@Service
public class MedicationService {

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    public MedicationDto save(MedicationDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + dto.getPatientId()));

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

    public List<MedicationDto> getByPatientId(String patientId) {
        // Query directly by patientId to match frontend and DTO usage
        return medicationRepository.findByPatient_PatientId(patientId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MedicationDto> getByDoctorId(String doctorId) {
        // Query by prescribedBy field which stores the doctor's ID
        return medicationRepository.findByPrescribedBy(doctorId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private MedicationDto convertToDto(Medication m) {
        MedicationDto dto = new MedicationDto();
        dto.setMedicationId(m.getMedicationId());
        dto.setPatientId(m.getPatient().getPatientId());
        dto.setMedicationName(m.getMedicationName());
        dto.setDosage(m.getDosage());
        dto.setFrequency(m.getFrequency());
        dto.setStartDate(m.getStartDate());
        dto.setEndDate(m.getEndDate());
        dto.setPrescribedBy(m.getPrescribedBy());
        dto.setDocumentPath(m.getDocumentPath());
        dto.setNotes(m.getNotes());
        dto.setIsActive(m.getIsActive());
        return dto;
    }
}
