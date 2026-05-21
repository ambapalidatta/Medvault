package com.medval.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.Doctor;
import com.medval.model.DoctorQualification;

@Repository
public interface DoctorQualificationRepository extends JpaRepository<DoctorQualification, Long> {
    List<DoctorQualification> findByDoctorProfessionalId(String doctorId);
    List<DoctorQualification> findByDoctor(Doctor doctor);
}
