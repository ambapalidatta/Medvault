package com.medval.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @UuidGenerator
    @Column(name = "notification_id")
    private String notificationId;

    @Column(name = "user_id")
    private String userId; // Recipient of the notification

    @Column(name = "recipient_id")
    private String recipientId; // Same as userId for compatibility

    @Column(name = "recipient_type")
    private String recipientType; // "PATIENT", "DOCTOR", "ADMIN"

    @Column(name = "title")
    private String title; // Notification title

    @Column(nullable = false)
    private String message;

    @Column(name = "notification_type", nullable = false)
    private String notificationType; // e.g., "APPOINTMENT_BOOKED", "PATIENT_REGISTERED"

    @Column(name = "is_read")
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}