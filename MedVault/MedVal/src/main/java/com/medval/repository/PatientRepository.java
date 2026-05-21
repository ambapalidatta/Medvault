package com.medval.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.Patient;
import com.medval.model.User;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {
     Optional<Patient> findByPatientId(String patientId);
     Optional<Patient> findByUser_UserId(String userId);
    // Add this method to find a patient profile by the user object
    Optional<Patient> findByUser(User user);
}
