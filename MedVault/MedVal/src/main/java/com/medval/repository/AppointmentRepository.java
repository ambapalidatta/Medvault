package com.medval.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.Appointment;
import com.medval.model.Doctor;
import com.medval.model.Patient;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByDoctorAndStatus(Doctor doctor, Appointment.AppointmentStatus status);
    List<Appointment> findByStatusAndAppointmentDateTimeBefore(Appointment.AppointmentStatus status, LocalDateTime dateTime);
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    long countByStatus(Appointment.AppointmentStatus status);
}

