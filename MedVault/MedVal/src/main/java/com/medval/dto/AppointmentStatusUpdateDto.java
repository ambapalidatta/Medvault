package com.medval.dto;

import lombok.Data;

@Data
public class AppointmentStatusUpdateDto {
    // Will be "approved", "rejected", or "completed"
    private String status; 
}

