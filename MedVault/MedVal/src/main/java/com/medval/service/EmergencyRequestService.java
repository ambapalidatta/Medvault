package com.medval.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.medval.dto.EmergencyRequestDto;
import com.medval.model.Doctor;
import com.medval.model.EmergencyRequest;
import com.medval.model.Patient;
import com.medval.repository.DoctorRepository;
import com.medval.repository.EmergencyRequestRepository;
import com.medval.repository.PatientRepository;

@Service
public class EmergencyRequestService {

    @Autowired
    private EmergencyRequestRepository emergencyRequestRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private NotificationService notificationService;

    public EmergencyRequestDto createEmergencyRequest(EmergencyRequestDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

        EmergencyRequest request = new EmergencyRequest();
        request.setPatient(patient);
        request.setDoctor(doctor);
        request.setConditionDescription(dto.getConditionDescription());
        
        // *** FIX: Use the new helper method to parse the urgency level string ***
        request.setUrgencyLevel(parseUrgencyLevel(dto.getUrgencyLevel()));
        
        request.setCurrentLocation(dto.getCurrentLocation());
        request.setRequestDateTime(dto.getRequestDateTime());
        request.setStatus(EmergencyRequest.EmergencyStatus.PENDING);

        EmergencyRequest saved = emergencyRequestRepository.save(request);

        // Notify Admins about the new emergency request
        notificationService.notifyAdmins(
            "New Emergency Request from " + patient.getFirstName() + " " + patient.getLastName() + " for Dr. " + doctor.getFirstName() + " " + doctor.getLastName() + ". Condition: " + dto.getConditionDescription(),
            "NEW_EMERGENCY_REQUEST"
        );

        // Create notification for doctor
        notificationService.createNotification(
            doctor.getUser().getUserId(), // Use doctor's user ID
            "New emergency request from " + patient.getFirstName() + " " + patient.getLastName(),
            "EMERGENCY_REQUEST"
        );

        return convertToDto(saved);
    }

