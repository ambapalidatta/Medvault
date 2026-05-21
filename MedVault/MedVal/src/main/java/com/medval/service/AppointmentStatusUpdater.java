package com.medval.service; // Or com.medval.tasks

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component // Marks this as a Spring-managed component
public class AppointmentStatusUpdater {

    @Autowired
    private AppointmentService appointmentService; // Inject the service

    /**
     * This method runs automatically based on the schedule defined below.
     * It calls the service method to update past appointments.
     */
    // Example: Run every hour (3,600,000 milliseconds)
    @Scheduled(fixedRate = 30000)
    // You could also run it once a day using cron: @Scheduled(cron = "0 0 1 * * ?") // Runs at 1 AM daily
    public void checkAndCompleteAppointments() {
        appointmentService.updatePastApprovedAppointmentsToCompleted();
    }
}