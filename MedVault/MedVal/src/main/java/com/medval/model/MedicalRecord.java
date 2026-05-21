package com.medval.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recordId;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore    
    private Patient patient;

    @Column(nullable = false)
    private String recordType;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate recordDate;

    // --- NEW FIELDS START HERE ---

    // Basic Info
    @Column(name = "address", columnDefinition = "TEXT") // <-- ADDED
    private String address;
    
    @Column(name = "marital_status")
    private String maritalStatus;

    // Identification Details
    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Column(name = "insurance_details")
    private String insuranceDetails;

    @Column(name = "birth_mark")
    private String birthMark;

    // Lifestyle
    @Column(name = "smoking_status")
    private String smokingStatus;

    @Column(name = "alcohol_consumption")
    private String alcoholConsumption;

    @Column(name = "diet_preference")
    private String dietPreference;

    @Column(name = "physical_activity_level")
    private String physicalActivityLevel;

    @Column(name = "sleep_hours")
    private Double sleepHours;

    @Column(name = "stress_level")
    private String stressLevel;

    // Current Health
    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "pulse_rate")
    private Integer pulseRate;

    @Column(name = "body_temperature")
    private Double bodyTemperature;

    // --- NEW FIELDS END HERE ---

    @Column(name = "created_by", nullable = false)
    private String createdBy; 

    private boolean isArchived = false;
    
    @Column(name = "file_url") // <-- ADDED
    private String fileUrl;
    
    @Column(name = "verification_status")
    private String verificationStatus = "PENDING"; 
    
    private LocalDate createdAt = LocalDate.now();
    private LocalDate updatedAt = LocalDate.now();

    // --- Getters & Setters ---

    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getRecordType() { return recordType; }
    public void setRecordType(String recordType) { this.recordType = recordType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public boolean isArchived() { return isArchived; }
    public void setArchived(boolean isArchived) { this.isArchived = isArchived; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    // --- New Getters & Setters ---

    public String getAddress() { return address; } // <-- ADDED
    public void setAddress(String address) { this.address = address; } // <-- ADDED

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public String getInsuranceDetails() { return insuranceDetails; }
    public void setInsuranceDetails(String insuranceDetails) { this.insuranceDetails = insuranceDetails; }

    public String getBirthMark() { return birthMark; }
    public void setBirthMark(String birthMark) { this.birthMark = birthMark; }

    public String getSmokingStatus() { return smokingStatus; }
    public void setSmokingStatus(String smokingStatus) { this.smokingStatus = smokingStatus; }

    public String getAlcoholConsumption() { return alcoholConsumption; }
    public void setAlcoholConsumption(String alcoholConsumption) { this.alcoholConsumption = alcoholConsumption; }

    public String getDietPreference() { return dietPreference; }
    public void setDietPreference(String dietPreference) { this.dietPreference = dietPreference; }

    public String getPhysicalActivityLevel() { return physicalActivityLevel; }
    public void setPhysicalActivityLevel(String physicalActivityLevel) { this.physicalActivityLevel = physicalActivityLevel; }

    public Double getSleepHours() { return sleepHours; }
    public void setSleepHours(Double sleepHours) { this.sleepHours = sleepHours; }

    public String getStressLevel() { return stressLevel; }
    public void setStressLevel(String stressLevel) { this.stressLevel = stressLevel; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Double getHeightCm() { return heightCm; }
    public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }

    public Double getBmi() { return bmi; }
    public void setBmi(Double bmi) { this.bmi = bmi; }

    public Integer getPulseRate() { return pulseRate; }
    public void setPulseRate(Integer pulseRate) { this.pulseRate = pulseRate; }

    public Double getBodyTemperature() { return bodyTemperature; }
    public void setBodyTemperature(Double bodyTemperature) { this.bodyTemperature = bodyTemperature; }
}