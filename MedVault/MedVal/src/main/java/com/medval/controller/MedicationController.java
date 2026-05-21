package com.medval.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.medval.dto.MedicationDto;
import com.medval.service.ConsentRequestService;
import com.medval.service.MedicationService;

@RestController
@RequestMapping("/api")
public class MedicationController {

    @Autowired
    private MedicationService medicationService;
    
    @Autowired
    private ConsentRequestService consentRequestService;

    private static final String UPLOAD_DIR = "MedVault/MedVal/uploads/";

    @PostMapping("/medications/uploads")
    public ResponseEntity<?> uploadPrescription(
            @RequestParam("patientId") String patientId,
            @RequestParam("medicationName") String medicationName,
            @RequestParam("dosage") String dosage,
            @RequestParam("frequency") String frequency,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam("prescribedBy") String prescribedBy,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            System.out.println("✅ Received prescription upload request for patientId = " + patientId);

            String filePath = null;
            if (file != null && !file.isEmpty()) {
                // Validate file type
                String contentType = file.getContentType();
                if (contentType == null || !(contentType.equals("image/jpeg") || 
                    contentType.equals("image/jpg") || 
                    contentType.equals("application/pdf"))) {
                    return ResponseEntity.badRequest()
                        .body("Invalid file type. Only JPG, JPEG, and PDF files are allowed.");
                }

                // Create absolute path for uploads
                Path currentPath = Paths.get("").toAbsolutePath();
                Path uploadPath = currentPath.resolve(UPLOAD_DIR);
                Files.createDirectories(uploadPath);

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path path = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                filePath = path.toString();
                System.out.println("✅ File saved to: " + filePath);
            }

            // Validate and parse dates
            LocalDate parsedStartDate;
            LocalDate parsedEndDate;
            try {
                parsedStartDate = LocalDate.parse(startDate);
                parsedEndDate = LocalDate.parse(endDate);
                if (parsedEndDate.isBefore(parsedStartDate)) {
                    return ResponseEntity.badRequest()
                        .body("End date cannot be before start date");
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body("Invalid date format. Use YYYY-MM-DD format");
            }

            // Create and populate the DTO
            MedicationDto medicationDto = new MedicationDto();
            medicationDto.setPatientId(patientId);
            medicationDto.setMedicationName(medicationName);
            medicationDto.setDosage(dosage);
            medicationDto.setFrequency(frequency);
            medicationDto.setStartDate(parsedStartDate);
            medicationDto.setEndDate(parsedEndDate);
            medicationDto.setPrescribedBy(prescribedBy);
            medicationDto.setNotes(notes);
            medicationDto.setDocumentPath(filePath);

            // Save to database
            MedicationDto saved = medicationService.save(medicationDto);
            System.out.println("✅ Prescription saved successfully");
            return ResponseEntity.ok(saved);
            
        } catch (IOException e) {
            System.err.println("❌ Error saving file: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Error processing prescription: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body("Error processing prescription: " + e.getMessage());
        }
    }

    @GetMapping("/medications/patient/{patientId}")
    public ResponseEntity<?> getByPatientId(
            @PathVariable String patientId,
            @RequestParam(required = false) String doctorId) {
        
        // If doctorId is provided, check consent before returning medications
        if (doctorId != null && !doctorId.isEmpty()) {
            boolean hasPermission = consentRequestService.checkPermission(doctorId, patientId);
            if (!hasPermission) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You need patient consent to view their prescriptions.");
            }
        }
        
        return ResponseEntity.ok(medicationService.getByPatientId(patientId));
    }

    @GetMapping("/prescriptions/doctor/{doctorId}")
    public ResponseEntity<List<MedicationDto>> getByDoctorId(@PathVariable String doctorId) {
        return ResponseEntity.ok(medicationService.getByDoctorId(doctorId));
    }
}
