package com.medval.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medval.model.Medication;

import com.medval.model.Patient;

public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByPatient(Patient patient);
    List<Medication> findByPatient_PatientId(String patientId);
    List<Medication> findByPrescribedBy(String prescribedBy);
}
