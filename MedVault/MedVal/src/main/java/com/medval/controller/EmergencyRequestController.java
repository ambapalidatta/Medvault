package com.medval.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medval.dto.EmergencyRequestDto;
import com.medval.service.EmergencyRequestService;

@RestController
@RequestMapping("/api/emergency-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class EmergencyRequestController {

    @Autowired
    private EmergencyRequestService emergencyRequestService;

    @PostMapping("/create")
    public ResponseEntity<?> createEmergencyRequest(@RequestBody EmergencyRequestDto dto) {
        try {
            EmergencyRequestDto created = emergencyRequestService.createEmergencyRequest(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientRequests(@PathVariable String patientId) {
        try {
            List<EmergencyRequestDto> requests = emergencyRequestService.getPatientRequests(patientId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorRequests(@PathVariable String doctorId) {
        try {
            List<EmergencyRequestDto> requests = emergencyRequestService.getDoctorRequests(doctorId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        try {
            EmergencyRequestDto updated = emergencyRequestService.approveRequest(requestId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        try {
            EmergencyRequestDto updated = emergencyRequestService.rejectRequest(requestId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long requestId, @RequestBody java.util.Map<String, String> statusMap) {
        try {
            String status = statusMap.get("status");
            EmergencyRequestDto updated;
            if ("APPROVED".equals(status)) {
                updated = emergencyRequestService.approveRequest(requestId);
            } else if ("REJECTED".equals(status)) {
                updated = emergencyRequestService.rejectRequest(requestId);
            } else {
                return ResponseEntity.badRequest().body("Invalid status");
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllEmergencyRequests() {
        try {
            List<EmergencyRequestDto> requests = emergencyRequestService.getAllRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
