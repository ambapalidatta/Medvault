package com.medval.dto;

import java.time.LocalDate; // kept if referenced elsewhere

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalConditionDto {
    private String conditionId;
    private String patientId;
    private String conditionName;

    // Accept raw date string to support multiple formats from frontend
    private String diagnosedDate;

    private String status;
    private String notes;
}
