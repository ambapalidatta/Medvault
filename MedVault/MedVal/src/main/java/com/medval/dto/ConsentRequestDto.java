package com.medval.dto;

import com.medval.model.ConsentRequest;
import lombok.Data;

import java.time.Instant;

@Data
public class ConsentRequestDto {
    private Long id;
    private String doctorId;
    private String doctorName;
    private String patientId;
    private String patientName;
    private String appointmentId;
    private Long emergencyRequestId;
    private ConsentRequest.ConsentStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
