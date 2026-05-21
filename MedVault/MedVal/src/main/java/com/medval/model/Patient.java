package com.medval.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn; // Ensure this is imported
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data 
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @UuidGenerator 
    @Column(name = "patient_id")
    private String patientId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column
    private String gender;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column
    private String phone;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column
    private String address;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String country;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}