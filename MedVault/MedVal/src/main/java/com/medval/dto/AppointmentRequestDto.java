package com.medval.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AppointmentRequestDto {
    private String patientId; 
    private String doctorId;
    private LocalDateTime appointmentDateTime;
    private String reason;
    private Long slotId; // Optional: for slot-based bookings
}
