package com.medval.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.medval.dto.DoctorQualificationDto; 
import com.medval.model.Doctor;
import com.medval.model.DoctorQualification;
import com.medval.repository.DoctorQualificationRepository;
import com.medval.repository.DoctorRepository;

@Service
public class DoctorQualificationService {

    @Autowired
    private DoctorQualificationRepository qualificationRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // This path is from your provided file
    private final String UPLOAD_DIR = "uploads/qualifications/";

    // 3. ADD 'documentName' PARAMETER AND CHANGE RETURN TYPE TO DTO
    public DoctorQualificationDto uploadQualification(String doctorId, MultipartFile file, String documentType, String documentName) throws IOException {
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Create upload directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save to database
        DoctorQualification qualification = new DoctorQualification();
        qualification.setDoctor(doctor);
        
        // 4. FIX: USE THE 'documentName' FROM THE FORM, NOT 'originalFilename'
        qualification.setDocumentName(documentName); 
        
        qualification.setDocumentPath(UPLOAD_DIR + filename);
        qualification.setDocumentType(documentType);
        qualification.setVerificationStatus("PENDING");

        // 5. SAVE, THEN CONVERT TO DTO BEFORE RETURNING
        DoctorQualification saved = qualificationRepository.save(qualification);
        return convertToDto(saved);
    }

    // 6. CHANGE RETURN TYPE TO A LIST OF DTOS
    public List<DoctorQualificationDto> getDoctorQualifications(String doctorId) {
        return qualificationRepository.findByDoctorProfessionalId(doctorId)
                .stream()
                .map(this::convertToDto) // Convert each entity to a DTO
                .collect(Collectors.toList());
    }
    
    // 7. ADD THE NEW HELPER METHOD TO CONVERT ENTITY TO DTO
    private DoctorQualificationDto convertToDto(DoctorQualification entity) {
        DoctorQualificationDto dto = new DoctorQualificationDto();
        dto.setQualificationId(entity.getQualificationId());
        dto.setDoctorId(entity.getDoctor().getProfessionalId()); // Or getDoctorId()
        dto.setDocumentName(entity.getDocumentName());
        dto.setDocumentPath(entity.getDocumentPath());
        dto.setDocumentType(entity.getDocumentType());
        dto.setUploadedAt(entity.getUploadedAt());
        dto.setVerificationStatus(entity.getVerificationStatus());
        return dto;
    }
}