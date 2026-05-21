package com.medval.dto;

import java.time.LocalDate;

import lombok.Data;

// This DTO carries all the data from the registration request
@Data // Lombok automatically creates getters like getFirstName(), getLastName(), etc.
public class PatientRegistrationDto {

    // Login Details
    private String email;
    private String password;

    // Patient Profile Details (using standard Java camelCase)
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
}
