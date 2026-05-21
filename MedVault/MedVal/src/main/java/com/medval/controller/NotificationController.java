package com.medval.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medval.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
// --- THE FIX: REMOVE @CrossOrigin(origins = "*") ---
// The SecurityConfig now handles CORS globally.
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable String userId) {
        try {
            List<com.medval.model.Notification> notifications = notificationService.getNotificationsByUserId(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable String userId) {
        try {
            Long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markNotificationAsRead(notificationId);
            return ResponseEntity.ok("Notification marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        try {
            notificationService.markAllNotificationsAsRead(userId);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}