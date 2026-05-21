package com.medval.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.Doctor;
import com.medval.model.DoctorSlot;

@Repository
public interface DoctorSlotRepository extends JpaRepository<DoctorSlot, Long> {
    List<DoctorSlot> findByDoctorProfessionalIdAndSlotDate(String doctorId, LocalDate slotDate);
    List<DoctorSlot> findByDoctorProfessionalIdAndSlotDateAndIsAvailable(String doctorId, LocalDate slotDate, Boolean isAvailable);
    List<DoctorSlot> findByDoctorProfessionalId(String doctorId);
    List<DoctorSlot> findByDoctor(Doctor doctor);
    
    // Find a unique slot by doctor, date, and time for rescheduling
    java.util.Optional<DoctorSlot> findByDoctorProfessionalIdAndSlotDateAndSlotTime(String doctorId, LocalDate slotDate, java.time.LocalTime slotTime);
}
