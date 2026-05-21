package com.medval.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType; // Ensure this is imported
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "healthcare_professionals") 
@Data
public class Doctor { 

    @Id
    @UuidGenerator
    @Column(name = "professional_id", updatable = false, nullable = false)
    private String professionalId; // 

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false)
    private String lastName;


    @Column(length = 100)
    private String specialization;

    @Column(name = "license_number", unique = true, nullable = false, length = 100)
    private String licenseNumber;

    @Column(name = "license_expiry")
    private LocalDate licenseExpiry;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String qualification;

    @Column(name = "consultation_fee")
    private Double consultationFee;
    
    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(length = 20)
    private String phone;

    @Column(name = "hospital_affiliation", length = 200)
    private String hospitalAffiliation;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Lob
    @Column(name = "profile_picture_url", columnDefinition = "TEXT")
    private String profilePictureUrl;

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(name = "verification_date")
    private LocalDateTime verificationDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}