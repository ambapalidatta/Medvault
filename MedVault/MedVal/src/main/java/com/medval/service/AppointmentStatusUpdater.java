package com.medval.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AppointmentStatusUpdater {

    private final AppointmentService appointmentService;

    public AppointmentStatusUpdater(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @Scheduled(fixedRateString = "${appointments.status-update-interval-ms:3600000}")
    public void checkAndCompleteAppointments() {
        appointmentService.updatePastApprovedAppointmentsToCompleted();
    }
}