package com.medval.controller;

import com.medval.dto.AppointmentRequestDto;
import com.medval.dto.AppointmentRescheduleDto;
import com.medval.dto.AppointmentStatusUpdateDto;
import com.medval.model.Appointment;
import com.medval.service.AppointmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequestDto requestDto) {
        try {
            Appointment newAppointment = appointmentService.createAppointment(requestDto);
            return ResponseEntity.ok(newAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Appointment booking failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to book appointment. Please try again later."));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(doctorId));
    }

    @PutMapping("/{appointmentId}")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable String appointmentId,
            @RequestBody AppointmentRescheduleDto rescheduleDto) {
        try {
            Appointment rescheduledAppointment = appointmentService.rescheduleAppointment(appointmentId, rescheduleDto);

            return ResponseEntity.ok(rescheduledAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Appointment reschedule failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to reschedule appointment. Please try again later."));
        }
    }

    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String appointmentId,
            @RequestBody AppointmentStatusUpdateDto statusUpdate) {
        try {
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(appointmentId, statusUpdate);

            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Appointment status update failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update appointment status. Please try again later."));
        }
    }
}