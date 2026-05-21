package com.medval.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.EmergencyRequest;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByPatientPatientId(String patientId);
    List<EmergencyRequest> findByDoctorProfessionalId(String doctorId);
    List<EmergencyRequest> findByDoctorProfessionalIdAndStatus(String doctorId, EmergencyRequest.EmergencyStatus status);
}
