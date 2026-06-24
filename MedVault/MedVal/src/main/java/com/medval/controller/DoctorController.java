package com.medval.controller;

import com.medval.dto.DoctorDto;
import com.medval.model.Doctor;
import com.medval.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;

    public DoctorController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        List<DoctorDto> doctors = doctorRepository.findAll()
                .stream()
                .filter(Doctor::isVerified)
                .map(DoctorDto::new)
                .toList();

        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable String id) {
        return doctorRepository.findByProfessionalId(id)
                .filter(Doctor::isVerified)
                .map(DoctorDto::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}