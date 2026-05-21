package com.medval.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "doctor_qualifications")
@Data
public class DoctorQualification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "qualification_id")
    private Long qualificationId;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(name = "document_path", length = 500, nullable = false)
    private String documentPath;

    @Column(name = "document_type", length = 50)
    private String documentType;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "verification_status", length = 20)
    private String verificationStatus = "PENDING";
}
