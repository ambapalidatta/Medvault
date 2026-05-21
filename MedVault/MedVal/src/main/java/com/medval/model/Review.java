package com.medval.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "reviews")
@Data
public class Review {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "review_id", length = 36, updatable = false, nullable = false)
    private String reviewId;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = true, unique = true)
    @JsonIgnore
    private Appointment appointment;

    @OneToOne
    @JoinColumn(name = "emergency_request_id", nullable = true, unique = true)
    @JsonIgnore
    private EmergencyRequest emergencyRequest;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor; // This correctly maps to your healthcare_professionals table

    @Column(nullable = false)
    private int rating; // 1 to 5

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}