    public List<EmergencyRequestDto> getPatientRequests(String patientId) {
        System.out.println("=== getPatientRequests ===");
        System.out.println("Looking for emergency requests for patientId: " + patientId);
        
        List<EmergencyRequest> requests = emergencyRequestRepository.findByPatientPatientId(patientId);
        System.out.println("Found " + requests.size() + " emergency requests");
        
        if (!requests.isEmpty()) {
            requests.forEach(r -> System.out.println("  - Request ID: " + r.getRequestId() + 
                ", Patient: " + r.getPatient().getPatientId() + 
                ", Status: " + r.getStatus()));
        }
        
        return requests.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<EmergencyRequestDto> getDoctorRequests(String doctorId) {
        return emergencyRequestRepository.findByDoctorProfessionalId(doctorId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<EmergencyRequestDto> getAllRequests() {
        return emergencyRequestRepository.findAll()
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public EmergencyRequestDto approveRequest(Long requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus(EmergencyRequest.EmergencyStatus.APPROVED);
        EmergencyRequest updated = emergencyRequestRepository.save(request);

        // Create notification for patient
        notificationService.createNotification(
            request.getPatient().getUser().getUserId(), // Use patient's user ID
            "Your emergency request has been approved by Dr. " + request.getDoctor().getFirstName() + " " + request.getDoctor().getLastName(),
            "EMERGENCY_APPROVED"
        );

        return convertToDto(updated);
    }

    public EmergencyRequestDto rejectRequest(Long requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus(EmergencyRequest.EmergencyStatus.REJECTED);
        EmergencyRequest updated = emergencyRequestRepository.save(request);

        // Create notification for patient
        notificationService.createNotification(
            request.getPatient().getUser().getUserId(), // Use patient's user ID
            "Your emergency request has been rejected by Dr. " + request.getDoctor().getFirstName() + " " + request.getDoctor().getLastName(),
            "EMERGENCY_REJECTED"
        );

        return convertToDto(updated);
    }

    /**
     * Sends a reminder notification to the doctor for a specific emergency request.
     * @param requestId The ID of the emergency request.
     * @return true if reminder was sent, false otherwise.
     */
    public boolean sendEmergencyReminderToDoctor(Long requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Emergency Request not found with ID: " + requestId));

        Doctor doctor = request.getDoctor();
        Patient patient = request.getPatient();

        String message = "Admin has sent a reminder for your emergency request from " + patient.getFirstName() + " " + patient.getLastName() + ". Condition: " + request.getConditionDescription() + ". Please respond urgently.";
        String type = "EMERGENCY_REMINDER";

        // Send notification to the doctor
        notificationService.createNotification(
            doctor.getUser().getUserId(),
            message,
            type
        );
        return true;
    }

    private EmergencyRequestDto convertToDto(EmergencyRequest request) {
        EmergencyRequestDto dto = new EmergencyRequestDto();
        dto.setRequestId(request.getRequestId());
        dto.setPatientId(request.getPatient().getPatientId());
        dto.setPatientName(request.getPatient().getFirstName() + " " + request.getPatient().getLastName());
        // Get patient email from user
        if (request.getPatient().getUser() != null) {
            dto.setPatientEmail(request.getPatient().getUser().getEmail());
        }
        
        // Add patient object for frontend
        EmergencyRequestDto.PatientInfo patientInfo = new EmergencyRequestDto.PatientInfo();
        patientInfo.setPatientId(request.getPatient().getPatientId());
        patientInfo.setFirstName(request.getPatient().getFirstName());
        patientInfo.setLastName(request.getPatient().getLastName());
        dto.setPatient(patientInfo);
        
        dto.setDoctorId(request.getDoctor().getProfessionalId());
        dto.setDoctorName("Dr. " + request.getDoctor().getFirstName() + " " + request.getDoctor().getLastName());
        dto.setConditionDescription(request.getConditionDescription());
        dto.setUrgencyLevel(request.getUrgencyLevel().toString());
        dto.setCurrentLocation(request.getCurrentLocation());
        dto.setRequestDateTime(request.getRequestDateTime());
        dto.setStatus(request.getStatus().toString());
        // Set consultation fee from doctor (with fallback)
        Double fee = request.getDoctor().getConsultationFee();
        dto.setConsultationFee(fee != null ? fee : 500.0);
        
        // Include review if exists
        if (request.getReview() != null) {
            EmergencyRequestDto.ReviewInfo reviewInfo = new EmergencyRequestDto.ReviewInfo();
            reviewInfo.setReviewId(request.getReview().getReviewId());
            reviewInfo.setRating(request.getReview().getRating());
            reviewInfo.setFeedback(request.getReview().getFeedback());
            reviewInfo.setCreatedAt(request.getReview().getCreatedAt());
            dto.setReview(reviewInfo);
        }
        
        return dto;
    }

    // *** NEW HELPER METHOD ***
    /**
     * Parses the descriptive urgency level string from the DTO.
     * @param urgencyString The string from the DTO (e.g., "HIGH - Immediate attention needed")
     * @return The matching UrgencyLevel enum
     */
    private EmergencyRequest.UrgencyLevel parseUrgencyLevel(String urgencyString) {
        if (urgencyString == null) {
            throw new IllegalArgumentException("Urgency level cannot be null");
        }

        String upperCaseString = urgencyString.toUpperCase();

        if (upperCaseString.startsWith("HIGH")) {
            return EmergencyRequest.UrgencyLevel.HIGH;
        } else if (upperCaseString.startsWith("MEDIUM")) {
            return EmergencyRequest.UrgencyLevel.MEDIUM;
        } else if (upperCaseString.startsWith("LOW")) {
            return EmergencyRequest.UrgencyLevel.LOW;
        } else {
            // As a fallback, try to match the exact name just in case
            try {
                return EmergencyRequest.UrgencyLevel.valueOf(upperCaseString);
            } catch (IllegalArgumentException e) {
                // If it fails, throw a clear error message
                throw new IllegalArgumentException("Invalid urgency level provided: " + urgencyString);
            }
        }
    }
}