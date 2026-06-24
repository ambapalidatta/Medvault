package com.medval.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medval.dto.AppointmentRequestDto;
import com.medval.dto.AppointmentRescheduleDto;
import com.medval.dto.AppointmentStatusUpdateDto;
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

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DoctorSlotService slotService;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            DoctorSlotService slotService,
            NotificationService notificationService,
            EmailNotificationService emailNotificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.slotService = slotService;
        this.notificationService = notificationService;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional
    public Appointment createAppointment(AppointmentRequestDto requestDto) {
        Patient patient = patientRepository.findById(requestDto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found."));

        Doctor doctor = doctorRepository.findById(requestDto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found."));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(requestDto.getAppointmentDateTime());
        appointment.setReason(requestDto.getReason());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);

        if (requestDto.getSlotId() != null) {
            DoctorSlot slot = slotService.getSlotById(requestDto.getSlotId());

            if (slot == null) {
                throw new RuntimeException("Selected slot not found.");
            }

            if (!slot.getIsAvailable()) {
                throw new RuntimeException("Selected slot is already booked.");
            }

            appointment.setSlot(slot);
            slotService.markSlotAsBooked(requestDto.getSlotId());
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);

        notificationService.notifyAdmins(
                "New appointment booked: " + safeFullName(patient.getFirstName(), patient.getLastName())
                        + " with Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName()),
                "APPOINTMENT_BOOKED");

        notifyDoctorAboutNewAppointment(savedAppointment);

        return savedAppointment;
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsForPatient(String patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found."));

        return appointmentRepository.findByPatient(patient);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsForDoctor(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found."));

        return appointmentRepository.findByDoctor(doctor);
    }

    @Transactional
    public Appointment updateAppointmentStatus(
            String appointmentId,
            AppointmentStatusUpdateDto statusUpdate) {

        if (appointmentId == null || appointmentId.trim().isEmpty()) {
            throw new RuntimeException("Appointment ID cannot be empty.");
        }

        if (statusUpdate == null || statusUpdate.getStatus() == null || statusUpdate.getStatus().trim().isEmpty()) {
            throw new RuntimeException("Appointment status is required.");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found."));

        Appointment.AppointmentStatus newStatus;

        try {
            newStatus = Appointment.AppointmentStatus.valueOf(statusUpdate.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid appointment status.");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be approved or rejected.");
        }

        if (newStatus != Appointment.AppointmentStatus.APPROVED
                && newStatus != Appointment.AppointmentStatus.REJECTED) {
            throw new RuntimeException("Invalid status transition.");
        }

        if (newStatus == Appointment.AppointmentStatus.REJECTED && appointment.getSlot() != null) {
            slotService.freeSlot(appointment.getSlot().getSlotId());
        }

        appointment.setStatus(newStatus);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        notificationService.notifyAdmins(
                "Appointment " + newStatus.name() + ": "
                        + safeFullName(savedAppointment.getPatient().getFirstName(),
                                savedAppointment.getPatient().getLastName())
                        + " with Dr. "
                        + safeFullName(savedAppointment.getDoctor().getFirstName(),
                                savedAppointment.getDoctor().getLastName()),
                newStatus == Appointment.AppointmentStatus.APPROVED
                        ? "APPOINTMENT_APPROVED"
                        : "APPOINTMENT_REJECTED");

        notifyPatientAboutAppointmentStatus(savedAppointment, newStatus);

        return savedAppointment;
    }

    @Transactional
    public Appointment rescheduleAppointment(
            String appointmentId,
            AppointmentRescheduleDto rescheduleDto) {

        if (appointmentId == null || appointmentId.trim().isEmpty()) {
            throw new RuntimeException("Appointment ID cannot be empty.");
        }

        if (rescheduleDto == null
                || rescheduleDto.getAppointmentDateTime() == null
                || rescheduleDto.getAppointmentDateTime().trim().isEmpty()) {
            throw new RuntimeException("New appointment date and time is required.");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found."));

        LocalDateTime newDateTime;

        try {
            newDateTime = LocalDateTime.parse(rescheduleDto.getAppointmentDateTime());
        } catch (Exception e) {
            throw new RuntimeException("Invalid appointment date and time format.");
        }

        DoctorSlot oldSlot = appointment.getSlot();

        if (oldSlot != null) {
            slotService.freeSlot(oldSlot.getSlotId());
        }

        if (rescheduleDto.getSlotId() != null) {
            DoctorSlot newSlot = slotService.getSlotById(rescheduleDto.getSlotId());

            if (newSlot == null) {
                throw new RuntimeException("Selected slot not found.");
            }

            if (!newSlot.getIsAvailable()) {
                throw new RuntimeException("Selected slot is already booked.");
            }

            slotService.markSlotAsBooked(rescheduleDto.getSlotId());
            appointment.setSlot(newSlot);
        } else {
            String doctorId = appointment.getDoctor().getProfessionalId();
            slotService.bookSlot(doctorId, newDateTime.toLocalDate(), newDateTime.toLocalTime());
        }

        appointment.setAppointmentDateTime(newDateTime);
        appointment.setReason(rescheduleDto.getReason());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        notifyDoctorAboutRescheduleRequest(savedAppointment);

        return savedAppointment;
    }

    @Transactional
    public void updatePastApprovedAppointmentsToCompleted() {
        LocalDateTime now = LocalDateTime.now();

        List<Appointment> pastAppointments = appointmentRepository.findByStatusAndAppointmentDateTimeBefore(
                Appointment.AppointmentStatus.APPROVED,
                now);

        for (Appointment appointment : pastAppointments) {
            appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        }

        appointmentRepository.saveAll(pastAppointments);
    }

    private void notifyDoctorAboutNewAppointment(Appointment appointment) {
        try {
            Doctor doctor = appointment.getDoctor();
            Patient patient = appointment.getPatient();

            if (doctor.getUser() == null)
                return;

            String doctorUserId = doctor.getUser().getUserId();
            String patientName = safeFullName(patient.getFirstName(), patient.getLastName());

            notificationService.createNotification(
                    doctorUserId,
                    "New appointment request from " + patientName,
                    "APPOINTMENT_REQUEST");

            String doctorEmail = doctor.getUser().getEmail();

            String subject = "New Appointment Request";
            String htmlBody = buildAppointmentRequestEmail(appointment);

            emailNotificationService.sendHtmlEmail(doctorEmail, subject, htmlBody);

        } catch (Exception e) {
            System.err.println("Doctor appointment notification failed: " + e.getMessage());
        }
    }

    private void notifyPatientAboutAppointmentStatus(
            Appointment appointment,
            Appointment.AppointmentStatus status) {

        try {
            Patient patient = appointment.getPatient();
            Doctor doctor = appointment.getDoctor();

            if (patient.getUser() == null)
                return;

            String patientUserId = patient.getUser().getUserId();
            String doctorName = "Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName());

            String message = status == Appointment.AppointmentStatus.APPROVED
                    ? "Your appointment with " + doctorName + " has been confirmed."
                    : "Your appointment with " + doctorName + " was rejected.";

            String notificationType = status == Appointment.AppointmentStatus.APPROVED
                    ? "APPOINTMENT_APPROVED"
                    : "APPOINTMENT_REJECTED";

            notificationService.createNotification(
                    patientUserId,
                    message,
                    notificationType);

            if (status == Appointment.AppointmentStatus.APPROVED) {
                User patientUser = userRepository.findById(patientUserId)
                        .orElseThrow(() -> new RuntimeException("Patient user not found."));

                String subject = "Your Appointment Has Been Confirmed";
                String htmlBody = buildAppointmentConfirmedEmail(appointment);

                emailNotificationService.sendHtmlEmail(patientUser.getEmail(), subject, htmlBody);
            }

        } catch (Exception e) {
            System.err.println("Patient appointment notification failed: " + e.getMessage());
        }
    }

    private void notifyDoctorAboutRescheduleRequest(Appointment appointment) {
        try {
            Doctor doctor = appointment.getDoctor();
            Patient patient = appointment.getPatient();

            if (doctor.getUser() == null)
                return;

            String doctorUserId = doctor.getUser().getUserId();
            String patientName = safeFullName(patient.getFirstName(), patient.getLastName());

            notificationService.createNotification(
                    doctorUserId,
                    patientName + " requested to reschedule an appointment for "
                            + appointment.getAppointmentDateTime()
                                    .format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a")),
                    "APPOINTMENT_RESCHEDULE_REQUEST");

        } catch (Exception e) {
            System.err.println("Reschedule notification failed: " + e.getMessage());
        }
    }

    private String buildAppointmentRequestEmail(Appointment appointment) {
        String patientName = safeFullName(
                appointment.getPatient().getFirstName(),
                appointment.getPatient().getLastName());

        return "<!DOCTYPE html>" +
                "<html><body style='font-family:Arial,sans-serif;background:#f8fafc;padding:24px;'>" +
                "<div style='max-width:600px;margin:auto;background:#ffffff;padding:28px;border-radius:12px;'>" +
                "<h2 style='color:#1e293b;'>New Appointment Request</h2>" +
                "<p><strong>Patient:</strong> " + escapeHtml(patientName) + "</p>" +
                "<p><strong>Date:</strong> " + appointment.getAppointmentDateTime().toLocalDate() + "</p>" +
                "<p><strong>Time:</strong> " + appointment.getAppointmentDateTime().toLocalTime() + "</p>" +
                "<p><strong>Reason:</strong> " + escapeHtml(appointment.getReason()) + "</p>" +
                "<p>Please log in to MedVault to approve or reject this appointment.</p>" +
                "</div>" +
                "</body></html>";
    }

    private String buildAppointmentConfirmedEmail(Appointment appointment) {
        String doctorName = "Dr. " + safeFullName(
                appointment.getDoctor().getFirstName(),
                appointment.getDoctor().getLastName());

        return "<!DOCTYPE html>" +
                "<html><body style='font-family:Arial,sans-serif;background:#f8fafc;padding:24px;'>" +
                "<div style='max-width:600px;margin:auto;background:#ffffff;padding:28px;border-radius:12px;'>" +
                "<h2 style='color:#16a34a;'>Appointment Confirmed</h2>" +
                "<p>Your appointment has been confirmed.</p>" +
                "<p><strong>Doctor:</strong> " + escapeHtml(doctorName) + "</p>" +
                "<p><strong>Date:</strong> " + appointment.getAppointmentDateTime().toLocalDate() + "</p>" +
                "<p><strong>Time:</strong> " + appointment.getAppointmentDateTime().toLocalTime() + "</p>" +
                "</div>" +
                "</body></html>";
    }

    private String safeFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }

    private String escapeHtml(String value) {
        if (value == null)
            return "";

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}