package com.medval.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponseDto {

    private String userId;
    private String name;
    private String email;
    private String role;
    private String profilePictureUrl;
    private String patientId;
    private String doctorId;

    private String token;
    private String tokenType = "Bearer";

    public UserInfoResponseDto(
            String userId,
            String name,
            String email,
            String role,
            String profilePictureUrl,
            String patientId,
            String doctorId,
            String token) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profilePictureUrl = profilePictureUrl;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.token = token;
        this.tokenType = "Bearer";
    }
}