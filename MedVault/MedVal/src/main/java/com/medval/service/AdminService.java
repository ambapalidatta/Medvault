package com.medval.service;

import com.medval.model.Admin;
import com.medval.model.Doctor;
import com.medval.model.User;
import com.medval.repository.AdminRepository;
import com.medval.repository.DoctorRepository;
import com.medval.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;
    private final NotificationService notificationService;
    private final DoctorRepository doctorRepository;

    public AdminService(
            AdminRepository adminRepository,
            UserRepository userRepository,
            EmailNotificationService emailNotificationService,
            NotificationService notificationService,
            DoctorRepository doctorRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.emailNotificationService = emailNotificationService;
        this.notificationService = notificationService;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> getAdminProfileByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());

        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return Optional.empty();
        }

        Optional<Admin> adminOpt = adminRepository.findByUser(user);

        if (adminOpt.isEmpty()) {
            return Optional.empty();
        }

        Admin admin = adminOpt.get();

        Map<String, Object> profile = new HashMap<>();
        profile.put("adminId", admin.getAdminId());
        profile.put("userId", user.getUserId());
        profile.put("firstName", admin.getFirstName());
        profile.put("lastName", admin.getLastName());
        profile.put("name", safeFullName(admin.getFirstName(), admin.getLastName()));
        profile.put("email", user.getEmail());
        profile.put("phone", admin.getPhone());
        profile.put("department", admin.getDepartment());
        profile.put("role", "ADMIN");
        profile.put("createdAt", admin.getCreatedAt());

        String profilePictureUrl = admin.getProfilePictureUrl();

        if (profilePictureUrl != null && !profilePictureUrl.isBlank()) {
            profile.put("profilePictureUrl", profilePictureUrl);
        } else {
            String encodedName = URLEncoder.encode(
                    safeFullName(admin.getFirstName(), admin.getLastName()),
                    StandardCharsets.UTF_8);

            profile.put(
                    "profilePictureUrl",
                    "https://ui-avatars.com/api/?name=" + encodedName + "&background=6366f1&color=fff&size=200");
        }

        return Optional.of(profile);
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> getAdminProfileByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return Optional.empty();
        }

        return userRepository.findById(userId)
                .flatMap(user -> getAdminProfileByEmail(user.getEmail()));
    }

    @Transactional
    public void sendDoctorInvitation(String email, String subject, String htmlBody) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Doctor email is required.");
        }

        emailNotificationService.sendHtmlEmail(email.trim(), subject, htmlBody);

        notificationService.notifyAdmins(
                "Doctor invitation sent to: " + email.trim(),
                "DOCTOR_INVITATION_SENT");
    }

    @Transactional
    public int syncDoctorVerificationStatus() {
        int updatedCount = 0;

        for (Doctor doctor : doctorRepository.findAll()) {
            User user = doctor.getUser();

            if (user != null && user.isVerified() != doctor.isVerified()) {
                user.setVerified(doctor.isVerified());
                userRepository.save(user);
                updatedCount++;
            }
        }

        return updatedCount;
    }

    private String safeFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }
}