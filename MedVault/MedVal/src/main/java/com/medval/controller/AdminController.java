package com.medval.controller;

import com.medval.model.Appointment;
import com.medval.model.Doctor;
import com.medval.model.DoctorQualification;
import com.medval.model.EmergencyRequest;
import com.medval.model.MedicalRecord;
import com.medval.model.Patient;
import com.medval.model.Review;
import com.medval.repository.AdminRepository;
import com.medval.repository.AppointmentRepository;
import com.medval.repository.DoctorQualificationRepository;
import com.medval.repository.DoctorRepository;
import com.medval.repository.DoctorSlotRepository;
import com.medval.repository.EmergencyRequestRepository;
import com.medval.repository.MedicalConditionRepository;
import com.medval.repository.MedicalRecordRepository;
import com.medval.repository.MedicationRepository;
import com.medval.repository.PatientRepository;
import com.medval.repository.ReviewRepository;
import com.medval.repository.UserRepository;
import com.medval.service.AdminService;
import com.medval.service.EmergencyRequestService;
import com.medval.service.NotificationService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminRepository adminRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalConditionRepository medicalConditionRepository;
    private final MedicationRepository medicationRepository;
    private final DoctorQualificationRepository qualificationRepository;
    private final DoctorSlotRepository slotRepository;
    private final ReviewRepository reviewRepository;
    private final EmergencyRequestRepository emergencyRepository;
    private final UserRepository userRepository;
    private final AdminService adminService;
    private final NotificationService notificationService;
    private final EmergencyRequestService emergencyRequestService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AdminController(
            AdminRepository adminRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            MedicalRecordRepository medicalRecordRepository,
            MedicalConditionRepository medicalConditionRepository,
            MedicationRepository medicationRepository,
            DoctorQualificationRepository qualificationRepository,
            DoctorSlotRepository slotRepository,
            ReviewRepository reviewRepository,
            EmergencyRequestRepository emergencyRepository,
            UserRepository userRepository,
            AdminService adminService,
            NotificationService notificationService,
            EmergencyRequestService emergencyRequestService) {
        this.adminRepository = adminRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicalConditionRepository = medicalConditionRepository;
        this.medicationRepository = medicationRepository;
        this.qualificationRepository = qualificationRepository;
        this.slotRepository = slotRepository;
        this.reviewRepository = reviewRepository;
        this.emergencyRepository = emergencyRepository;
        this.userRepository = userRepository;
        this.adminService = adminService;
        this.notificationService = notificationService;
        this.emergencyRequestService = emergencyRequestService;
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getAdminProfile(@PathVariable String userId) {
        return adminService.getAdminProfileByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/email/{email}")
    public ResponseEntity<?> getAdminProfileByEmail(@PathVariable String email) {
        return adminService.getAdminProfileByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("pendingAppointments", appointmentRepository.countByStatus(Appointment.AppointmentStatus.PENDING));
        stats.put("emergencyRequests", emergencyRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Map<String, Object>>> getAllPatients() {
        List<Map<String, Object>> patients = patientRepository.findAll().stream().map(p -> {
            Map<String, Object> map = new HashMap<>();

            map.put("patientId", p.getPatientId());
            map.put("firstName", p.getFirstName());
            map.put("lastName", p.getLastName());
            map.put("name", safeFullName(p.getFirstName(), p.getLastName()));
            map.put("email", p.getUser() != null ? p.getUser().getEmail() : null);
            map.put("phone", p.getPhone());
            map.put("dateOfBirth", p.getDateOfBirth());
            map.put("gender", p.getGender());
            map.put("bloodGroup", p.getBloodGroup());
            map.put("address", p.getAddress());
            map.put("city", p.getCity());
            map.put("state", p.getState());
            map.put("dateJoined", p.getCreatedAt());

            List<Appointment> appointments = appointmentRepository.findByPatient(p);
            long completedAppointments = appointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                    .count();
            long upcomingAppointments = appointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.APPROVED)
                    .count();

            map.put("totalAppointments", appointments.size());
            map.put("completedAppointments", completedAppointments);
            map.put("upcomingAppointments", upcomingAppointments);
            map.put("totalRecords", medicalRecordRepository.findByPatient(p).size());
            map.put("totalConditions", medicalConditionRepository.findByPatient(p).size());

            return map;
        }).toList();

        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatientDetails(@PathVariable String id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patients/{id}/appointments")
    public ResponseEntity<?> getPatientAppointments(@PathVariable String id) {
        return patientRepository.findById(id)
                .map(p -> ResponseEntity.ok(appointmentRepository.findByPatient(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patients/{id}/medical-records")
    public ResponseEntity<?> getPatientMedicalRecords(@PathVariable String id) {
        return patientRepository.findById(id)
                .map(p -> ResponseEntity.ok(medicalRecordRepository.findByPatient(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patients/{id}/health-records")
    public ResponseEntity<?> getPatientHealthRecords(@PathVariable String id) {
        return patientRepository.findById(id).map(p -> {
            Map<String, Object> health = new HashMap<>();
            health.put("conditions", medicalConditionRepository.findByPatient(p));
            health.put("medications", medicationRepository.findByPatient(p));
            return ResponseEntity.ok(health);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        List<Map<String, Object>> doctors = doctorRepository.findAll().stream().map(d -> {
            Map<String, Object> map = new HashMap<>();

            map.put("professionalId", d.getProfessionalId());
            map.put("firstName", d.getFirstName());
            map.put("lastName", d.getLastName());
            map.put("name", safeFullName(d.getFirstName(), d.getLastName()));
            map.put("email", d.getUser() != null ? d.getUser().getEmail() : null);
            map.put("phone", d.getPhone());
            map.put("specialization", d.getSpecialization());
            map.put("qualification", d.getQualification());
            map.put("experienceYears", d.getExperienceYears());
            map.put("consultationFee", d.getConsultationFee());
            map.put("licenseNumber", d.getLicenseNumber());
            map.put("dateJoined", d.getCreatedAt());
            map.put("isVerified", d.isVerified());
            map.put("verified", d.isVerified());

            return map;
        }).toList();

        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctorDetails(@PathVariable String id) {
        return doctorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/appointments")
    public ResponseEntity<?> getDoctorAppointments(@PathVariable String id) {
        return doctorRepository.findById(id)
                .map(d -> ResponseEntity.ok(appointmentRepository.findByDoctor(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/qualifications")
    public ResponseEntity<?> getDoctorQualifications(@PathVariable String id) {
        return doctorRepository.findById(id)
                .map(d -> ResponseEntity.ok(
                        qualificationRepository.findByDoctor(d).stream()
                                .map(q -> qualificationToMap(q, d))
                                .toList()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/qualifications/all")
    public ResponseEntity<List<Map<String, Object>>> getAllQualifications() {
        List<Map<String, Object>> allQualifications = qualificationRepository.findAll().stream()
                .map(q -> qualificationToMap(q, q.getDoctor()))
                .toList();

        return ResponseEntity.ok(allQualifications);
    }

    @PutMapping("/doctors/qualifications/{qualId}/verify")
    public ResponseEntity<?> verifyQualification(@PathVariable Long qualId) {
        return qualificationRepository.findById(qualId).map(q -> {
            q.setVerificationStatus("APPROVED");
            qualificationRepository.save(q);

            Doctor doctor = q.getDoctor();

            List<DoctorQualification> allQualifications = qualificationRepository.findByDoctor(doctor);
            boolean allApproved = allQualifications.stream()
                    .allMatch(qual -> "APPROVED".equals(qual.getVerificationStatus()));

            if (allApproved) {
                doctor.setVerified(true);

                if (doctor.getUser() != null) {
                    doctor.getUser().setVerified(true);
                    userRepository.save(doctor.getUser());
                }

                doctorRepository.save(doctor);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("qualificationId", q.getQualificationId());
            response.put("verificationStatus", q.getVerificationStatus());
            response.put("doctorVerified", doctor.isVerified());
            response.put("message", allApproved
                    ? "All qualifications approved. Doctor verified."
                    : "Qualification approved. Waiting for other qualifications.");

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/doctors/{doctorId}/verify")
    public ResponseEntity<?> verifyDoctorByProfessionalId(@PathVariable String doctorId) {
        return doctorRepository.findById(doctorId).map(doctor -> {
            List<DoctorQualification> qualifications = qualificationRepository.findByDoctor(doctor);

            for (DoctorQualification q : qualifications) {
                q.setVerificationStatus("APPROVED");
                qualificationRepository.save(q);
            }

            doctor.setVerified(true);

            if (doctor.getUser() != null) {
                doctor.getUser().setVerified(true);
                userRepository.save(doctor.getUser());
            }

            doctorRepository.save(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Doctor verified successfully.");
            response.put("doctorId", doctorId);
            response.put("isVerified", true);

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/slots")
    public ResponseEntity<?> getDoctorSlots(@PathVariable String id) {
        return doctorRepository.findById(id)
                .map(d -> ResponseEntity.ok(
                        slotRepository.findByDoctor(d).stream().map(slot -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("slotId", slot.getSlotId());
                            map.put("doctorId", d.getProfessionalId());
                            map.put("slotDate", slot.getSlotDate());
                            map.put("slotTime", slot.getSlotTime());
                            map.put("isAvailable", slot.getIsAvailable());
                            map.put("isBooked", !slot.getIsAvailable());
                            map.put("createdAt", slot.getCreatedAt());
                            return map;
                        }).toList()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/reviews")
    public ResponseEntity<?> getDoctorReviews(@PathVariable String id) {
        return doctorRepository.findById(id)
                .map(d -> ResponseEntity.ok(reviewRepository.findByAppointment_Doctor(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {
        List<Map<String, Object>> allAppointments = new ArrayList<>();

        List<Map<String, Object>> appointments = appointmentRepository.findAll().stream().map(a -> {
            Map<String, Object> map = new HashMap<>();

            map.put("appointmentId", a.getAppointmentId());
            map.put("patientId", a.getPatient().getPatientId());
            map.put("patientName", safeFullName(a.getPatient().getFirstName(), a.getPatient().getLastName()));
            map.put("doctorId", a.getDoctor().getProfessionalId());
            map.put("doctorName", "Dr. " + safeFullName(a.getDoctor().getFirstName(), a.getDoctor().getLastName()));
            map.put("appointmentDateTime", a.getAppointmentDateTime());
            map.put("reason", a.getReason());
            map.put("status", a.getStatus().toString());
            map.put("consultationFee", a.getDoctor().getConsultationFee());
            map.put("type", "REGULAR");

            Optional<Review> review = reviewRepository.findByAppointment(a);
            map.put("feedback", review.map(Review::getFeedback).orElse(null));
            map.put("rating", review.map(Review::getRating).orElse(null));

            return map;
        }).toList();

        LocalDateTime now = LocalDateTime.now();

        List<Map<String, Object>> emergencyAppointments = emergencyRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmergencyRequest.EmergencyStatus.COMPLETED ||
                        (e.getStatus() == EmergencyRequest.EmergencyStatus.APPROVED &&
                                e.getRequestDateTime().isBefore(now)))
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();

                    map.put("appointmentId", e.getRequestId().toString());
                    map.put("patientId", e.getPatient().getPatientId());
                    map.put("patientName", safeFullName(e.getPatient().getFirstName(), e.getPatient().getLastName()));
                    map.put("doctorId", e.getDoctor().getProfessionalId());
                    map.put("doctorName",
                            "Dr. " + safeFullName(e.getDoctor().getFirstName(), e.getDoctor().getLastName()));
                    map.put("appointmentDateTime", e.getRequestDateTime());
                    map.put("reason", e.getConditionDescription());
                    map.put("status", "COMPLETED");
                    map.put("consultationFee", e.getDoctor().getConsultationFee());
                    map.put("type", "EMERGENCY");
                    map.put("urgencyLevel", e.getUrgencyLevel().toString());

                    Optional<Review> review = reviewRepository.findByEmergencyRequest(e);
                    map.put("feedback", review.map(Review::getFeedback).orElse(null));
                    map.put("rating", review.map(Review::getRating).orElse(null));

                    return map;
                }).toList();

        allAppointments.addAll(appointments);
        allAppointments.addAll(emergencyAppointments);

        return ResponseEntity.ok(allAppointments);
    }

    @GetMapping("/appointments/status/{status}")
    public ResponseEntity<?> getAppointmentsByStatus(@PathVariable String status) {
        try {
            Appointment.AppointmentStatus appointmentStatus = Appointment.AppointmentStatus
                    .valueOf(status.toUpperCase());

            return ResponseEntity.ok(appointmentRepository.findByStatus(appointmentStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid appointment status."));
        }
    }

    @GetMapping("/emergency-requests")
    public ResponseEntity<List<Map<String, Object>>> getEmergencyRequests() {
        List<Map<String, Object>> emergencyRequests = emergencyRepository.findAll().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();

            Patient patient = e.getPatient();
            Doctor doctor = e.getDoctor();

            map.put("requestId", e.getRequestId());
            map.put("patientId", patient.getPatientId());
            map.put("patientName", safeFullName(patient.getFirstName(), patient.getLastName()));

            Map<String, Object> patientMap = new HashMap<>();
            patientMap.put("patientId", patient.getPatientId());
            patientMap.put("firstName", patient.getFirstName());
            patientMap.put("lastName", patient.getLastName());
            map.put("patient", patientMap);

            map.put("doctorId", doctor.getProfessionalId());
            map.put("doctorName", "Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName()));
            map.put("conditionDescription", e.getConditionDescription());
            map.put("urgencyLevel", e.getUrgencyLevel().toString());
            map.put("currentLocation", e.getCurrentLocation());
            map.put("requestDateTime", e.getRequestDateTime());
            map.put("status", e.getStatus().toString());

            Double fee = doctor.getConsultationFee();
            map.put("consultationFee", fee != null ? fee : 500.0);

            return map;
        }).toList();

        return ResponseEntity.ok(emergencyRequests);
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Map<String, Object>>> getAllPrescriptions() {
        List<Map<String, Object>> prescriptions = medicationRepository.findAll().stream().map(m -> {
            Map<String, Object> map = new HashMap<>();

            map.put("medicationId", m.getMedicationId());
            map.put("patientName", safeFullName(m.getPatient().getFirstName(), m.getPatient().getLastName()));
            map.put("doctorName", m.getPrescribedBy());
            map.put("medicationName", m.getMedicationName());
            map.put("dosage", m.getDosage());
            map.put("startDate", m.getStartDate());

            return map;
        }).toList();

        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/notifications/{adminId}")
    public ResponseEntity<?> getNotifications(@PathVariable String adminId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(adminId));
    }

    @GetMapping("/notifications/{adminId}/unread")
    public ResponseEntity<?> getUnreadNotifications(@PathVariable String adminId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsByUserId(adminId));
    }

    @GetMapping("/notifications/{adminId}/count")
    public ResponseEntity<?> getUnreadCount(@PathVariable String adminId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(adminId)));
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read."));
    }

    @PutMapping("/notifications/{adminId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String adminId) {
        notificationService.markAllNotificationsAsRead(adminId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read."));
    }

    @PostMapping("/invite-doctor")
    public ResponseEntity<?> inviteDoctor(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }

        try {
            String doctorName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Doctor";
            String registrationLink = buildFrontendUrl("#doctor");

            String subject = "You're invited to join MedVault";
            String htmlBody = buildDoctorInvitationEmail(doctorName, registrationLink);

            adminService.sendDoctorInvitation(email.trim(), subject, htmlBody);

            return ResponseEntity.ok(Map.of(
                    "message", "Invitation sent successfully.",
                    "email", email.trim()));
        } catch (Exception e) {
            System.err.println("Doctor invitation failed for " + email + ": " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to send invitation. Please try again later."));
        }
    }

    @PostMapping("/emergency-requests/{requestId}/remind")
    public ResponseEntity<?> sendEmergencyReminder(@PathVariable Long requestId) {
        try {
            emergencyRequestService.sendEmergencyReminderToDoctor(requestId);
            return ResponseEntity.ok(Map.of("message", "Emergency reminder sent to doctor successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Emergency reminder failed for request " + requestId + ": " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to send emergency reminder. Please try again later."));
        }
    }

    @PostMapping("/sync-verification")
    public ResponseEntity<?> syncDoctorVerification() {
        try {
            int updatedCount = adminService.syncDoctorVerificationStatus();

            return ResponseEntity.ok(Map.of(
                    "message", "Verification status synced successfully.",
                    "updatedCount", updatedCount));
        } catch (Exception e) {
            System.err.println("Verification sync failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to sync verification status. Please try again later."));
        }
    }

    private Map<String, Object> qualificationToMap(DoctorQualification q, Doctor doctor) {
        Map<String, Object> map = new HashMap<>();

        map.put("qualificationId", q.getQualificationId());
        map.put("documentName", q.getDocumentName());
        map.put("documentType", q.getDocumentType());
        map.put("documentPath", q.getDocumentPath());
        map.put("uploadedAt", q.getUploadedAt());
        map.put("verificationStatus", q.getVerificationStatus());

        if (doctor != null) {
            map.put("doctorId", doctor.getProfessionalId());
            map.put("doctorName", "Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName()));
            map.put("doctorEmail", doctor.getUser() != null ? doctor.getUser().getEmail() : null);
            map.put("specialization", doctor.getSpecialization());
        }

        boolean isApproved = "APPROVED".equals(q.getVerificationStatus());
        map.put("isVerified", isApproved);
        map.put("verified", isApproved);

        return map;
    }

    private String buildFrontendUrl(String pathOrHash) {
        String baseUrl = frontendUrl == null || frontendUrl.isBlank()
                ? "http://localhost:5173"
                : frontendUrl.split(",")[0].trim();

        if (pathOrHash == null || pathOrHash.isBlank()) {
            return baseUrl;
        }

        if (pathOrHash.startsWith("#")) {
            return baseUrl + "/" + pathOrHash;
        }

        if (pathOrHash.startsWith("/")) {
            return baseUrl + pathOrHash;
        }

        return baseUrl + "/" + pathOrHash;
    }

    private String buildDoctorInvitationEmail(String doctorName, String registrationLink) {
        String safeDoctorName = escapeHtml(doctorName);
        String safeLink = escapeHtml(registrationLink);

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f8fafc;'>" +
                "<div style='max-width:600px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.12);'>"
                +
                "<div style='background:linear-gradient(135deg,#7c3aed 0%,#10b981 50%,#fbbf24 100%);padding:40px 30px;color:#ffffff;'>"
                +
                "<h1 style='margin:0;font-size:32px;font-weight:bold;'>MedVault</h1>" +
                "<p style='margin:10px 0 0;font-size:16px;opacity:0.95;'>Your trusted healthcare management partner</p>"
                +
                "</div>" +
                "<div style='padding:40px 30px;'>" +
                "<h2 style='color:#1e293b;margin:0 0 20px;font-size:26px;'>Hello " + safeDoctorName + "!</h2>" +
                "<p style='color:#475569;font-size:16px;line-height:1.8;margin:0 0 20px;'>" +
                "You are invited to join <strong style='color:#7c3aed;'>MedVault</strong>, a secure healthcare management platform for doctors and patients."
                +
                "</p>" +
                "<p style='color:#1e293b;font-size:18px;font-weight:700;margin:25px 0 15px;'>As a MedVault practitioner, you can:</p>"
                +
                "<ul style='color:#334155;font-size:15px;line-height:1.9;background:#f8fafc;border-left:4px solid #7c3aed;border-radius:12px;padding:20px 24px;margin:0 0 25px;'>"
                +
                "<li>Manage appointments efficiently</li>" +
                "<li>Access patient medical records with consent</li>" +
                "<li>Set availability and consultation fees</li>" +
                "<li>Maintain your professional profile</li>" +
                "<li>Track patient feedback and ratings</li>" +
                "</ul>" +
                "<div style='text-align:left;margin:30px 0;'>" +
                "<a href='" + safeLink
                + "' style='display:inline-block;background:#7c3aed;color:#ffffff;padding:16px 36px;text-decoration:none;border-radius:12px;font-size:16px;font-weight:bold;'>Register Now</a>"
                +
                "</div>" +
                "<p style='color:#94a3b8;font-size:13px;margin:25px 0 0;'>If the button does not work, copy this link:</p>"
                +
                "<p style='color:#7c3aed;font-size:13px;word-break:break-all;'>" + safeLink + "</p>" +
                "</div>" +
                "<div style='background:#f1f5f9;padding:24px 30px;color:#64748b;font-size:12px;'>" +
                "This is an automated invitation from MedVault.<br>" +
                "© 2026 MedVault. All rights reserved." +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String safeFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}