package com.medval.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class EmergencyRequestDto {
    private Long requestId;
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String doctorId;
    private String doctorName;
    private String conditionDescription;
    private String urgencyLevel;
    private String currentLocation;
    private LocalDateTime requestDateTime;
    private String status;
    private Double consultationFee;
    
    // Patient object for frontend compatibility
    private PatientInfo patient;
    
    // Review information
    private ReviewInfo review;
    
    @Data
    public static class PatientInfo {
        private String patientId;
        private String firstName;
        private String lastName;
    }
    
    @Data
    public static class ReviewInfo {
        private String reviewId;
        private int rating;
        private String feedback;
        private LocalDateTime createdAt;
    }
}
