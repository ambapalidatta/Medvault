package com.medval.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalRecordDto {
    private String recordId;
    private String patientId;
    private String recordType;
    private String title;
    private String description;

    // HTML date inputs send yyyy-MM-dd
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate recordDate;

    private String createdBy;
    private Boolean isArchived;
}

