package com.medval.service;

import com.medval.model.Notification;
import com.medval.model.User;
import com.medval.repository.NotificationRepository;
import com.medval.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Notification createNotification(String userId, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setRecipientId(userId);
        notification.setRecipientType("USER");
        notification.setTitle(generateTitle(type));
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markNotificationAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllNotificationsAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void deleteReadNotifications(String userId) {
        notificationRepository.deleteByUserIdAndIsReadTrue(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void notifyAdmins(String message, String type) {
        List<User> admins = userRepository.findByRoleIgnoreCase("ADMIN");

        for (User admin : admins) {
            if (admin.isActive()) {
                createNotification(admin.getUserId(), message, type);
            }
        }
    }

    private String generateTitle(String type) {
        if (type == null || type.isBlank()) {
            return "Notification";
        }

        return switch (type) {
            case "APPOINTMENT_BOOKED" -> "New Appointment";
            case "APPOINTMENT_APPROVED" -> "Appointment Approved";
            case "APPOINTMENT_REJECTED" -> "Appointment Rejected";
            case "APPOINTMENT_REQUEST" -> "Appointment Request";
            case "APPOINTMENT_RESCHEDULE_REQUEST" -> "Reschedule Request";
            case "CONSENT_REQUEST" -> "Access Request";
            case "CONSENT_RESPONSE" -> "Access Response";
            case "EMERGENCY_REQUEST" -> "Emergency Request";
            case "EMERGENCY_APPROVED" -> "Emergency Approved";
            case "EMERGENCY_REJECTED" -> "Emergency Rejected";
            case "EMERGENCY_REMINDER" -> "Emergency Reminder";
            case "NEW_EMERGENCY_REQUEST" -> "New Emergency";
            case "PATIENT_REGISTERED" -> "New Patient";
            case "DOCTOR_REGISTERED" -> "New Doctor";
            case "DOCTOR_INVITATION_SENT" -> "Invitation Sent";
            case "ISSUE_REPORTED" -> "Issue Reported";
            default -> "Notification";
        };
    }
}