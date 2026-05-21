package com.medval.service;

// --- REMOVED UNUSED IMPORTS (File, IOException, etc.) ---
import java.util.List;

import org.springframework.stereotype.Service;

import com.medval.model.MedicalRecord;
import com.medval.repository.MedicalRecordRepository;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;

    // --- REMOVED @Value and uploadDir, controller handles this ---

    public MedicalRecordService(MedicalRecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    public List<MedicalRecord> getRecordsByPatientId(String patientId) {
        // --- THIS IS THE FIX ---
        // Call the new, corrected repository method
        return recordRepository.findByPatient_PatientIdOrderByRecordDateDesc(patientId);
    }

    public MedicalRecord saveRecord(MedicalRecord record) {
        // This save method is now correct because the
        // controller is sending a record with objects
        return recordRepository.save(record);
    }

    // --- REMOVED the old 'uploadFile' method ---
    // (Your controller correctly handles this logic now)
}