package com.medval.service;

import com.medval.model.Notification;
import com.medval.model.User;
import com.medval.repository.NotificationRepository;
import com.medval.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Creates and saves a new notification.
     * @param userId The ID of the user to whom the notification is addressed.
     * @param message The content of the notification.
     * @param type The type of the notification (e.g., "APPOINTMENT_BOOKED", "PATIENT_REGISTERED").
     * @return The created and saved Notification object.
     */
    public Notification createNotification(String userId, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setRecipientId(userId); // Set recipient_id same as user_id
        notification.setRecipientType("USER"); // Default recipient type
        notification.setTitle(generateTitle(type)); // Generate title from type
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    /**
     * Generates a human-readable title from notification type.
     */
    private String generateTitle(String type) {
        if (type == null) return "Notification";
        switch (type) {
            case "APPOINTMENT_BOOKED": return "New Appointment";
            case "APPOINTMENT_APPROVED": return "Appointment Approved";
            case "APPOINTMENT_REJECTED": return "Appointment Rejected";
            case "APPOINTMENT_REQUEST": return "Appointment Request";
            case "APPOINTMENT_RESCHEDULE_REQUEST": return "Reschedule Request";
            case "CONSENT_REQUEST": return "Access Request";
            case "CONSENT_RESPONSE": return "Access Response";
            case "EMERGENCY_REQUEST": return "Emergency Request";
            case "EMERGENCY_APPROVED": return "Emergency Approved";
            case "EMERGENCY_REJECTED": return "Emergency Rejected";
            case "EMERGENCY_REMINDER": return "Emergency Reminder";
            case "NEW_EMERGENCY_REQUEST": return "New Emergency";
            case "PATIENT_REGISTERED": return "New Patient";
            case "DOCTOR_REGISTERED": return "New Doctor";
            case "DOCTOR_INVITATION_SENT": return "Invitation Sent";
            case "ISSUE_REPORTED": return "Issue Reported";
            default: return "Notification";
        }
    }
    
    public List<Notification> getNotificationsByUserId(String userId) {
        // Return only unread notifications
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public void markNotificationAsRead(String notificationId) {
        Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
        notificationOptional.ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllNotificationsAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteReadNotifications(String userId) {
        notificationRepository.deleteByUserIdAndIsReadTrue(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }


    /**
     * Notifies all users with the 'admin' role (case-insensitive).
     * @param message The content of the notification for admins.
     * @param type The type of the notification (e.g., "APPOINTMENT_BOOKED").
     */
    public void notifyAdmins(String message, String type) {
        List<User> admins = userRepository.findByRoleIgnoreCase("admin");
        for (User admin : admins) {
            createNotification(admin.getUserId(), message, type);
        }
    }
}