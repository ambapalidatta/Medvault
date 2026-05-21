package com.medval.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "emergency_requests")
@Data
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @OneToOne(mappedBy = "emergencyRequest", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Review review;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "condition_description", columnDefinition = "TEXT", nullable = false)
    private String conditionDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", length = 20, nullable = false)
    private UrgencyLevel urgencyLevel = UrgencyLevel.MEDIUM;

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "request_date_time", nullable = false)
    private LocalDateTime requestDateTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EmergencyStatus status = EmergencyStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EmergencyStatus {
        PENDING,
        APPROVED,
        REJECTED,
        COMPLETED
    }

    public enum UrgencyLevel {
        HIGH,
        MEDIUM,
        LOW
    }
}
