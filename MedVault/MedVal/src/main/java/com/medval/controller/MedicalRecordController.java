package com.medval.controller;

import com.medval.model.MedicalRecord;
import com.medval.model.Patient;
import com.medval.model.User;
import com.medval.repository.PatientRepository;
import com.medval.repository.UserRepository;
import com.medval.service.ConsentRequestService;
import com.medval.service.MedicalRecordService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {

    private final MedicalRecordService recordService;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ConsentRequestService consentRequestService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public MedicalRecordController(
            MedicalRecordService recordService,
            PatientRepository patientRepository,
            UserRepository userRepository,
            ConsentRequestService consentRequestService) {
        this.recordService = recordService;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.consentRequestService = consentRequestService;
    }

    @PostMapping("/uploads/{patientId}")
    public ResponseEntity<?> uploadRecord(
            @PathVariable String patientId,
            @RequestParam("recordType") String recordType,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("recordDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordDate,
            @RequestParam("file") MultipartFile file,
            @RequestParam("createdBy") String createdBy,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "maritalStatus", required = false) String maritalStatus,
            @RequestParam(value = "aadhaarNumber", required = false) String aadhaarNumber,
            @RequestParam(value = "insuranceDetails", required = false) String insuranceDetails,
            @RequestParam(value = "birthMark", required = false) String birthMark,
            @RequestParam(value = "smokingStatus", required = false) String smokingStatus,
            @RequestParam(value = "alcoholConsumption", required = false) String alcoholConsumption,
            @RequestParam(value = "dietPreference", required = false) String dietPreference,
            @RequestParam(value = "physicalActivityLevel", required = false) String physicalActivityLevel,
            @RequestParam(value = "sleepHours", required = false) Double sleepHours,
            @RequestParam(value = "stressLevel", required = false) String stressLevel,
            @RequestParam(value = "weightKg", required = false) Double weightKg,
            @RequestParam(value = "heightCm", required = false) Double heightCm,
            @RequestParam(value = "bmi", required = false) Double bmi,
            @RequestParam(value = "pulseRate", required = false) Integer pulseRate,
            @RequestParam(value = "bodyTemperature", required = false) Double bodyTemperature) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is required."));
        }

        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found."));

            User user = userRepository.findById(createdBy)
                    .orElseThrow(() -> new RuntimeException("User not found."));

            String originalFileName = StringUtils.cleanPath(
                    file.getOriginalFilename() == null ? "medical-record" : file.getOriginalFilename());

            if (originalFileName.contains("..")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid file name."));
            }

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + originalFileName;
            Path filePath = uploadPath.resolve(fileName).normalize();

            if (!filePath.startsWith(uploadPath)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid upload path."));
            }

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            MedicalRecord record = new MedicalRecord();
            record.setPatient(patient);
            record.setCreatedBy(user.getUserId());
            record.setRecordType(recordType);
            record.setTitle(title);
            record.setDescription(description);
            record.setRecordDate(recordDate);

            record.setAddress(address);
            record.setMaritalStatus(maritalStatus);
            record.setAadhaarNumber(aadhaarNumber);
            record.setInsuranceDetails(insuranceDetails);
            record.setBirthMark(birthMark);

            record.setSmokingStatus(smokingStatus);
            record.setAlcoholConsumption(alcoholConsumption);
            record.setDietPreference(dietPreference);
            record.setPhysicalActivityLevel(physicalActivityLevel);
            record.setSleepHours(sleepHours);
            record.setStressLevel(stressLevel);

            record.setWeightKg(weightKg);
            record.setHeightCm(heightCm);
            record.setBmi(bmi);
            record.setPulseRate(pulseRate);
            record.setBodyTemperature(bodyTemperature);

            record.setFileUrl("/uploads/" + fileName);

            MedicalRecord savedRecord = recordService.saveRecord(record);

            return ResponseEntity.ok(savedRecord);

        } catch (IOException e) {
            System.err.println("Medical record file upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "File upload failed."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Medical record upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload medical record."));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getRecordsByPatientId(
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

            List<MedicalRecord> records = recordService.getRecordsByPatientId(patientId);

            if (records == null) {
                records = Collections.emptyList();
            }

            return ResponseEntity.ok(records);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching medical records failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch medical records."));
        }
    }
}