package com.medval.service;

import com.medval.dto.DoctorQualificationDto;
import com.medval.model.Doctor;
import com.medval.model.DoctorQualification;
import com.medval.repository.DoctorQualificationRepository;
import com.medval.repository.DoctorRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DoctorQualificationService {

    private final DoctorQualificationRepository qualificationRepository;
    private final DoctorRepository doctorRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public DoctorQualificationService(
            DoctorQualificationRepository qualificationRepository,
            DoctorRepository doctorRepository) {
        this.qualificationRepository = qualificationRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public DoctorQualificationDto uploadQualification(
            String doctorId,
            MultipartFile file,
            String documentType,
            String documentName) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Qualification file is required.");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found."));

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "qualification" : file.getOriginalFilename());

        if (originalFilename.contains("..")) {
            throw new RuntimeException("Invalid file name.");
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf(".");

        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        Path qualificationUploadPath = Paths.get(uploadDir, "qualifications")
                .toAbsolutePath()
                .normalize();

        if (!Files.exists(qualificationUploadPath)) {
            Files.createDirectories(qualificationUploadPath);
        }

        String filename = UUID.randomUUID() + extension;
        Path filePath = qualificationUploadPath.resolve(filename).normalize();

        if (!filePath.startsWith(qualificationUploadPath)) {
            throw new RuntimeException("Invalid upload path.");
        }

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        DoctorQualification qualification = new DoctorQualification();
        qualification.setDoctor(doctor);
        qualification.setDocumentName(documentName);
        qualification.setDocumentPath("/uploads/qualifications/" + filename);
        qualification.setDocumentType(documentType);
        qualification.setVerificationStatus("PENDING");

        DoctorQualification saved = qualificationRepository.save(qualification);

        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DoctorQualificationDto> getDoctorQualifications(String doctorId) {
        return qualificationRepository.findByDoctorProfessionalId(doctorId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private DoctorQualificationDto convertToDto(DoctorQualification entity) {
        DoctorQualificationDto dto = new DoctorQualificationDto();

        dto.setQualificationId(entity.getQualificationId());

        if (entity.getDoctor() != null) {
            dto.setDoctorId(entity.getDoctor().getProfessionalId());
        }

        dto.setDocumentName(entity.getDocumentName());
        dto.setDocumentPath(entity.getDocumentPath());
        dto.setDocumentType(entity.getDocumentType());
        dto.setUploadedAt(entity.getUploadedAt());
        dto.setVerificationStatus(entity.getVerificationStatus());

        return dto;
    }
}