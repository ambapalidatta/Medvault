package com.medval.service;

import com.medval.dto.ConsentRequestDto;
import com.medval.exception.ResourceNotFoundException;
import com.medval.model.Appointment;
import com.medval.model.ConsentRequest;
import com.medval.model.Doctor;
import com.medval.model.Patient;
import com.medval.repository.AppointmentRepository;
import com.medval.repository.ConsentRequestRepository;
import com.medval.repository.DoctorRepository;
import com.medval.repository.PatientRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ConsentRequestService {

    private final ConsentRequestRepository consentRequestRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public ConsentRequestService(
            ConsentRequestRepository consentRequestRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            NotificationService notificationService) {
        this.consentRequestRepository = consentRequestRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ConsentRequestDto createConsentRequest(String doctorId, String patientId) {
        return createConsentRequest(doctorId, patientId, null, null);
    }

    @Transactional
    public ConsentRequestDto createConsentRequest(String doctorId, String patientId, String appointmentId) {
        return createConsentRequest(doctorId, patientId, appointmentId, null);
    }

    @Transactional
    public ConsentRequestDto createConsentRequest(
            String doctorId,
            String patientId,
            String appointmentId,
            Long emergencyRequestId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found."));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));

        Appointment appointment = null;

        if (emergencyRequestId != null) {
            Optional<ConsentRequest> approvedEmergencyConsent = consentRequestRepository
                    .findByDoctorPatientEmergencyAndStatus(
                            doctorId,
                            patientId,
                            emergencyRequestId,
                            "APPROVED");

            if (approvedEmergencyConsent.isPresent()) {
                return convertToDto(approvedEmergencyConsent.get());
            }

            Optional<ConsentRequest> pendingEmergencyRequest = consentRequestRepository
                    .findByDoctorPatientEmergencyAndStatus(
                            doctorId,
                            patientId,
                            emergencyRequestId,
                            "PENDING");

            if (pendingEmergencyRequest.isPresent()) {
                throw new IllegalStateException("Request is already pending approval for this emergency request.");
            }
        } else if (appointmentId != null && !appointmentId.isBlank()) {
            appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

            Optional<ConsentRequest> approvedAppointmentConsent = consentRequestRepository
                    .findByDoctorPatientAppointmentAndStatus(
                            doctorId,
                            patientId,
                            appointmentId,
                            "APPROVED");

            if (approvedAppointmentConsent.isPresent()) {
                return convertToDto(approvedAppointmentConsent.get());
            }

            Optional<ConsentRequest> pendingAppointmentRequest = consentRequestRepository
                    .findByDoctorPatientAppointmentAndStatus(
                            doctorId,
                            patientId,
                            appointmentId,
                            "PENDING");

            if (pendingAppointmentRequest.isPresent()) {
                throw new IllegalStateException("Request is already pending approval for this appointment.");
            }
        }

        ConsentRequest newRequest = new ConsentRequest();
        newRequest.setDoctor(doctor);
        newRequest.setPatient(patient);
        newRequest.setStatus(ConsentRequest.ConsentStatus.PENDING);

        if (emergencyRequestId != null) {
            newRequest.setEmergencyRequestId(emergencyRequestId);
        } else if (appointment != null) {
            newRequest.setAppointment(appointment);
        }

        ConsentRequest savedRequest = consentRequestRepository.save(newRequest);

        if (patient.getUser() != null) {
            String message = "Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName())
                    + " has requested access to your medical records"
                    + (emergencyRequestId != null
                            ? " for your emergency request."
                            : appointment != null
                                    ? " for your appointment."
                                    : ".");

            notificationService.createNotification(
                    patient.getUser().getUserId(),
                    message,
                    "CONSENT_REQUEST");
        }

        return convertToDto(savedRequest);
    }

    @Transactional
    public ConsentRequestDto respondToConsentRequest(Long requestId, String status) {
        ConsentRequest request = consentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Consent request not found."));

        ConsentRequest.ConsentStatus newStatus;

        try {
            newStatus = ConsentRequest.ConsentStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid consent request status.");
        }

        request.setStatus(newStatus);

        ConsentRequest updatedRequest = consentRequestRepository.save(request);

        if (request.getDoctor().getUser() != null) {
            String message = "Patient " + safeFullName(
                    request.getPatient().getFirstName(),
                    request.getPatient().getLastName()) + " has " + newStatus.name().toLowerCase()
                    + " your request to access their records.";

            notificationService.createNotification(
                    request.getDoctor().getUser().getUserId(),
                    message,
                    "CONSENT_RESPONSE");
        }

        return convertToDto(updatedRequest);
    }

    @Transactional(readOnly = true)
    public boolean checkPermission(String doctorId, String patientId) {
        return consentRequestRepository
                .findByDoctor_ProfessionalIdAndPatient_PatientIdAndStatus(
                        doctorId,
                        patientId,
                        ConsentRequest.ConsentStatus.APPROVED)
                .isPresent();
    }

    @Transactional(readOnly = true)
    public boolean checkPermissionForAppointment(String doctorId, String patientId, String appointmentId) {
        if (appointmentId == null || appointmentId.isBlank()) {
            return checkPermission(doctorId, patientId);
        }

        return consentRequestRepository
                .findByDoctorPatientAppointmentAndStatus(
                        doctorId,
                        patientId,
                        appointmentId,
                        "APPROVED")
                .isPresent();
    }

    @Transactional(readOnly = true)
    public boolean checkPermissionForEmergency(String doctorId, String patientId, Long emergencyRequestId) {
        if (emergencyRequestId == null) {
            return checkPermission(doctorId, patientId);
        }

        return consentRequestRepository
                .findByDoctorPatientEmergencyAndStatus(
                        doctorId,
                        patientId,
                        emergencyRequestId,
                        "APPROVED")
                .isPresent();
    }

    @Transactional(readOnly = true)
    public boolean hasPendingRequest(String doctorId, String patientId) {
        return consentRequestRepository
                .findByDoctor_ProfessionalIdAndPatient_PatientIdAndStatus(
                        doctorId,
                        patientId,
                        ConsentRequest.ConsentStatus.PENDING)
                .isPresent();
    }

    @Transactional(readOnly = true)
    public boolean hasPendingRequestForAppointment(String doctorId, String patientId, String appointmentId) {
        if (appointmentId == null || appointmentId.isBlank()) {
            return hasPendingRequest(doctorId, patientId);
        }

        return consentRequestRepository
                .findByDoctorPatientAppointmentAndStatus(
                        doctorId,
                        patientId,
                        appointmentId,
                        "PENDING")
                .isPresent();
    }

    @Transactional(readOnly = true)
    public boolean hasPendingRequestForEmergency(String doctorId, String patientId, Long emergencyRequestId) {
        if (emergencyRequestId == null) {
            return hasPendingRequest(doctorId, patientId);
        }

        return consentRequestRepository
                .findByDoctorPatientEmergencyAndStatus(
                        doctorId,
                        patientId,
                        emergencyRequestId,
                        "PENDING")
                .isPresent();
    }

    @Transactional(readOnly = true)
    public List<ConsentRequestDto> getPendingRequestsForPatient(String patientId) {
        return consentRequestRepository
                .findByPatient_PatientIdAndStatus(patientId, ConsentRequest.ConsentStatus.PENDING)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private ConsentRequestDto convertToDto(ConsentRequest request) {
        ConsentRequestDto dto = new ConsentRequestDto();

        dto.setId(request.getId());

        if (request.getDoctor() != null) {
            dto.setDoctorId(request.getDoctor().getProfessionalId());
            dto.setDoctorName(safeFullName(request.getDoctor().getFirstName(), request.getDoctor().getLastName()));
        }

        if (request.getPatient() != null) {
            dto.setPatientId(request.getPatient().getPatientId());
            dto.setPatientName(safeFullName(request.getPatient().getFirstName(), request.getPatient().getLastName()));
        }

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

    private String safeFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }
}