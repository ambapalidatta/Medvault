package com.medval.controller;

import com.medval.dto.DoctorSlotDto;
import com.medval.service.DoctorSlotService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
public class DoctorSlotController {

    private final DoctorSlotService slotService;

    public DoctorSlotController(DoctorSlotService slotService) {
        this.slotService = slotService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSlots(@RequestBody DoctorSlotDto dto) {
        try {
            List<DoctorSlotDto> slots = slotService.createSlots(dto);
            return ResponseEntity.ok(slots);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Slot creation failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to create slots."));
        }
    }

    @GetMapping("/available/{doctorId}")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable String doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<DoctorSlotDto> slots = slotService.getAvailableSlots(doctorId, date);
            return ResponseEntity.ok(slots);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching available slots failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch available slots."));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorSlots(@PathVariable String doctorId) {
        try {
            List<DoctorSlotDto> slots = slotService.getDoctorSlots(doctorId);
            return ResponseEntity.ok(slots);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Fetching doctor slots failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch doctor slots."));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchSlots(
            @RequestParam String doctorName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<DoctorSlotDto> slots = slotService.searchAvailableSlots(doctorName, date);
            return ResponseEntity.ok(slots);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Slot search failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to search slots."));
        }
    }
}