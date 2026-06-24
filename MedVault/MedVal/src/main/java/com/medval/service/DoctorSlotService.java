package com.medval.service;

import com.medval.dto.DoctorSlotDto;
import com.medval.model.Doctor;
import com.medval.model.DoctorSlot;
import com.medval.repository.DoctorRepository;
import com.medval.repository.DoctorSlotRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DoctorSlotService {

    private final DoctorSlotRepository slotRepository;
    private final DoctorRepository doctorRepository;

    public DoctorSlotService(
            DoctorSlotRepository slotRepository,
            DoctorRepository doctorRepository) {
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public List<DoctorSlotDto> createSlots(DoctorSlotDto dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found."));

        if (dto.getSlotDate() == null) {
            throw new RuntimeException("Slot date is required.");
        }

        if (dto.getSlotTimes() == null || dto.getSlotTimes().isEmpty()) {
            throw new RuntimeException("At least one slot time is required.");
        }

        List<DoctorSlot> slots = new ArrayList<>();

        for (LocalTime time : dto.getSlotTimes()) {
            boolean alreadyExists = slotRepository
                    .findByDoctorProfessionalIdAndSlotDateAndSlotTime(
                            doctor.getProfessionalId(),
                            dto.getSlotDate(),
                            time)
                    .isPresent();

            if (alreadyExists) {
                continue;
            }

            DoctorSlot slot = new DoctorSlot();
            slot.setDoctor(doctor);
            slot.setSlotDate(dto.getSlotDate());
            slot.setSlotTime(time);
            slot.setIsAvailable(true);
            slot.setIsBooked(false);

            slots.add(slot);
        }

        List<DoctorSlot> savedSlots = slotRepository.saveAll(slots);

        return savedSlots.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorSlotDto> getAvailableSlots(String doctorId, LocalDate date) {
        return slotRepository.findByDoctorProfessionalIdAndSlotDateAndIsAvailable(doctorId, date, true)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorSlotDto> getDoctorSlots(String doctorId) {
        return slotRepository.findByDoctorProfessionalId(doctorId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional
    public void markSlotAsBooked(Long slotId) {
        DoctorSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found."));

        if (!Boolean.TRUE.equals(slot.getIsAvailable())) {
            throw new RuntimeException("Slot is already booked.");
        }

        slot.setIsAvailable(false);
        slot.setIsBooked(true);

        slotRepository.save(slot);
    }

    @Transactional
    public void freeSlot(Long slotId) {
        DoctorSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found."));

        slot.setIsAvailable(true);
        slot.setIsBooked(false);

        slotRepository.save(slot);
    }

    @Transactional
    public void freeUpSlot(String doctorId, LocalDate date, LocalTime time) {
        DoctorSlot slot = slotRepository
                .findByDoctorProfessionalIdAndSlotDateAndSlotTime(doctorId, date, time)
                .orElseThrow(() -> new RuntimeException("Slot not found."));

        slot.setIsAvailable(true);
        slot.setIsBooked(false);

        slotRepository.save(slot);
    }

    @Transactional
    public void bookSlot(String doctorId, LocalDate date, LocalTime time) {
        DoctorSlot slot = slotRepository
                .findByDoctorProfessionalIdAndSlotDateAndSlotTime(doctorId, date, time)
                .orElseThrow(() -> new RuntimeException("Slot not found."));

        if (!Boolean.TRUE.equals(slot.getIsAvailable())) {
            throw new RuntimeException("Slot is already booked.");
        }

        slot.setIsAvailable(false);
        slot.setIsBooked(true);

        slotRepository.save(slot);
    }

    @Transactional(readOnly = true)
    public DoctorSlot getSlotById(Long slotId) {
        return slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found."));
    }

    @Transactional(readOnly = true)
    public List<DoctorSlotDto> searchAvailableSlots(String doctorName, LocalDate date) {
        List<Doctor> doctors = doctorRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                doctorName,
                doctorName);

        return doctors.stream()
                .flatMap(doctor -> slotRepository
                        .findByDoctorProfessionalIdAndSlotDateAndIsAvailable(
                                doctor.getProfessionalId(),
                                date,
                                true)
                        .stream())
                .map(this::convertToDto)
                .toList();
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