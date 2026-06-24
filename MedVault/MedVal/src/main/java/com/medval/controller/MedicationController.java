package com.medval.controller;

import com.medval.dto.MedicationDto;
import com.medval.service.ConsentRequestService;
import com.medval.service.MedicationService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MedicationController {

    private final MedicationService medicationService;
    private final ConsentRequestService consentRequestService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public MedicationController(
            MedicationService medicationService,
            ConsentRequestService consentRequestService) {
        this.medicationService = medicationService;
        this.consentRequestService = consentRequestService;
    }

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
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            String publicFileUrl = null;

            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();

                if (contentType == null ||
                        !(contentType.equals("image/jpeg")
                                || contentType.equals("image/jpg")
                                || contentType.equals("application/pdf"))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Invalid file type. Only JPG, JPEG, and PDF files are allowed."));
                }

                String originalFileName = StringUtils.cleanPath(
                        file.getOriginalFilename() == null ? "prescription" : file.getOriginalFilename());

                if (originalFileName.contains("..")) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Invalid file name."));
                }

                Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String fileName = System.currentTimeMillis() + "_" + originalFileName;
                Path filePath = uploadPath.resolve(fileName).normalize();

                if (!filePath.startsWith(uploadPath)) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Invalid upload path."));
                }

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                publicFileUrl = "/uploads/" + fileName;
            }

            LocalDate parsedStartDate;
            LocalDate parsedEndDate;

            try {
                parsedStartDate = LocalDate.parse(startDate);
                parsedEndDate = LocalDate.parse(endDate);

                if (parsedEndDate.isBefore(parsedStartDate)) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "End date cannot be before start date."));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid date format. Use YYYY-MM-DD format."));
            }

            MedicationDto medicationDto = new MedicationDto();
            medicationDto.setPatientId(patientId);
            medicationDto.setMedicationName(medicationName);
            medicationDto.setDosage(dosage);
            medicationDto.setFrequency(frequency);
            medicationDto.setStartDate(parsedStartDate);
            medicationDto.setEndDate(parsedEndDate);
            medicationDto.setPrescribedBy(prescribedBy);
            medicationDto.setNotes(notes);
            medicationDto.setDocumentPath(publicFileUrl);

            MedicationDto saved = medicationService.save(medicationDto);

            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            System.err.println("Prescription file upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload prescription file."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Prescription upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload prescription."));
        }
    }

    @GetMapping("/medications/patient/{patientId}")
    public ResponseEntity<?> getByPatientId(
            @PathVariable String patientId,
            @RequestParam(required = false) String doctorId) {

        try {
            if (doctorId != null && !doctorId.isBlank()) {
                boolean hasPermission = consentRequestService.checkPermission(doctorId, patientId);

                if (!hasPermission) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Access denied. Patient consent is required."));
                }
            }

            return ResponseEntity.ok(medicationService.getByPatientId(patientId));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching medications failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch medications."));
        }
    }

    @GetMapping("/prescriptions/doctor/{doctorId}")
    public ResponseEntity<?> getByDoctorId(@PathVariable String doctorId) {
        try {
            List<MedicationDto> prescriptions = medicationService.getByDoctorId(doctorId);
            return ResponseEntity.ok(prescriptions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching doctor prescriptions failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch prescriptions."));
        }
    }
}