package com.medval.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.medval.model.MedicalRecord;
import com.medval.model.Patient;
import com.medval.model.User;
import com.medval.repository.PatientRepository;
import com.medval.repository.UserRepository;
import com.medval.service.ConsentRequestService;
import com.medval.service.MedicalRecordService;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {

    private final MedicalRecordService recordService;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ConsentRequestService consentRequestService;

    public MedicalRecordController(MedicalRecordService recordService, PatientRepository patientRepository, 
                                   UserRepository userRepository, ConsentRequestService consentRequestService) {
        this.recordService = recordService;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.consentRequestService = consentRequestService;
    }

    private static final String UPLOAD_DIR = "MedVault/MedVal/uploads/";

    @PostMapping("/uploads/{patientId}")
    public ResponseEntity<?> uploadRecord(
            @PathVariable String patientId,
            @RequestParam("recordType") String recordType,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("recordDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordDate,
            @RequestParam(value = "file") MultipartFile file,
            @RequestParam(value = "createdBy") String createdBy, // Added createdBy

            // --- ALL NEW FIELDS ADDED ---
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "maritalStatus", required = false) String maritalStatus,
            
            // Identification
            @RequestParam(value = "aadhaarNumber", required = false) String aadhaarNumber,
            @RequestParam(value = "insuranceDetails", required = false) String insuranceDetails,
            @RequestParam(value = "birthMark", required = false) String birthMark,
            
            // Lifestyle
            @RequestParam(value = "smokingStatus", required = false) String smokingStatus,
            @RequestParam(value = "alcoholConsumption", required = false) String alcoholConsumption,
            @RequestParam(value = "dietPreference", required = false) String dietPreference,
            @RequestParam(value = "physicalActivityLevel", required = false) String physicalActivityLevel,
            @RequestParam(value = "sleepHours", required = false) Double sleepHours,
            @RequestParam(value = "stressLevel", required = false) String stressLevel,
            
            // Current Health
            @RequestParam(value = "weightKg", required = false) Double weightKg,
            @RequestParam(value = "heightCm", required = false) Double heightCm,
            @RequestParam(value = "bmi", required = false) Double bmi,
            @RequestParam(value = "pulseRate", required = false) Integer pulseRate,
            @RequestParam(value = "bodyTemperature", required = false) Double bodyTemperature
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is required.");
        }
        
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found for ID: " + patientId));

            // Use the 'createdBy' from the form
            User user = userRepository.findById(createdBy)
                     .orElseThrow(() -> new RuntimeException("User not found for ID: " + createdBy));


            MedicalRecord record = new MedicalRecord();
            record.setPatient(patient);
            record.setCreatedBy(user.getUserId()); 
            record.setRecordType(recordType);
            record.setTitle(title);
            record.setDescription(description);
            record.setRecordDate(recordDate);

            // --- SET ALL NEW FIELDS ---
            record.setAddress(address); // <-- ADDED
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

            // 4. Handle File Upload
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // --- FIXED: Use relative path for fileUrl ---
            record.setFileUrl(UPLOAD_DIR + fileName); 

            MedicalRecord savedRecord = recordService.saveRecord(record);

            return ResponseEntity.ok(savedRecord);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("File upload failed");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to add record: " + e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getRecordsByPatientId(
            @PathVariable String patientId,
            @RequestParam(required = false) String doctorId) {
        
        // If doctorId is provided, check consent before returning records
        if (doctorId != null && !doctorId.isEmpty()) {
            boolean hasPermission = consentRequestService.checkPermission(doctorId, patientId);
            if (!hasPermission) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You need patient consent to view their records.");
            }
        }
        
        List<MedicalRecord> records = recordService.getRecordsByPatientId(patientId);
        
        if (records == null) {
            records = Collections.emptyList(); 
        }
        
        return ResponseEntity.ok(records);
    }
}