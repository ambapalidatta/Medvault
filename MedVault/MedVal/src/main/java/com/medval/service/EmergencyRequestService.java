package com.medval.service;

import com.medval.dto.EmergencyRequestDto;
import com.medval.model.Doctor;
import com.medval.model.EmergencyRequest;
import com.medval.model.Patient;
import com.medval.repository.DoctorRepository;
import com.medval.repository.EmergencyRequestRepository;
import com.medval.repository.PatientRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmergencyRequestService {

    private final EmergencyRequestRepository emergencyRequestRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;

    public EmergencyRequestService(
            EmergencyRequestRepository emergencyRequestRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            NotificationService notificationService) {
        this.emergencyRequestRepository = emergencyRequestRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public EmergencyRequestDto createEmergencyRequest(EmergencyRequestDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found."));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found."));

        EmergencyRequest request = new EmergencyRequest();
        request.setPatient(patient);
        request.setDoctor(doctor);
        request.setConditionDescription(dto.getConditionDescription());
        request.setUrgencyLevel(parseUrgencyLevel(dto.getUrgencyLevel()));
        request.setCurrentLocation(dto.getCurrentLocation());
        request.setRequestDateTime(dto.getRequestDateTime());
        request.setStatus(EmergencyRequest.EmergencyStatus.PENDING);

        EmergencyRequest saved = emergencyRequestRepository.save(request);

        String patientName = safeFullName(patient.getFirstName(), patient.getLastName());
        String doctorName = "Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName());

        notificationService.notifyAdmins(
                "New emergency request from " + patientName + " for " + doctorName + ".",
                "NEW_EMERGENCY_REQUEST");

        if (doctor.getUser() != null) {
            notificationService.createNotification(
                    doctor.getUser().getUserId(),
                    "New emergency request from " + patientName,
                    "EMERGENCY_REQUEST");
        }

        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<EmergencyRequestDto> getPatientRequests(String patientId) {
        return emergencyRequestRepository.findByPatientPatientId(patientId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmergencyRequestDto> getDoctorRequests(String doctorId) {
        return emergencyRequestRepository.findByDoctorProfessionalId(doctorId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmergencyRequestDto> getAllRequests() {
        return emergencyRequestRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional
    public EmergencyRequestDto approveRequest(Long requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found."));

        request.setStatus(EmergencyRequest.EmergencyStatus.APPROVED);

        EmergencyRequest updated = emergencyRequestRepository.save(request);

        Patient patient = request.getPatient();
        Doctor doctor = request.getDoctor();

        if (patient.getUser() != null) {
            notificationService.createNotification(
                    patient.getUser().getUserId(),
                    "Your emergency request has been approved by Dr. "
                            + safeFullName(doctor.getFirstName(), doctor.getLastName()),
                    "EMERGENCY_APPROVED");
        }

        return convertToDto(updated);
    }

    @Transactional
    public EmergencyRequestDto rejectRequest(Long requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found."));

        request.setStatus(EmergencyRequest.EmergencyStatus.REJECTED);

        EmergencyRequest updated = emergencyRequestRepository.save(request);

        Patient patient = request.getPatient();
        Doctor doctor = request.getDoctor();

        if (patient.getUser() != null) {
            notificationService.createNotification(
                    patient.getUser().getUserId(),
                    "Your emergency request has been rejected by Dr. "
                            + safeFullName(doctor.getFirstName(), doctor.getLastName()),
                    "EMERGENCY_REJECTED");
        }

        return convertToDto(updated);
    }

    @Transactional
    public boolean sendEmergencyReminderToDoctor(Long requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found."));

        Doctor doctor = request.getDoctor();
        Patient patient = request.getPatient();

        if (doctor.getUser() == null) {
            throw new RuntimeException("Doctor user account not found.");
        }

        notificationService.createNotification(
                doctor.getUser().getUserId(),
                "Admin has sent a reminder for emergency request from "
                        + safeFullName(patient.getFirstName(), patient.getLastName())
                        + ". Please respond urgently.",
                "EMERGENCY_REMINDER");

        return true;
    }

    private EmergencyRequestDto convertToDto(EmergencyRequest request) {
        EmergencyRequestDto dto = new EmergencyRequestDto();

        Patient patient = request.getPatient();
        Doctor doctor = request.getDoctor();

        dto.setRequestId(request.getRequestId());

        dto.setPatientId(patient.getPatientId());
        dto.setPatientName(safeFullName(patient.getFirstName(), patient.getLastName()));

        if (patient.getUser() != null) {
            dto.setPatientEmail(patient.getUser().getEmail());
        }

        EmergencyRequestDto.PatientInfo patientInfo = new EmergencyRequestDto.PatientInfo();
        patientInfo.setPatientId(patient.getPatientId());
        patientInfo.setFirstName(patient.getFirstName());
        patientInfo.setLastName(patient.getLastName());
        dto.setPatient(patientInfo);

        dto.setDoctorId(doctor.getProfessionalId());
        dto.setDoctorName("Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName()));
        dto.setConditionDescription(request.getConditionDescription());
        dto.setUrgencyLevel(request.getUrgencyLevel() != null ? request.getUrgencyLevel().toString() : null);
        dto.setCurrentLocation(request.getCurrentLocation());
        dto.setRequestDateTime(request.getRequestDateTime());
        dto.setStatus(request.getStatus() != null ? request.getStatus().toString() : null);

        Double fee = doctor.getConsultationFee();
        dto.setConsultationFee(fee != null ? fee : 500.0);

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

    private EmergencyRequest.UrgencyLevel parseUrgencyLevel(String urgencyString) {
        if (urgencyString == null || urgencyString.isBlank()) {
            throw new IllegalArgumentException("Urgency level is required.");
        }

        String value = urgencyString.trim().toUpperCase();

        if (value.startsWith("HIGH")) {
            return EmergencyRequest.UrgencyLevel.HIGH;
        }

        if (value.startsWith("MEDIUM")) {
            return EmergencyRequest.UrgencyLevel.MEDIUM;
        }

        if (value.startsWith("LOW")) {
            return EmergencyRequest.UrgencyLevel.LOW;
        }

        try {
            return EmergencyRequest.UrgencyLevel.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid urgency level.");
        }
    }

    private String safeFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }
}