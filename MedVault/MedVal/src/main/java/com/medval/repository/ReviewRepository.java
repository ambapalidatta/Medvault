package com.medval.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.Appointment;
import com.medval.model.Doctor;
import com.medval.model.Patient;
import com.medval.model.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByAppointment_Doctor(Doctor doctor);
    List<Review> findByDoctor(Doctor doctor);
    List<Review> findByPatient(Patient patient);
    Optional<Review> findByAppointment(Appointment appointment);
    Optional<Review> findByEmergencyRequest(com.medval.model.EmergencyRequest emergencyRequest);
}
