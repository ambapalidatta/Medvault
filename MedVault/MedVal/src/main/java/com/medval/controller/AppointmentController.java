package com.medval.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping; // Ensure this is imported
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medval.dto.AppointmentRequestDto;
import com.medval.dto.AppointmentStatusUpdateDto;
import com.medval.dto.AppointmentRescheduleDto; // New Import for Reschedule DTO
import com.medval.model.Appointment;
import com.medval.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
@org.springframework.web.bind.annotation.CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * Patient: Book a new appointment
     * POST /api/appointments/book
     */
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequestDto requestDto) {
        System.out.println("=== APPOINTMENT BOOKING REQUEST ===");
        System.out.println("Doctor ID: " + requestDto.getDoctorId());
        System.out.println("Patient ID: " + requestDto.getPatientId());
        System.out.println("DateTime: " + requestDto.getAppointmentDateTime());
        System.out.println("Reason: " + requestDto.getReason());
        System.out.println("Slot ID: " + requestDto.getSlotId());
        
        try {
            Appointment newAppointment = appointmentService.createAppointment(requestDto);
            System.out.println("✅ Appointment created successfully: " + newAppointment.getAppointmentId());
            return ResponseEntity.ok(newAppointment);
        } catch (Exception e) {
            System.err.println("❌ ERROR creating appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Patient: Get their list of appointments
     * GET /api/appointments/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String patientId) {
        
        List<Appointment> appointments = appointmentService.getAppointmentsForPatient(patientId);
        
        // This now correctly returns the list
        return ResponseEntity.ok(appointments);
    }

    /**
     * Doctor: Get their list of appointments
     * GET /api/appointments/doctor/{doctorId}
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable String doctorId) {
        // --- THIS IS THE FIX ---
        // The variable 'appointments' must be of type List<Appointment>
        List<Appointment> appointments = appointmentService.getAppointmentsForDoctor(doctorId);
        
        // This now correctly returns the list
        return ResponseEntity.ok(appointments);
    }

    /**
     * Patient: Reschedule an appointment
     * PUT /api/appointments/{appointmentId} 
     */
    @PutMapping("/{appointmentId}") 
    public ResponseEntity<Appointment> rescheduleAppointment(
            @PathVariable String appointmentId,
            @RequestBody AppointmentRescheduleDto rescheduleDto) {
        try {
            Appointment rescheduledAppointment = appointmentService.rescheduleAppointment(appointmentId, rescheduleDto);
            return ResponseEntity.ok(rescheduledAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null); 
        }
    }


    /**
     * Doctor: Update an appointment status (Approve/Reject)
     * PUT /api/appointments/{appointmentId}/status
     */
    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable String appointmentId,
            @RequestBody AppointmentStatusUpdateDto statusUpdate) {
        try {
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(appointmentId, statusUpdate);
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            // Send the specific error message (e.g., "Invalid status") to the frontend
            return ResponseEntity.badRequest().body(null); 
        }
    }
}