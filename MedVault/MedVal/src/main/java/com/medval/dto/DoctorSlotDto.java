package com.medval.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.medval.config.FlexibleLocalTimeDeserializer;

import lombok.Data;

@Data
public class DoctorSlotDto {
    private Long slotId;
    private String doctorId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate slotDate;
    
    @JsonDeserialize(using = FlexibleLocalTimeDeserializer.class)
    private LocalTime slotTime;
    
    private Boolean isAvailable;
    
    // For bulk creation - accepts time strings like "10:00", "14:30", or "2:30 PM"
    @JsonDeserialize(contentUsing = FlexibleLocalTimeDeserializer.class)
    private List<LocalTime> slotTimes;
}
