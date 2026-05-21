package com.medval.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medval.dto.AppointmentRequestDto;
import com.medval.dto.AppointmentStatusUpdateDto;
import com.medval.dto.AppointmentRescheduleDto;
import com.medval.model.Appointment;
import com.medval.model.Doctor;
import com.medval.model.DoctorSlot;
import com.medval.model.Patient;
import com.medval.model.User;
import com.medval.repository.AppointmentRepository;
import com.medval.repository.DoctorRepository;
import com.medval.repository.PatientRepository;
import com.medval.repository.UserRepository;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorSlotService slotService;
    
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    // Patient: Create a new appointment request
    @Transactional
    public Appointment createAppointment(AppointmentRequestDto requestDto) {
        Patient patient = patientRepository.findById(requestDto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(requestDto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(requestDto.getAppointmentDateTime());
        appointment.setReason(requestDto.getReason());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);
        
        // Link slot if provided
        if (requestDto.getSlotId() != null) {
            System.out.println("=== SLOT BOOKING ===");
            System.out.println("Slot ID received: " + requestDto.getSlotId());
            try {
                DoctorSlot slot = slotService.getSlotById(requestDto.getSlotId());
                System.out.println("Slot found: " + (slot != null));
                if (slot != null) {
                    System.out.println("Slot isAvailable: " + slot.getIsAvailable());
                    if (slot.getIsAvailable()) {
                        appointment.setSlot(slot);
                        // Mark slot as booked (unavailable)
                        slotService.markSlotAsBooked(requestDto.getSlotId());
                        System.out.println("✅ Slot marked as booked!");
                    } else {
                        System.out.println("⚠️ Slot already booked!");
                    }
                }
            } catch (Exception e) {
                System.err.println("❌ Error linking slot: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ No slotId provided in request");
        }
        
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Notify Admins about new appointment booking
        notificationService.notifyAdmins(
            "New Appointment Booked: " + patient.getFirstName() + " " + patient.getLastName() + " with Dr. " + doctor.getFirstName() + " " + doctor.getLastName(),
            "APPOINTMENT_BOOKED"
        );

        try {
            String doctorUserId = savedAppointment.getDoctor().getUser().getUserId(); 
            String patientName = (patient.getFirstName() + " " + patient.getLastName()).trim();
            
            notificationService.createNotification(
                doctorUserId, 
                "New appointment request from " + patientName,
                "APPOINTMENT_REQUEST"
            );

            // Send email to doctor
            String doctorEmail = doctor.getUser().getEmail();
            String subject = "New Appointment Request";
            String htmlBody = "<h3>You have a new appointment request.</h3>" +
                    "<p><b>Patient:</b> " + patientName + "</p>" +
                    "<p><b>Date:</b> " + savedAppointment.getAppointmentDateTime().toLocalDate() + "</p>" +
                    "<p><b>Time:</b> " + savedAppointment.getAppointmentDateTime().toLocalTime() + "</p>" +
                    "<p><b>Reason:</b> " + savedAppointment.getReason() + "</p>" +
                    "<a href='#' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;'>Approve</a> " +
                    "<a href='#' style='background-color: #f44336; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;'>Reject</a>" +
                    "<p><small>This is a system-generated email from the local development environment.</small></p>";
            emailNotificationService.sendHtmlEmail(doctorEmail, subject, htmlBody);

        } catch (Exception e) {
            System.err.println("\n\n--- NOTIFICATION SEND FAILED (Create Appointment) ---");
            e.printStackTrace(); 
            System.err.println("--- END FAILURE ---\n");
        }
        
        return savedAppointment;
    }
   
    // Patient: Get all appointments for a specific patient
    public List<Appointment> getAppointmentsForPatient(String patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return appointmentRepository.findByPatient(patient);
    }

    // Doctor: Get all appointments for a specific doctor
    public List<Appointment> getAppointmentsForDoctor(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return appointmentRepository.findByDoctor(doctor);
    }

    // Doctor: Approve or Reject an appointment
    @Transactional
    public Appointment updateAppointmentStatus(String appointmentId, AppointmentStatusUpdateDto statusUpdate) {
        System.out.println("----- updateAppointmentStatus -----");
        System.out.println("Attempting to update appointment ID: " + appointmentId);
        System.out.println("Requested new status: " + statusUpdate.getStatus());

        if (appointmentId == null || appointmentId.trim().isEmpty()) {
            System.err.println("ERROR: Received null or empty appointmentId.");
            throw new RuntimeException("Appointment ID cannot be null or empty.");
        }
        if (statusUpdate == null || statusUpdate.getStatus() == null || statusUpdate.getStatus().trim().isEmpty()) {
            System.err.println("ERROR: Received null or empty status update.");
            throw new RuntimeException("Status update cannot be null or empty.");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> {
                    System.err.println("ERROR: Appointment not found with ID: " + appointmentId);
                    return new RuntimeException("Appointment not found");
                });

        System.out.println("Found appointment. Current status: " + appointment.getStatus());

        Appointment.AppointmentStatus newStatus;
        try {
            newStatus = Appointment.AppointmentStatus.valueOf(statusUpdate.getStatus().toUpperCase());
            System.out.println("Successfully converted requested status to enum: " + newStatus);
        } catch (IllegalArgumentException e) {
            System.err.println("ERROR: Invalid status value received: " + statusUpdate.getStatus());
            throw new RuntimeException("Invalid status value: " + statusUpdate.getStatus());
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.PENDING &&
           (newStatus == Appointment.AppointmentStatus.APPROVED || newStatus == Appointment.AppointmentStatus.REJECTED)) {

            System.out.println("Status transition is valid. Setting new status to: " + newStatus);
            
            // If appointment is rejected, free up the slot
            if (newStatus == Appointment.AppointmentStatus.REJECTED && appointment.getSlot() != null) {
                try {
                    slotService.freeSlot(appointment.getSlot().getSlotId());
                    System.out.println("Freed up slot ID: " + appointment.getSlot().getSlotId());
                } catch (Exception e) {
                    System.err.println("ERROR: Failed to free slot: " + e.getMessage());
                }
            }
            
            appointment.setStatus(newStatus);

            try {
                Appointment savedAppointment = appointmentRepository.save(appointment);
                System.out.println("Successfully saved appointment with new status.");

                // Notify Admins about the appointment status update
                notificationService.notifyAdmins(
                    "Appointment " + newStatus.name() + ": " + savedAppointment.getPatient().getFirstName() + " " + savedAppointment.getPatient().getLastName() + " with Dr. " + savedAppointment.getDoctor().getFirstName() + " " + savedAppointment.getDoctor().getLastName(),
                    newStatus == Appointment.AppointmentStatus.APPROVED ? "APPOINTMENT_APPROVED" : "APPOINTMENT_REJECTED"
                );

                try {
                    String patientUserId = savedAppointment.getPatient().getUser().getUserId();
                    String doctorName = "Dr. " + savedAppointment.getDoctor().getFirstName() + " " + savedAppointment.getDoctor().getLastName();
                    
                    String message = newStatus == Appointment.AppointmentStatus.APPROVED 
                        ? "Your appointment with " + doctorName + " has been CONFIRMED."
                        : "Your appointment with " + doctorName + " was REJECTED.";
                    
                    String notifType = newStatus == Appointment.AppointmentStatus.APPROVED 
                        ? "APPOINTMENT_APPROVED" 
                        : "APPOINTMENT_REJECTED";

                    notificationService.createNotification(
                        patientUserId, 
                        message,
                        notifType
                    );

                    if (newStatus == Appointment.AppointmentStatus.APPROVED) {
                        User patientUser = userRepository.findById(patientUserId).orElseThrow(() -> new RuntimeException("Patient user not found"));
                        String patientEmail = patientUser.getEmail();
                        String subject = "Your Appointment has been Confirmed";
                        String htmlBody = "<h3>Your appointment has been confirmed!</h3>" +
                                "<p><b>Doctor:</b> " + doctorName + "</p>" +
                                "<p><b>Date:</b> " + savedAppointment.getAppointmentDateTime().toLocalDate() + "</p>" +
                                "<p><b>Time:</b> " + savedAppointment.getAppointmentDateTime().toLocalTime() + "</p>" +
                                "<p style='color: green;'>&#10004; Your appointment is confirmed.</p>";
                        emailNotificationService.sendHtmlEmail(patientEmail, subject, htmlBody);
                    }

                } catch (Exception e) {
                    System.err.println("\n\n--- NOTIFICATION SEND FAILED (Status Update) ---");
                    e.printStackTrace(); 
                    System.err.println("--- END FAILURE ---\n");
                }

                System.out.println("----- updateAppointmentStatus END -----");
                return savedAppointment;
            } catch (Exception e) {
                System.err.println("ERROR: Failed to save appointment update to database.");
                e.printStackTrace(); 
                throw new RuntimeException("Failed to save appointment update.");
            }
        } else {
            System.err.println("ERROR: Invalid status transition requested from " + appointment.getStatus() + " to " + newStatus);
            throw new RuntimeException("Invalid status transition.");
        }
    }
 
    // Patient: Reschedule an appointment
    @Transactional
    public Appointment rescheduleAppointment(String appointmentId, AppointmentRescheduleDto rescheduleDto) {
        System.out.println("----- rescheduleAppointment -----");
        System.out.println("Attempting to reschedule appointment ID: " + appointmentId);

        if (appointmentId == null || appointmentId.trim().isEmpty()) {
            System.err.println("ERROR: Received null or empty appointmentId.");
            throw new RuntimeException("Appointment ID cannot be null or empty.");
        }
        if (rescheduleDto == null || rescheduleDto.getAppointmentDateTime() == null || rescheduleDto.getAppointmentDateTime().trim().isEmpty()) {
            System.err.println("ERROR: Received null or empty appointmentDateTime in rescheduleDto.");
            throw new RuntimeException("New appointment date and time cannot be null or empty.");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> {
                    System.err.println("ERROR: Appointment not found with ID: " + appointmentId);
                    return new RuntimeException("Appointment not found");
                });

        // Store old slot reference for freeing up
        DoctorSlot oldSlot = appointment.getSlot();
        LocalDateTime oldDateTime = appointment.getAppointmentDateTime();
        LocalDateTime newDateTime = LocalDateTime.parse(rescheduleDto.getAppointmentDateTime());
        String doctorId = appointment.getDoctor().getProfessionalId();
        
        System.out.println("Old DateTime: " + oldDateTime);
        System.out.println("New DateTime: " + newDateTime);
        System.out.println("Doctor ID: " + doctorId);
        System.out.println("Old Slot ID: " + (oldSlot != null ? oldSlot.getSlotId() : "null"));

        // Step 1: Free up the OLD slot using the slot reference (set isAvailable=true, isBooked=false)
        if (oldSlot != null) {
            try {
                System.out.println("Freeing old slot ID: " + oldSlot.getSlotId());
                slotService.freeSlot(oldSlot.getSlotId());
                System.out.println("✅ Old slot freed up successfully (ID: " + oldSlot.getSlotId() + ")");
            } catch (Exception e) {
                System.err.println("⚠️ Could not free old slot: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ No old slot reference found on appointment");
        }

        // Step 2: Book the NEW slot and link it to the appointment
        if (rescheduleDto.getSlotId() != null) {
            // Use the provided slotId directly
            try {
                System.out.println("Booking new slot ID: " + rescheduleDto.getSlotId());
                slotService.markSlotAsBooked(rescheduleDto.getSlotId());
                DoctorSlot newSlot = slotService.getSlotById(rescheduleDto.getSlotId());
                appointment.setSlot(newSlot);
                System.out.println("✅ New slot booked and linked (ID: " + rescheduleDto.getSlotId() + ")");
            } catch (Exception e) {
                System.err.println("⚠️ Could not book/link new slot: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            // Fallback: try to find slot by date/time
            try {
                slotService.bookSlot(doctorId, newDateTime.toLocalDate(), newDateTime.toLocalTime());
                System.out.println("✅ New slot booked by date/time lookup");
            } catch (Exception e) {
                System.err.println("⚠️ Could not book new slot by date/time: " + e.getMessage());
            }
        }

        // Step 4: Update appointment details
        appointment.setAppointmentDateTime(newDateTime);
        appointment.setReason(rescheduleDto.getReason()); 
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);

        try {
            Appointment savedAppointment = appointmentRepository.save(appointment);
            System.out.println("Successfully rescheduled appointment. New status: PENDING.");

            try {
                String doctorUserId = savedAppointment.getDoctor().getUser().getUserId();
                String patientName = "Patient " + savedAppointment.getPatient().getFirstName() + " " + savedAppointment.getPatient().getLastName();
                
                notificationService.createNotification(
                    doctorUserId, 
                    patientName + " has requested to reschedule an appointment for " + 
                    savedAppointment.getAppointmentDateTime().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a")),
                    "APPOINTMENT_RESCHEDULE_REQUEST"
                );
            } catch (Exception e) {
                System.err.println("\n\n--- NOTIFICATION SEND FAILED (Reschedule Appointment) ---");
                e.printStackTrace(); 
                System.err.println("--- END FAILURE ---\n");
            }

            System.out.println("----- rescheduleAppointment END -----");
            return savedAppointment;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to save rescheduled appointment update to database.");
            e.printStackTrace(); 
            throw new RuntimeException("Failed to save rescheduled appointment.");
        }
    }
 
    @Transactional
    public void updatePastApprovedAppointmentsToCompleted() {
        System.out.println("Scheduled Task: Checking for past approved appointments...");
        LocalDateTime now = LocalDateTime.now();

        List<Appointment> pastAppointments = appointmentRepository.findByStatusAndAppointmentDateTimeBefore(
                Appointment.AppointmentStatus.APPROVED,
                now
        );

        if (pastAppointments.isEmpty()) {
            System.out.println("Scheduled Task: No past approved appointments found to update.");
            return;
        }

        System.out.println("Scheduled Task: Found " + pastAppointments.size() + " appointments to mark as COMPLETED.");

        for (Appointment appointment : pastAppointments) {
            appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }
        System.out.println("Scheduled Task: Finished updating statuses.");
    }
   
}