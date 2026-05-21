package com.medval.controller;

import com.medval.dto.ConsentRequestDto;
import com.medval.service.ConsentRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consent-requests")
public class ConsentRequestController {

    @Autowired
    private ConsentRequestService consentRequestService;

    @PostMapping
    public ResponseEntity<ConsentRequestDto> createConsentRequest(@RequestBody Map<String, String> payload) {
        String doctorId = payload.get("doctorId");
        String patientId = payload.get("patientId");
        String appointmentId = payload.get("appointmentId"); // Optional for regular appointments
        String emergencyRequestIdStr = payload.get("emergencyRequestId"); // Optional for emergency requests
        
        Long emergencyRequestId = null;
        if (emergencyRequestIdStr != null && !emergencyRequestIdStr.isEmpty()) {
            try {
                emergencyRequestId = Long.parseLong(emergencyRequestIdStr);
            } catch (NumberFormatException e) {
                // Invalid emergency request ID, ignore
            }
        }
        
        ConsentRequestDto createdRequest = consentRequestService.createConsentRequest(doctorId, patientId, appointmentId, emergencyRequestId);
        return ResponseEntity.ok(createdRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsentRequestDto> respondToConsentRequest(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        ConsentRequestDto updatedRequest = consentRequestService.respondToConsentRequest(id, status);
        return ResponseEntity.ok(updatedRequest);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @RequestParam String doctorId, 
            @RequestParam String patientId,
            @RequestParam(required = false) String appointmentId,
            @RequestParam(required = false) Long emergencyRequestId) {
        boolean hasPermission;
        boolean hasPendingRequest;
        
        if (emergencyRequestId != null) {
            // Check emergency request-specific permission
            hasPermission = consentRequestService.checkPermissionForEmergency(doctorId, patientId, emergencyRequestId);
            hasPendingRequest = consentRequestService.hasPendingRequestForEmergency(doctorId, patientId, emergencyRequestId);
        } else if (appointmentId != null && !appointmentId.isEmpty()) {
            // Check appointment-specific permission
            hasPermission = consentRequestService.checkPermissionForAppointment(doctorId, patientId, appointmentId);
            hasPendingRequest = consentRequestService.hasPendingRequestForAppointment(doctorId, patientId, appointmentId);
        } else {
            // Check general permission
            hasPermission = consentRequestService.checkPermission(doctorId, patientId);
            hasPendingRequest = consentRequestService.hasPendingRequest(doctorId, patientId);
        }
        
        Map<String, Boolean> response = new java.util.HashMap<>();
        response.put("hasPermission", hasPermission);
        response.put("hasPendingRequest", hasPendingRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ConsentRequestDto>> getPendingRequestsForPatient(@RequestParam String patientId) {
        List<ConsentRequestDto> pendingRequests = consentRequestService.getPendingRequestsForPatient(patientId);
        return ResponseEntity.ok(pendingRequests);
    }
}
