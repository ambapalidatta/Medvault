package com.medval.repository;

import com.medval.model.ConsentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsentRequestRepository extends JpaRepository<ConsentRequest, Long> {

    Optional<ConsentRequest> findByDoctor_ProfessionalIdAndPatient_PatientIdAndAppointmentIsNullAndStatus(String doctorId, String patientId, ConsentRequest.ConsentStatus status);

    Optional<ConsentRequest> findByDoctor_ProfessionalIdAndPatient_PatientId(String doctorId, String patientId);

    List<ConsentRequest> findByPatient_PatientIdAndStatus(String patientId, ConsentRequest.ConsentStatus status);

    Optional<ConsentRequest> findByDoctor_ProfessionalIdAndPatient_PatientIdAndStatus(String doctorId, String patientId, ConsentRequest.ConsentStatus status);
    
    // Native query to avoid collation issues with appointment-specific consent
    @Query(value = "SELECT * FROM consent_request " +
           "WHERE doctor_id = ?1 " +
           "AND patient_id = ?2 " +
           "AND appointment_id = ?3 " +
           "AND status = ?4 LIMIT 1", nativeQuery = true)
    Optional<ConsentRequest> findByDoctorPatientAppointmentAndStatus(
        String doctorId, 
        String patientId, 
        String appointmentId, 
        String status);
    
    // Native query for emergency request consent
    @Query(value = "SELECT * FROM consent_request " +
           "WHERE doctor_id = ?1 " +
           "AND patient_id = ?2 " +
           "AND emergency_request_id = ?3 " +
           "AND status = ?4 LIMIT 1", nativeQuery = true)
    Optional<ConsentRequest> findByDoctorPatientEmergencyAndStatus(
        String doctorId, 
        String patientId, 
        Long emergencyRequestId, 
        String status);
}
