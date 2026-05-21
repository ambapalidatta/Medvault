package com.medval.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medval.model.MedicalRecord;
import com.medval.model.Patient;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatient(Patient patient);
    List<MedicalRecord> findByPatient_PatientIdOrderByRecordDateDesc(String patientId);
}