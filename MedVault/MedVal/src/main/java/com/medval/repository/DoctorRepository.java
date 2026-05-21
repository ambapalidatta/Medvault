package com.medval.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.Doctor;
import com.medval.model.User;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {
    Optional<Doctor> findByProfessionalId(String professionalId);
    Optional<Doctor> findByUser(User user);
    List<Doctor> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
}
