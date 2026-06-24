package com.medval.controller;

import com.medval.dto.PatientDto;
import com.medval.model.Patient;
import com.medval.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        List<PatientDto> patientDtos = patientRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();

        return ResponseEntity.ok(patientDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable String id) {
        return patientRepository.findByPatientId(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> updatePatient(
            @PathVariable String id,
            @RequestBody PatientDto patientDto) {

        return patientRepository.findByPatientId(id)
                .map(patient -> {
                    if (patientDto.getFirstName() != null)
                        patient.setFirstName(patientDto.getFirstName());
                    if (patientDto.getLastName() != null)
                        patient.setLastName(patientDto.getLastName());
                    if (patientDto.getDateOfBirth() != null)
                        patient.setDateOfBirth(patientDto.getDateOfBirth());
                    if (patientDto.getGender() != null)
                        patient.setGender(patientDto.getGender());
                    if (patientDto.getBloodGroup() != null)
                        patient.setBloodGroup(patientDto.getBloodGroup());
                    if (patientDto.getPhone() != null)
                        patient.setPhone(patientDto.getPhone());
                    if (patientDto.getEmergencyContactName() != null)
                        patient.setEmergencyContactName(patientDto.getEmergencyContactName());
                    if (patientDto.getEmergencyContactPhone() != null)
                        patient.setEmergencyContactPhone(patientDto.getEmergencyContactPhone());
                    if (patientDto.getAddress() != null)
                        patient.setAddress(patientDto.getAddress());
                    if (patientDto.getCity() != null)
                        patient.setCity(patientDto.getCity());
                    if (patientDto.getState() != null)
                        patient.setState(patientDto.getState());
                    if (patientDto.getCountry() != null)
                        patient.setCountry(patientDto.getCountry());
                    if (patientDto.getPostalCode() != null)
                        patient.setPostalCode(patientDto.getPostalCode());
                    if (patientDto.getProfilePictureUrl() != null)
                        patient.setProfilePictureUrl(patientDto.getProfilePictureUrl());

                    Patient updatedPatient = patientRepository.save(patient);
                    return ResponseEntity.ok(convertToDto(updatedPatient));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private PatientDto convertToDto(Patient patient) {
        PatientDto patientDto = new PatientDto();

        patientDto.setPatientId(patient.getPatientId());

        if (patient.getUser() != null) {
            patientDto.setUserId(patient.getUser().getUserId());
            patientDto.setEmail(patient.getUser().getEmail());
        }

        patientDto.setFirstName(patient.getFirstName());
        patientDto.setLastName(patient.getLastName());
        patientDto.setDateOfBirth(patient.getDateOfBirth());
        patientDto.setGender(patient.getGender());
        patientDto.setBloodGroup(patient.getBloodGroup());
        patientDto.setPhone(patient.getPhone());
        patientDto.setEmergencyContactName(patient.getEmergencyContactName());
        patientDto.setEmergencyContactPhone(patient.getEmergencyContactPhone());
        patientDto.setAddress(patient.getAddress());
        patientDto.setCity(patient.getCity());
        patientDto.setState(patient.getState());
        patientDto.setCountry(patient.getCountry());
        patientDto.setPostalCode(patient.getPostalCode());
        patientDto.setProfilePictureUrl(patient.getProfilePictureUrl());
        patientDto.setCreatedAt(patient.getCreatedAt());
        patientDto.setUpdatedAt(patient.getUpdatedAt());

        return patientDto;
    }
}