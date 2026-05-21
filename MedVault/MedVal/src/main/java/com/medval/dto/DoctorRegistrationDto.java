package com.medval.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class DoctorRegistrationDto {

    // Login Details (for the 'users' table)
    private String email;
    private String password;

    // Professional Details (for the 'healthcare_professionals' table)
    private String firstName;
    private String lastName;
    private String specialization;
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private String qualification;
    private Integer experienceYears;
    private String phone;
    private String hospitalAffiliation;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String profilePictureUrl;
    private Double consultationFee;
}

