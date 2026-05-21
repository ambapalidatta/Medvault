package com.medval.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "medical_conditions")
public class MedicalCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "condition_id") // <-- ADDED THIS
    private String conditionId; // <-- RENAMED FROM 'id'

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private String conditionName;

    private LocalDate diagnosedDate;
    private String status;

    @Column(length = 1000)
    private String notes;

    // --- Getters and Setters ---
    
    // --- RENAMED GETTER/SETTER ---
    public String getConditionId() { return conditionId; }
    public void setConditionId(String conditionId) { this.conditionId = conditionId; }
    // --- END RENAMING ---

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getConditionName() { return conditionName; }
    public void setConditionName(String conditionName) { this.conditionName = conditionName; }

    public LocalDate getDiagnosedDate() { return diagnosedDate; }
    public void setDiagnosedDate(LocalDate diagnosedDate) { this.diagnosedDate = diagnosedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}