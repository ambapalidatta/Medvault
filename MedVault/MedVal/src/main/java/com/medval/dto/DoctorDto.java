package com.medval.dto;

import com.medval.model.Doctor;

public class DoctorDto {

    private String id;
    private String firstName;
    private String lastName;
    private String specialization;
    private String profilePictureUrl;
    private Double consultationFee;
    private boolean isVerified;

    // Constructor to convert a Doctor entity to this DTO
    public DoctorDto(Doctor doctor) {
        this.id = doctor.getProfessionalId();
        this.firstName = doctor.getFirstName();
        this.lastName = doctor.getLastName();
        this.specialization = doctor.getSpecialization();
        this.profilePictureUrl = doctor.getProfilePictureUrl();
        this.consultationFee = doctor.getConsultationFee();
        this.isVerified = doctor.isVerified();
    }

    // Getters
    public String getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getSpecialization() { return specialization; }
    public String getProfilePictureUrl() { return profilePictureUrl; } 
    public Double getConsultationFee() { return consultationFee; }
    public boolean isVerified() { return isVerified; } 
}