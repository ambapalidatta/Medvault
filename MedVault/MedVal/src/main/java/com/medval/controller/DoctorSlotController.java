package com.medval.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.medval.dto.DoctorSlotDto;
import com.medval.service.DoctorSlotService;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorSlotController {

    @Autowired
    private DoctorSlotService slotService;

    @PostMapping("/create")
    public ResponseEntity<?> createSlots(@RequestBody DoctorSlotDto dto) {
        try {
            List<DoctorSlotDto> slots = slotService.createSlots(dto);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/available/{doctorId}")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable String doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<DoctorSlotDto> slots = slotService.getAvailableSlots(doctorId, date);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorSlots(@PathVariable String doctorId) {
        try {
            List<DoctorSlotDto> slots = slotService.getDoctorSlots(doctorId);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchSlots(
            @RequestParam String doctorName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<DoctorSlotDto> slots = slotService.searchAvailableSlots(doctorName, date);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
