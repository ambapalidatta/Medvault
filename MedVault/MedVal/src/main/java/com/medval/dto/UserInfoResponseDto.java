package com.medval.dto;

// Add imports if they are missing
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
    
    // --- FIX: RENAME THIS FIELD ---
    private String patientId; // Was patientEntityId
    
    // --- FIX: RENAME THIS FIELD ---
    private String doctorId;  // Was doctorEntityId
}