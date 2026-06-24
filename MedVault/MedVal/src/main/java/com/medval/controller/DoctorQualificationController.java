package com.medval.controller;

import com.medval.dto.DoctorQualificationDto;
import com.medval.service.DoctorQualificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qualifications")
public class DoctorQualificationController {

    private final DoctorQualificationService qualificationService;

    public DoctorQualificationController(DoctorQualificationService qualificationService) {
        this.qualificationService = qualificationService;
    }

    @PostMapping("/uploads")
    public ResponseEntity<?> uploadQualification(
            @RequestParam("doctorId") String doctorId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam("documentName") String documentName) {

        try {
            DoctorQualificationDto qualification = qualificationService.uploadQualification(
                    doctorId,
                    file,
                    documentType,
                    documentName);

            return ResponseEntity.ok(qualification);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Qualification upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload qualification."));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorQualifications(@PathVariable String doctorId) {
        try {
            List<DoctorQualificationDto> qualifications = qualificationService.getDoctorQualifications(doctorId);

            return ResponseEntity.ok(qualifications);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching doctor qualifications failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch qualifications."));
        }
    }
}