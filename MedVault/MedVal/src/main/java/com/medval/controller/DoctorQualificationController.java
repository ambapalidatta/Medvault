package com.medval.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.medval.dto.DoctorQualificationDto; 
import com.medval.service.DoctorQualificationService;

@RestController
@RequestMapping("/api/qualifications")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorQualificationController {

    @Autowired
    private DoctorQualificationService qualificationService;

    @PostMapping("/uploads")
    public ResponseEntity<?> uploadQualification(
            @RequestParam("doctorId") String doctorId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam("documentName") String documentName) { // <-- 2. ADD 'documentName'
        try {
            // 3. THIS NOW RETURNS A DTO
            DoctorQualificationDto qualification = qualificationService.uploadQualification(doctorId, file, documentType, documentName);
            return ResponseEntity.ok(qualification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorQualifications(@PathVariable String doctorId) {
        try {
            // 4. THIS NOW RETURNS A LIST OF DTOS
            List<DoctorQualificationDto> qualifications = qualificationService.getDoctorQualifications(doctorId);
            return ResponseEntity.ok(qualifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}