package com.medval.service;

import com.medval.dto.ConsentRequestDto;
import com.medval.exception.ResourceNotFoundException;
import com.medval.model.ConsentRequest;
import com.medval.model.Doctor;
import com.medval.model.Patient;
import com.medval.repository.ConsentRequestRepository;
import com.medval.repository.DoctorRepository;
import com.medval.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConsentRequestService {

    @Autowired
    private ConsentRequestRepository consentRequestRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.medval.repository.AppointmentRepository appointmentRepository;

    public ConsentRequestDto createConsentRequest(String doctorId, String patientId) {
        return createConsentRequest(doctorId, patientId, null, null);
    }

    public ConsentRequestDto createConsentRequest(String doctorId, String patientId, String appointmentId) {
        return createConsentRequest(doctorId, patientId, appointmentId, null);
    }

    public ConsentRequestDto createConsentRequest(String doctorId, String patientId, String appointmentId, Long emergencyRequestId) {
        // Handle emergency request consent
        if (emergencyRequestId != null) {
            // Check if there's already an approved consent for this emergency request
            Optional<ConsentRequest> emergencyConsent = consentRequestRepository.findByDoctorPatientEmergencyAndStatus(
                doctorId, patientId, emergencyRequestId, "APPROVED");
            if (emergencyConsent.isPresent()) {
                return convertToDto(emergencyConsent.get());
            }
            
            // Check for pending request for this emergency request
            Optional<ConsentRequest> pendingEmergencyRequest = consentRequestRepository.findByDoctorPatientEmergencyAndStatus(
                doctorId, patientId, emergencyRequestId, "PENDING");
            if (pendingEmergencyRequest.isPresent()) {
                throw new IllegalStateException("Request is already pending approval for this emergency request.");
            }
        }
        // Handle regular appointment consent
        else if (appointmentId != null && !appointmentId.isEmpty()) {
            // Check if there's already an approved consent for this specific appointment (using native query)
            Optional<ConsentRequest> appointmentConsent = consentRequestRepository.findByDoctorPatientAppointmentAndStatus(
                doctorId, patientId, appointmentId, "APPROVED");
            if (appointmentConsent.isPresent()) {
                return convertToDto(appointmentConsent.get());
            }
            
            // Check for pending request for this specific appointment (using native query)
            Optional<ConsentRequest> pendingAppointmentRequest = consentRequestRepository.findByDoctorPatientAppointmentAndStatus(
                doctorId, patientId, appointmentId, "PENDING");
            if (pendingAppointmentRequest.isPresent()) {
                throw new IllegalStateException("Request is already pending approval for this appointment.");
            }
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        ConsentRequest newRequest = new ConsentRequest();
        newRequest.setDoctor(doctor);
        newRequest.setPatient(patient);
        newRequest.setStatus(ConsentRequest.ConsentStatus.PENDING);
        
        // Set emergency request ID if provided
        if (emergencyRequestId != null) {
            newRequest.setEmergencyRequestId(emergencyRequestId);
        }
        // Set appointment if provided
        else if (appointmentId != null && !appointmentId.isEmpty()) {
            appointmentRepository.findById(appointmentId).ifPresent(newRequest::setAppointment);
        }

        ConsentRequest savedRequest = consentRequestRepository.save(newRequest);

        // Notify Patient
        String message = "Dr. " + doctor.getFirstName() + " " + doctor.getLastName() + " has requested access to your medical records" + 
                        (emergencyRequestId != null ? " for your emergency request." : 
                         appointmentId != null ? " for your appointment." : ".");
        notificationService.createNotification(patient.getUser().getUserId(), message, "CONSENT_REQUEST");

        return convertToDto(savedRequest);
    }

    public ConsentRequestDto respondToConsentRequest(Long requestId, String status) {
        ConsentRequest request = consentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Consent request not found with id: " + requestId));

        ConsentRequest.ConsentStatus newStatus = ConsentRequest.ConsentStatus.valueOf(status.toUpperCase());
        request.setStatus(newStatus);

        ConsentRequest updatedRequest = consentRequestRepository.save(request);

        // Notify Doctor
        String message = "Patient " + request.getPatient().getFirstName() + " " + request.getPatient().getLastName() + " has " + status.toLowerCase() + " your request to access their records.";
        notificationService.createNotification(request.getDoctor().getUser().getUserId(), message, "CONSENT_RESPONSE");

        return convertToDto(updatedRequest);
    }

    public boolean checkPermission(String doctorId, String patientId) {
        return consentRequestRepository.findByDoctor_ProfessionalIdAndPatient_PatientIdAndStatus(doctorId, patientId, ConsentRequest.ConsentStatus.APPROVED).isPresent();
    }
    
    public boolean checkPermissionForAppointment(String doctorId, String patientId, String appointmentId) {
        if (appointmentId == null || appointmentId.isEmpty()) {
            return checkPermission(doctorId, patientId);
        }
        // Use native query to avoid collation issues
        return consentRequestRepository.findByDoctorPatientAppointmentAndStatus(
            doctorId, patientId, appointmentId, "APPROVED").isPresent();
    }
    
    public boolean checkPermissionForEmergency(String doctorId, String patientId, Long emergencyRequestId) {
        if (emergencyRequestId == null) {
            return checkPermission(doctorId, patientId);
        }
        return consentRequestRepository.findByDoctorPatientEmergencyAndStatus(
            doctorId, patientId, emergencyRequestId, "APPROVED").isPresent();
    }
    
    public boolean hasPendingRequest(String doctorId, String patientId) {
        return consentRequestRepository.findByDoctor_ProfessionalIdAndPatient_PatientIdAndStatus(doctorId, patientId, ConsentRequest.ConsentStatus.PENDING).isPresent();
    }
    
    public boolean hasPendingRequestForAppointment(String doctorId, String patientId, String appointmentId) {
        if (appointmentId == null || appointmentId.isEmpty()) {
            return hasPendingRequest(doctorId, patientId);
        }
        // Use native query to avoid collation issues
        return consentRequestRepository.findByDoctorPatientAppointmentAndStatus(
            doctorId, patientId, appointmentId, "PENDING").isPresent();
    }
    
    public boolean hasPendingRequestForEmergency(String doctorId, String patientId, Long emergencyRequestId) {
        if (emergencyRequestId == null) {
            return hasPendingRequest(doctorId, patientId);
        }
        return consentRequestRepository.findByDoctorPatientEmergencyAndStatus(
            doctorId, patientId, emergencyRequestId, "PENDING").isPresent();
    }

    public List<ConsentRequestDto> getPendingRequestsForPatient(String patientId) {
        return consentRequestRepository.findByPatient_PatientIdAndStatus(patientId, ConsentRequest.ConsentStatus.PENDING)
                .stream()
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    private ConsentRequestDto convertToDto(ConsentRequest request) {
        ConsentRequestDto dto = new ConsentRequestDto();
        dto.setId(request.getId());
        dto.setDoctorId(request.getDoctor().getProfessionalId());
        dto.setDoctorName(request.getDoctor().getFirstName() + " " + request.getDoctor().getLastName());
        dto.setPatientId(request.getPatient().getPatientId());
        dto.setPatientName(request.getPatient().getFirstName() + " " + request.getPatient().getLastName());
        if (request.getAppointment() != null) {
            dto.setAppointmentId(request.getAppointment().getAppointmentId());
        }
        if (request.getEmergencyRequestId() != null) {
            dto.setEmergencyRequestId(request.getEmergencyRequestId());
        }
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}
