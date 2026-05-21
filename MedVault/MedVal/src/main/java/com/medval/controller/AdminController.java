package com.medval.controller;

import com.medval.model.*;
import com.medval.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private AdminRepository adminRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private MedicalRecordRepository medicalRecordRepository;
    @Autowired private MedicalConditionRepository medicalConditionRepository;
    @Autowired private MedicationRepository medicationRepository;
    @Autowired private DoctorQualificationRepository qualificationRepository;
    @Autowired private DoctorSlotRepository slotRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private EmergencyRequestRepository emergencyRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private com.medval.service.AdminService adminService;
    @Autowired private com.medval.service.NotificationService notificationService;

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
    
    // Debug endpoint to list all users
    @GetMapping("/debug/users")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
            .map(u -> {
                Map<String, Object> map = new HashMap<>();
                map.put("userId", u.getUserId());
                map.put("email", u.getEmail());
                map.put("role", u.getRole());
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of(
            "totalUsers", users.size(),
            "totalAdmins", adminRepository.count(),
            "users", users
        ));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Map<String, Object>>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll().stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("patientId", p.getPatientId());
            map.put("firstName", p.getFirstName());
            map.put("lastName", p.getLastName());
            map.put("name", p.getFirstName() + " " + p.getLastName());
            map.put("email", p.getUser().getEmail());
            map.put("phone", p.getPhone());
            map.put("dateOfBirth", p.getDateOfBirth());
            map.put("gender", p.getGender());
            map.put("bloodGroup", p.getBloodGroup());
            map.put("address", p.getAddress());
            map.put("city", p.getCity());
            map.put("state", p.getState());
            map.put("dateJoined", p.getCreatedAt());
            
            // Count appointments
            long totalAppointments = appointmentRepository.findByPatient(p).size();
            long completedAppointments = appointmentRepository.findByPatient(p).stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                .count();
            long upcomingAppointments = appointmentRepository.findByPatient(p).stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.APPROVED)
                .count();
            
            map.put("totalAppointments", totalAppointments);
            map.put("completedAppointments", completedAppointments);
            map.put("upcomingAppointments", upcomingAppointments);
            
            // Count medical records
            long totalRecords = medicalRecordRepository.findByPatient(p).size();
            map.put("totalRecords", totalRecords);
            
            // Count conditions
            long totalConditions = medicalConditionRepository.findByPatient(p).size();
            map.put("totalConditions", totalConditions);
            
            return map;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatientDetails(@PathVariable String id) {
        return patientRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patients/{id}/appointments")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String id) {
        return patientRepository.findById(id)
            .map(p -> ResponseEntity.ok(appointmentRepository.findByPatient(p)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patients/{id}/medical-records")
    public ResponseEntity<List<MedicalRecord>> getPatientMedicalRecords(@PathVariable String id) {
        return patientRepository.findById(id)
            .map(p -> ResponseEntity.ok(medicalRecordRepository.findByPatient(p)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patients/{id}/health-records")
    public ResponseEntity<Map<String, Object>> getPatientHealthRecords(@PathVariable String id) {
        return patientRepository.findById(id).map(p -> {
            Map<String, Object> health = new HashMap<>();
            health.put("conditions", medicalConditionRepository.findByPatient(p));
            health.put("medications", medicationRepository.findByPatient(p));
            return ResponseEntity.ok(health);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll().stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("professionalId", d.getProfessionalId());
            map.put("firstName", d.getFirstName());
            map.put("lastName", d.getLastName());
            map.put("name", d.getFirstName() + " " + d.getLastName());
            map.put("email", d.getUser().getEmail());
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
        }).collect(Collectors.toList()));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctorDetails(@PathVariable String id) {
        return doctorRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable String id) {
        return doctorRepository.findById(id)
            .map(d -> ResponseEntity.ok(appointmentRepository.findByDoctor(d)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/qualifications")
    public ResponseEntity<List<Map<String, Object>>> getDoctorQualifications(@PathVariable String id) {
        return doctorRepository.findById(id)
            .map(d -> {
                List<Map<String, Object>> qualifications = qualificationRepository.findByDoctor(d).stream()
                    .map(q -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("qualificationId", q.getQualificationId());
                        map.put("documentName", q.getDocumentName());
                        map.put("documentType", q.getDocumentType());
                        map.put("documentPath", q.getDocumentPath());
                        map.put("uploadedAt", q.getUploadedAt());
                        map.put("verificationStatus", q.getVerificationStatus());
                        map.put("doctorId", d.getProfessionalId());
                        map.put("doctorName", "Dr. " + d.getFirstName() + " " + d.getLastName());
                        // Add verified status based on verification status
                        map.put("isVerified", "APPROVED".equals(q.getVerificationStatus()));
                        map.put("verified", "APPROVED".equals(q.getVerificationStatus()));
                        return map;
                    })
                    .collect(Collectors.toList());
                return ResponseEntity.ok(qualifications);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/qualifications/all")
    public ResponseEntity<List<Map<String, Object>>> getAllQualifications() {
        List<Map<String, Object>> allQualifications = qualificationRepository.findAll().stream()
            .map(q -> {
                Map<String, Object> map = new HashMap<>();
                map.put("qualificationId", q.getQualificationId());
                map.put("documentName", q.getDocumentName());
                map.put("documentType", q.getDocumentType());
                map.put("documentPath", q.getDocumentPath());
                map.put("uploadedAt", q.getUploadedAt());
                map.put("verificationStatus", q.getVerificationStatus());
                map.put("doctorId", q.getDoctor().getProfessionalId());
                map.put("doctorName", "Dr. " + q.getDoctor().getFirstName() + " " + q.getDoctor().getLastName());
                map.put("doctorEmail", q.getDoctor().getUser().getEmail());
                map.put("specialization", q.getDoctor().getSpecialization());
                // Add verified status based on verification status
                map.put("isVerified", "APPROVED".equals(q.getVerificationStatus()));
                map.put("verified", "APPROVED".equals(q.getVerificationStatus()));
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(allQualifications);
    }

    @PutMapping("/doctors/qualifications/{qualId}/verify")
    public ResponseEntity<?> verifyQualification(@PathVariable Long qualId) {
        return qualificationRepository.findById(qualId).map(q -> {
            q.setVerificationStatus("APPROVED");
            qualificationRepository.save(q);
            
            Doctor doctor = q.getDoctor();
            
            // Check if ALL qualifications for this doctor are approved
            List<DoctorQualification> allQualifications = qualificationRepository.findByDoctor(doctor);
            boolean allApproved = allQualifications.stream()
                .allMatch(qual -> "APPROVED".equals(qual.getVerificationStatus()));
            
            // Only set doctor as verified if ALL qualifications are approved
            if (allApproved) {
                doctor.setVerified(true);
                doctorRepository.save(doctor);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("qualificationId", q.getQualificationId());
            response.put("verificationStatus", q.getVerificationStatus());
            response.put("doctorVerified", doctor.isVerified());
            response.put("message", allApproved ? "All qualifications approved. Doctor verified!" : "Qualification approved. Waiting for other qualifications.");
            
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/doctors/{doctorId}/verify")
    public ResponseEntity<?> verifyDoctorByProfessionalId(@PathVariable String doctorId) {
        return doctorRepository.findById(doctorId).map(doctor -> {
            // Verify all qualifications for this doctor
            List<DoctorQualification> qualifications = qualificationRepository.findByDoctor(doctor);
            for (DoctorQualification q : qualifications) {
                q.setVerificationStatus("APPROVED");
                qualificationRepository.save(q);
            }
            // Set doctor as verified
            doctor.setVerified(true);
            doctorRepository.save(doctor);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Doctor verified successfully");
            response.put("doctorId", doctorId);
            response.put("isVerified", true);
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/slots")
    public ResponseEntity<List<Map<String, Object>>> getDoctorSlots(@PathVariable String id) {
        return doctorRepository.findById(id)
            .map(d -> {
                List<Map<String, Object>> slots = slotRepository.findByDoctor(d).stream()
                    .map(slot -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("slotId", slot.getSlotId());
                        map.put("doctorId", d.getProfessionalId());
                        map.put("slotDate", slot.getSlotDate());
                        map.put("slotTime", slot.getSlotTime());
                        map.put("isAvailable", slot.getIsAvailable());
                        map.put("isBooked", !slot.getIsAvailable());
                        map.put("createdAt", slot.getCreatedAt());
                        return map;
                    })
                    .collect(Collectors.toList());
                return ResponseEntity.ok(slots);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors/{id}/reviews")
    public ResponseEntity<List<Review>> getDoctorReviews(@PathVariable String id) {
        return doctorRepository.findById(id)
            .map(d -> ResponseEntity.ok(reviewRepository.findByAppointment_Doctor(d)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {
        List<Map<String, Object>> allAppointments = new ArrayList<>();
        
        // 1. Get regular appointments
        List<Map<String, Object>> appointments = appointmentRepository.findAll().stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("appointmentId", a.getAppointmentId());
            map.put("patientId", a.getPatient().getPatientId());
            map.put("patientName", a.getPatient().getFirstName() + " " + a.getPatient().getLastName());
            map.put("doctorId", a.getDoctor().getProfessionalId());
            map.put("doctorName", "Dr. " + a.getDoctor().getFirstName() + " " + a.getDoctor().getLastName());
            map.put("appointmentDateTime", a.getAppointmentDateTime());
            map.put("reason", a.getReason());
            map.put("status", a.getStatus().toString());
            map.put("consultationFee", a.getDoctor().getConsultationFee());
            map.put("type", "REGULAR"); // Mark as regular appointment
            
            // Include review/feedback if exists
            Optional<Review> review = reviewRepository.findByAppointment(a);
            if (review.isPresent()) {
                map.put("feedback", review.get().getFeedback());
                map.put("rating", review.get().getRating());
            } else {
                map.put("feedback", null);
                map.put("rating", null);
            }
            
            return map;
        }).collect(Collectors.toList());
        
        // 2. Get emergency appointments that are completed (COMPLETED status OR APPROVED with past date)
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        List<Map<String, Object>> emergencyAppointments = emergencyRepository.findAll().stream()
            .filter(e -> e.getStatus() == com.medval.model.EmergencyRequest.EmergencyStatus.COMPLETED || 
                        (e.getStatus() == com.medval.model.EmergencyRequest.EmergencyStatus.APPROVED && 
                         e.getRequestDateTime().isBefore(now)))
            .map(e -> {
                Map<String, Object> map = new HashMap<>();
                map.put("appointmentId", e.getRequestId().toString()); // Use requestId as appointmentId
                map.put("patientId", e.getPatient().getPatientId());
                map.put("patientName", e.getPatient().getFirstName() + " " + e.getPatient().getLastName());
                map.put("doctorId", e.getDoctor().getProfessionalId());
                map.put("doctorName", "Dr. " + e.getDoctor().getFirstName() + " " + e.getDoctor().getLastName());
                map.put("appointmentDateTime", e.getRequestDateTime());
                map.put("reason", e.getConditionDescription()); // Remove "EMERGENCY:" prefix
                map.put("status", "COMPLETED");
                map.put("consultationFee", e.getDoctor().getConsultationFee());
                map.put("type", "EMERGENCY"); // Mark as emergency appointment
                map.put("urgencyLevel", e.getUrgencyLevel().toString());
                
                // Include review/feedback if exists for emergency request
                Optional<Review> review = reviewRepository.findByEmergencyRequest(e);
                if (review.isPresent()) {
                    map.put("feedback", review.get().getFeedback());
                    map.put("rating", review.get().getRating());
                } else {
                    map.put("feedback", null);
                    map.put("rating", null);
                }
                
                return map;
            }).collect(Collectors.toList());
        
        // Combine both lists
        allAppointments.addAll(appointments);
        allAppointments.addAll(emergencyAppointments);
        
        return ResponseEntity.ok(allAppointments);
    }

    @GetMapping("/appointments/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(appointmentRepository.findByStatus(Appointment.AppointmentStatus.valueOf(status.toUpperCase())));
    }

    @Autowired private com.medval.service.EmergencyRequestService emergencyRequestService;

    @GetMapping("/emergency-requests")
    public ResponseEntity<List<Map<String, Object>>> getEmergencyRequests() {
        return ResponseEntity.ok(emergencyRepository.findAll().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("requestId", e.getRequestId());
            
            // Patient info
            Patient patient = e.getPatient();
            map.put("patientId", patient.getPatientId());
            map.put("patientName", patient.getFirstName() + " " + patient.getLastName());
            
            // Add patient object with detailed info
            Map<String, Object> patientMap = new HashMap<>();
            patientMap.put("patientId", patient.getPatientId());
            patientMap.put("firstName", patient.getFirstName());
            patientMap.put("lastName", patient.getLastName());
            map.put("patient", patientMap);
            
            // Doctor info
            map.put("doctorId", e.getDoctor().getProfessionalId());
            map.put("doctorName", "Dr. " + e.getDoctor().getFirstName() + " " + e.getDoctor().getLastName());
            map.put("conditionDescription", e.getConditionDescription());
            map.put("urgencyLevel", e.getUrgencyLevel().toString());
            map.put("currentLocation", e.getCurrentLocation());
            map.put("requestDateTime", e.getRequestDateTime());
            map.put("status", e.getStatus().toString());
            Double fee = e.getDoctor().getConsultationFee();
            map.put("consultationFee", fee != null ? fee : 500.0);
            return map;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Map<String, Object>>> getAllPrescriptions() {
        return ResponseEntity.ok(medicationRepository.findAll().stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("medicationId", m.getMedicationId());
            map.put("patientName", m.getPatient().getFirstName() + " " + m.getPatient().getLastName());
            map.put("doctorName", m.getPrescribedBy());
            map.put("medicationName", m.getMedicationName());
            map.put("dosage", m.getDosage());
            map.put("startDate", m.getStartDate());
            return map;
        }).collect(Collectors.toList()));
    }
    
    // Notification endpoints
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
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }
    
    @PutMapping("/notifications/{adminId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String adminId) {
        notificationService.markAllNotificationsAsRead(adminId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
    
    @PostMapping("/invite-doctor")
    public ResponseEntity<?> inviteDoctor(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        try {
            String subject = "You're Invited to Join MedVault - Your Trusted Healthcare Partner!";
            String registrationLink = "http://localhost:5173/#doctor";
            String doctorName = (name != null && !name.trim().isEmpty()) ? name : "Doctor";
            
            String htmlBody = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>" +
                
                // Header with gradient
                "<div style='background: linear-gradient(135deg, #7c3aed 0%, #10b981 50%, #fbbf24 100%); padding: 40px 30px; text-align: left;'>" +
                "<h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;'>🏥 MedVault</h1>" +
                "<p style='color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;'>Your Trusted Healthcare Management Partner</p>" +
                "</div>" +
                
                // Content - Left aligned
                "<div style='padding: 40px 30px; text-align: left;'>" +
                "<h2 style='color: #1e293b; margin: 0 0 20px 0; font-size: 26px;'>Hello " + doctorName + "! 👋</h2>" +
                "<p style='color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;'>" +
                "We are <strong>thrilled</strong> to invite you to join <strong style='color: #7c3aed;'>MedVault</strong> - India's most trusted and secure healthcare management platform! 🎉" +
                "</p>" +
                "<p style='color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;'>" +
                "Thousands of medical professionals across the country trust MedVault to streamline their practice and deliver exceptional patient care." +
                "</p>" +
                
                "<p style='color: #1e293b; font-size: 18px; font-weight: 700; margin: 25px 0 15px 0;'>✨ As a MedVault practitioner, you will be able to:</p>" +
                
                "<div style='background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); border-radius: 16px; padding: 25px; margin: 0 0 25px 0; border-left: 4px solid #7c3aed;'>" +
                "<div style='margin-bottom: 14px; display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>📅</span> <span style='color: #334155; font-size: 15px;'>Manage your appointments efficiently</span></div>" +
                "<div style='margin-bottom: 14px; display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>🔒</span> <span style='color: #334155; font-size: 15px;'>Access patient medical records (with consent)</span></div>" +
                "<div style='margin-bottom: 14px; display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>🗓️</span> <span style='color: #334155; font-size: 15px;'>Set and customize your availability</span></div>" +
                "<div style='margin-bottom: 14px; display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>💰</span> <span style='color: #334155; font-size: 15px;'>Specify and update your consultation fees</span></div>" +
                "<div style='margin-bottom: 14px; display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>💬</span> <span style='color: #334155; font-size: 15px;'>Communicate with patients through secure messaging</span></div>" +
                "<div style='margin-bottom: 14px; display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>👤</span> <span style='color: #334155; font-size: 15px;'>Maintain and enhance your professional profile</span></div>" +
                "<div style='margin-bottom: 14px; display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>⭐</span> <span style='color: #334155; font-size: 15px;'>View and monitor patient feedback and ratings</span></div>" +
                "<div style='display: flex; align-items: center;'><span style='font-size: 20px; margin-right: 12px;'>📊</span> <span style='color: #334155; font-size: 15px;'>Track your earnings and payment settlements</span></div>" +
                "</div>" +
                
                "<p style='color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;'>" +
                "Ready to transform your practice? Click the button below to complete your registration and join our growing community of healthcare professionals! 🚀" +
                "</p>" +
                
                // CTA Button - Left aligned
                "<div style='text-align: left; margin: 30px 0;'>" +
                "<a href='" + registrationLink + "' style='display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; padding: 18px 45px; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);'>🎯 Register Now →</a>" +
                "</div>" +
                
                "<p style='color: #94a3b8; font-size: 13px; margin: 25px 0 0 0;'>If the button doesn't work, copy and paste this link into your browser:</p>" +
                "<p style='color: #7c3aed; font-size: 13px; word-break: break-all;'>" + registrationLink + "</p>" +
                "</div>" +
                
                // Footer
                "<div style='background-color: #f1f5f9; padding: 25px 30px; text-align: left; border-top: 1px solid #e2e8f0;'>" +
                "<p style='color: #64748b; font-size: 13px; margin: 0 0 8px 0;'>💌 This is an automated invitation from MedVault.</p>" +
                "<p style='color: #94a3b8; font-size: 12px; margin: 0;'>© 2025 MedVault Healthcare Solutions. All rights reserved.</p>" +
                "</div>" +
                
                "</div>" +
                "</body>" +
                "</html>";
            
            adminService.sendDoctorInvitation(email, subject, htmlBody);
            
            return ResponseEntity.ok(Map.of(
                "message", "Invitation sent successfully to " + email,
                "email", email
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send invitation: " + e.getMessage()));
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
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send emergency reminder: " + e.getMessage()));
        }
    }
    
    /**
     * Sync verification status from healthcare_professionals to users table
     * This endpoint can be called manually or scheduled to run periodically
     */
    @PostMapping("/sync-verification")
    public ResponseEntity<?> syncDoctorVerification() {
        try {
            int updatedCount = adminService.syncDoctorVerificationStatus();
            return ResponseEntity.ok(Map.of(
                "message", "Verification status synced successfully",
                "updatedCount", updatedCount
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to sync verification status: " + e.getMessage()
            ));
        }
    }
}
