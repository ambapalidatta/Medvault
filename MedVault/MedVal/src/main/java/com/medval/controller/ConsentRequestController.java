package com.medval.controller;

import com.medval.dto.ConsentRequestDto;
import com.medval.service.ConsentRequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consent-requests")
public class ConsentRequestController {

    private final ConsentRequestService consentRequestService;

    public ConsentRequestController(ConsentRequestService consentRequestService) {
        this.consentRequestService = consentRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createConsentRequest(@RequestBody Map<String, String> payload) {
        try {
            String doctorId = payload.get("doctorId");
            String patientId = payload.get("patientId");
            String appointmentId = payload.get("appointmentId");
            String emergencyRequestIdStr = payload.get("emergencyRequestId");

            if (doctorId == null || doctorId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "doctorId is required."));
            }

            if (patientId == null || patientId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "patientId is required."));
            }

            Long emergencyRequestId = null;

            if (emergencyRequestIdStr != null && !emergencyRequestIdStr.isBlank()) {
                try {
                    emergencyRequestId = Long.parseLong(emergencyRequestIdStr);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Invalid emergencyRequestId."));
                }
            }

            ConsentRequestDto createdRequest = consentRequestService.createConsentRequest(
                    doctorId,
                    patientId,
                    appointmentId,
                    emergencyRequestId);

            return ResponseEntity.ok(createdRequest);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Consent request creation failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to create consent request."));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> respondToConsentRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        try {
            String status = payload.get("status");

            if (status == null || status.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "status is required."));
            }

            ConsentRequestDto updatedRequest = consentRequestService.respondToConsentRequest(id, status);

            return ResponseEntity.ok(updatedRequest);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Consent response failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update consent request."));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> checkPermission(
            @RequestParam String doctorId,
            @RequestParam String patientId,
            @RequestParam(required = false) String appointmentId,
            @RequestParam(required = false) Long emergencyRequestId) {

        try {
            boolean hasPermission;
            boolean hasPendingRequest;

            if (emergencyRequestId != null) {
                hasPermission = consentRequestService.checkPermissionForEmergency(
                        doctorId,
                        patientId,
                        emergencyRequestId);
                hasPendingRequest = consentRequestService.hasPendingRequestForEmergency(
                        doctorId,
                        patientId,
                        emergencyRequestId);
            } else if (appointmentId != null && !appointmentId.isBlank()) {
                hasPermission = consentRequestService.checkPermissionForAppointment(
                        doctorId,
                        patientId,
                        appointmentId);
                hasPendingRequest = consentRequestService.hasPendingRequestForAppointment(
                        doctorId,
                        patientId,
                        appointmentId);
            } else {
                hasPermission = consentRequestService.checkPermission(doctorId, patientId);
                hasPendingRequest = consentRequestService.hasPendingRequest(doctorId, patientId);
            }

            Map<String, Boolean> response = new HashMap<>();
            response.put("hasPermission", hasPermission);
            response.put("hasPendingRequest", hasPendingRequest);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Consent status check failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to check consent status."));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequestsForPatient(@RequestParam String patientId) {
        try {
            List<ConsentRequestDto> pendingRequests = consentRequestService.getPendingRequestsForPatient(patientId);

            return ResponseEntity.ok(pendingRequests);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching pending consent requests failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch pending consent requests."));
        }
    }
}