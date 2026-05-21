package com.medval.dto;

import lombok.Data;

@Data
public class AdminRegistrationDto {
    // Login Details
    private String email;
    private String password;

    // Admin Profile Details
    private String firstName;
    private String lastName;
    private String phone;
    private String department;
}
