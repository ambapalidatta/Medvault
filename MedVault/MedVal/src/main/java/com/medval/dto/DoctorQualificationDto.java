package com.medval.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DoctorQualificationDto {
    private Long qualificationId;
    private String doctorId;
    private String documentName;
    private String documentPath;
    private String documentType;
    private LocalDateTime uploadedAt;
    private String verificationStatus;
}