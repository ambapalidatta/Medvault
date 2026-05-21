package com.medval.service;

import com.medval.model.Admin;
import com.medval.model.User;
import com.medval.repository.AdminRepository;
import com.medval.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.medval.service.NotificationService;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private com.medval.repository.DoctorRepository doctorRepository;

    /**
     * Get admin profile by email
     * @param email Admin's email address
     * @return Map containing admin profile details
     */
    public Optional<Map<String, Object>> getAdminProfileByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (!userOpt.isPresent()) {
            return Optional.empty();
        }

        User user = userOpt.get();
        Optional<Admin> adminOpt = adminRepository.findByUser(user);

        if (!adminOpt.isPresent()) {
            return Optional.empty();
        }

        Admin admin = adminOpt.get();
        Map<String, Object> profile = new HashMap<>();
        
        profile.put("adminId", admin.getAdminId());
        profile.put("userId", user.getUserId()); // Add userId for notifications
        profile.put("firstName", admin.getFirstName());
        profile.put("lastName", admin.getLastName());
        profile.put("name", admin.getFirstName() + " " + admin.getLastName());
        profile.put("email", user.getEmail());
        profile.put("phone", admin.getPhone());
        profile.put("department", admin.getDepartment());
        profile.put("role", "ADMIN");
        profile.put("createdAt", admin.getCreatedAt());
        
        // Add profile picture URL if available
        String profilePictureUrl = admin.getProfilePictureUrl();
        if (profilePictureUrl != null && !profilePictureUrl.isEmpty()) {
            profile.put("profilePictureUrl", profilePictureUrl);
        } else {
            // Generate default avatar using UI Avatars
            String defaultAvatar = "https://ui-avatars.com/api/?name=" + 
                admin.getFirstName() + "+" + admin.getLastName() + 
                "&background=6366f1&color=fff&size=200";
            profile.put("profilePictureUrl", defaultAvatar);
        }
        
        return Optional.of(profile);
    }

    /**
     * Get admin profile by user ID
     * @param userId User ID
     * @return Map containing admin profile details
     */
    public Optional<Map<String, Object>> getAdminProfileByUserId(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (!userOpt.isPresent()) {
            return Optional.empty();
        }

        return getAdminProfileByEmail(userOpt.get().getEmail());
    }
    
    /**
     * Send doctor invitation email
     * @param email Doctor's email address
     * @param subject Email subject
     * @param htmlBody Email HTML body
     */
    public void sendDoctorInvitation(String email, String subject, String htmlBody) {
        emailNotificationService.sendHtmlEmail(email, subject, htmlBody);
        
        // Notify admins that an invitation email has been sent
        notificationService.notifyAdmins(
            "Doctor Invitation Sent to: " + email,
            "DOCTOR_INVITATION_SENT"
        );
    }
    
    /**
     * Sync verification status from healthcare_professionals to users table
     * This ensures that when a doctor is verified in healthcare_professionals,
     * their user account is also marked as verified
     * @return Number of users updated
     */
    public int syncDoctorVerificationStatus() {
        int updatedCount = 0;
        
        // Get all doctors
        var doctors = doctorRepository.findAll();
        
        for (var doctor : doctors) {
            User user = doctor.getUser();
            if (user != null && user.isVerified() != doctor.isVerified()) {
                // Sync the verification status
                user.setVerified(doctor.isVerified());
                userRepository.save(user);
                updatedCount++;
            }
        }
        
        return updatedCount;
    }
}
