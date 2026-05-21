package com.medval.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.medval.dto.DoctorSlotDto;
import com.medval.model.Doctor;
import com.medval.model.DoctorSlot;
import com.medval.repository.DoctorRepository;
import com.medval.repository.DoctorSlotRepository;

@Service
public class DoctorSlotService {

    @Autowired
    private DoctorSlotRepository slotRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public List<DoctorSlotDto> createSlots(DoctorSlotDto dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<DoctorSlot> slots = new ArrayList<>();
        for (LocalTime time : dto.getSlotTimes()) {
            DoctorSlot slot = new DoctorSlot();
            slot.setDoctor(doctor);
            slot.setSlotDate(dto.getSlotDate());
            slot.setSlotTime(time);
            slot.setIsAvailable(true);
            slots.add(slot);
        }

        List<DoctorSlot> savedSlots = slotRepository.saveAll(slots);
        return savedSlots.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<DoctorSlotDto> getAvailableSlots(String doctorId, LocalDate date) {
        return slotRepository.findByDoctorProfessionalIdAndSlotDateAndIsAvailable(doctorId, date, true)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<DoctorSlotDto> getDoctorSlots(String doctorId) {
        return slotRepository.findByDoctorProfessionalId(doctorId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void markSlotAsBooked(Long slotId) {
        System.out.println("=== markSlotAsBooked called with slotId: " + slotId + " ===");
        DoctorSlot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        System.out.println("Before update - isAvailable: " + slot.getIsAvailable() + ", isBooked: " + slot.getIsBooked());
        slot.setIsAvailable(false);
        slot.setIsBooked(true);
        DoctorSlot savedSlot = slotRepository.save(slot);
        slotRepository.flush(); // Force immediate write to database
        System.out.println("After save - isAvailable: " + savedSlot.getIsAvailable() + ", isBooked: " + savedSlot.getIsBooked());
    }

    public void freeSlot(Long slotId) {
        DoctorSlot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        slot.setIsAvailable(true);
        slot.setIsBooked(false);
        slotRepository.save(slot);
    }

    /**
     * Free up a slot by doctor ID, date, and time (for rescheduling)
     * Sets isAvailable = true and isBooked = false
     */
    @org.springframework.transaction.annotation.Transactional
    public void freeUpSlot(String doctorId, LocalDate date, LocalTime time) {
        System.out.println("=== freeUpSlot called ===");
        System.out.println("DoctorId: " + doctorId + ", Date: " + date + ", Time: " + time);
        
        slotRepository.findByDoctorProfessionalIdAndSlotDateAndSlotTime(doctorId, date, time)
            .ifPresent(slot -> {
                System.out.println("Found slot ID: " + slot.getSlotId() + " - Freeing up...");
                slot.setIsAvailable(true);
                slot.setIsBooked(false);
                slotRepository.save(slot);
                slotRepository.flush();
                System.out.println("✅ Slot freed: isAvailable=" + slot.getIsAvailable() + ", isBooked=" + slot.getIsBooked());
            });
    }

    /**
     * Book a slot by doctor ID, date, and time (for rescheduling)
     * Sets isAvailable = false and isBooked = true
     */
    @org.springframework.transaction.annotation.Transactional
    public void bookSlot(String doctorId, LocalDate date, LocalTime time) {
        System.out.println("=== bookSlot called ===");
        System.out.println("DoctorId: " + doctorId + ", Date: " + date + ", Time: " + time);
        
        DoctorSlot slot = slotRepository.findByDoctorProfessionalIdAndSlotDateAndSlotTime(doctorId, date, time)
            .orElseThrow(() -> new RuntimeException("Slot not found for doctorId=" + doctorId + ", date=" + date + ", time=" + time));
        
        System.out.println("Found slot ID: " + slot.getSlotId() + " - Booking...");
        slot.setIsAvailable(false);
        slot.setIsBooked(true);
        slotRepository.save(slot);
        slotRepository.flush();
        System.out.println("✅ Slot booked: isAvailable=" + slot.getIsAvailable() + ", isBooked=" + slot.getIsBooked());
    }

    public DoctorSlot getSlotById(Long slotId) {
        return slotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
    }

    public List<DoctorSlotDto> searchAvailableSlots(String doctorName, LocalDate date) {
        List<Doctor> doctors = doctorRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(doctorName, doctorName);
        return doctors.stream()
            .flatMap(doctor -> slotRepository.findByDoctorProfessionalIdAndSlotDateAndIsAvailable(
                doctor.getProfessionalId(), date, true).stream())
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    private DoctorSlotDto convertToDto(DoctorSlot slot) {
        DoctorSlotDto dto = new DoctorSlotDto();
        dto.setSlotId(slot.getSlotId());
        dto.setDoctorId(slot.getDoctor().getProfessionalId());
        dto.setSlotDate(slot.getSlotDate());
        dto.setSlotTime(slot.getSlotTime());
        dto.setIsAvailable(slot.getIsAvailable());
        return dto;
    }
}
