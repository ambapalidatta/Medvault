package com.medval.dto;

public class AppointmentRescheduleDto {
    private String appointmentDateTime;
    private String reason;
    private Long slotId; // New slot ID for rescheduling

    // Getters and Setters
    public String getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(String appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }
}
