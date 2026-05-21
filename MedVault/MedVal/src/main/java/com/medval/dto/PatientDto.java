package com.medval.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PatientDto {
    private String patientId;
    private String userId; // Include userId for potential future use
    private String email; // From User entity
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String profilePictureUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
