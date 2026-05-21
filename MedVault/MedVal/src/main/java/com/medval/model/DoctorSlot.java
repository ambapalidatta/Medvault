package com.medval.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "doctor_slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctor_id", "slot_date", "slot_time"})
})
@Data
public class DoctorSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id")
    private Long slotId;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "slot_time", nullable = false)
    private LocalTime slotTime;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "is_booked")
    private Boolean isBooked = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
