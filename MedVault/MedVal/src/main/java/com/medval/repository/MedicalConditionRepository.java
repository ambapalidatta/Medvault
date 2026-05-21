package com.medval.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.MedicalCondition;
import com.medval.model.Patient;

@Repository
// Change String to Long if you reverted IDs
public interface MedicalConditionRepository extends JpaRepository<MedicalCondition, String> {

    // Find all conditions for a specific patient
    List<MedicalCondition> findByPatient(Patient patient);

    // Find all conditions for a specific patient by their ID
    List<MedicalCondition> findByPatientPatientId(String patientId); // Change String to Long if needed
}
