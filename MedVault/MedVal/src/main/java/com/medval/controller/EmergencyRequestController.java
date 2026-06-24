package com.medval.controller;

import com.medval.dto.EmergencyRequestDto;
import com.medval.service.EmergencyRequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency-requests")
public class EmergencyRequestController {

    private final EmergencyRequestService emergencyRequestService;

    public EmergencyRequestController(EmergencyRequestService emergencyRequestService) {
        this.emergencyRequestService = emergencyRequestService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createEmergencyRequest(@RequestBody EmergencyRequestDto dto) {
        try {
            EmergencyRequestDto created = emergencyRequestService.createEmergencyRequest(dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Emergency request creation failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to create emergency request. Please try again later."));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientRequests(@PathVariable String patientId) {
        try {
            List<EmergencyRequestDto> requests = emergencyRequestService.getPatientRequests(patientId);
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching patient emergency requests failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch emergency requests."));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorRequests(@PathVariable String doctorId) {
        try {
            List<EmergencyRequestDto> requests = emergencyRequestService.getDoctorRequests(doctorId);
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching doctor emergency requests failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch emergency requests."));
        }
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        try {
            EmergencyRequestDto updated = emergencyRequestService.approveRequest(requestId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Emergency request approval failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to approve emergency request."));
        }
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        try {
            EmergencyRequestDto updated = emergencyRequestService.rejectRequest(requestId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Emergency request rejection failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to reject emergency request."));
        }
    }

    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> statusMap) {

        try {
            String status = statusMap.get("status");

            if ("APPROVED".equalsIgnoreCase(status)) {
                return ResponseEntity.ok(emergencyRequestService.approveRequest(requestId));
            }

            if ("REJECTED".equalsIgnoreCase(status)) {
                return ResponseEntity.ok(emergencyRequestService.rejectRequest(requestId));
            }

            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Emergency request status update failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update emergency request status."));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllEmergencyRequests() {
        try {
            List<EmergencyRequestDto> requests = emergencyRequestService.getAllRequests();
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching all emergency requests failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch emergency requests."));
        }
    }
}