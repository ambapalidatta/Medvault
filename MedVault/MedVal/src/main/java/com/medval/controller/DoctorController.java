package com.medval.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medval.dto.DoctorDto;
import com.medval.model.Doctor;
import com.medval.repository.DoctorRepository;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * GET /api/doctors
     * This endpoint gets all doctors and returns them as a simplified DTO
     * for the patient's "Select Doctor" dropdown.
     */
    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        // 1. Fetch all Doctor entities from the database
        List<Doctor> doctors = doctorRepository.findAll();

        // 2. Convert the list of Doctor entities into a list of DoctorDto objects
        List<DoctorDto> doctorDtos = doctors.stream()
                .map(doctor -> new DoctorDto(doctor)) // Uses the constructor we made in DoctorDto
                .collect(Collectors.toList());

        // 3. Return the list of DTOs
        return ResponseEntity.ok(doctorDtos);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String id) {
        // The ID from the frontend is the 'professionalId' (the 0a910776... string)
        // We need to find the doctor by that ID.
        Optional<Doctor> doctor = doctorRepository.findByProfessionalId(id);

        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        } else {
            // This will send a 404 if no doctor matches the ID
            return ResponseEntity.notFound().build();
        }
    }
}