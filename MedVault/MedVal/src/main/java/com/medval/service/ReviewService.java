package com.medval.service;

import com.medval.dto.ReviewDto;
import com.medval.exception.ResourceNotFoundException;
import com.medval.model.Appointment;
import com.medval.model.Doctor;
import com.medval.model.EmergencyRequest;
import com.medval.model.Patient;
import com.medval.model.Review;
import com.medval.repository.AppointmentRepository;
import com.medval.repository.DoctorRepository;
import com.medval.repository.EmergencyRequestRepository;
import com.medval.repository.PatientRepository;
import com.medval.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final EmergencyRequestRepository emergencyRequestRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         PatientRepository patientRepository,
                         DoctorRepository doctorRepository,
                         AppointmentRepository appointmentRepository,
                         EmergencyRequestRepository emergencyRequestRepository) {
        this.reviewRepository = reviewRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.emergencyRequestRepository = emergencyRequestRepository;
    }

    /**
     * Creates a new review and links it to the appointment or emergency request.
     * @Transactional ensures this all happens in one database transaction.
     */
    @Transactional
    public Review submitReview(ReviewDto reviewDto) {
        
        // 1. Find the related entities using String IDs
        Patient patient = patientRepository.findById(reviewDto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + reviewDto.getPatientId()));
        
        Doctor doctor = doctorRepository.findById(reviewDto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + reviewDto.getDoctorId()));

        // 2. Create the new Review object
        Review newReview = new Review();
        newReview.setPatient(patient);
        newReview.setDoctor(doctor);
        newReview.setRating(reviewDto.getRating());
        newReview.setFeedback(reviewDto.getFeedbackText());

        // 3. Handle either appointment or emergency request
        if (reviewDto.getAppointmentId() != null && !reviewDto.getAppointmentId().isEmpty()) {
            // Regular appointment review
            Appointment appointment = appointmentRepository.findById(reviewDto.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + reviewDto.getAppointmentId()));

            // Check if a review already exists
            if (appointment.getReview() != null) {
                throw new IllegalStateException("A review already exists for this appointment.");
            }
            newReview.setAppointment(appointment);
        } else if (reviewDto.getRequestId() != null) {
            // Emergency request review
            EmergencyRequest emergencyRequest = emergencyRequestRepository.findById(reviewDto.getRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Emergency request not found with id: " + reviewDto.getRequestId()));
            newReview.setEmergencyRequest(emergencyRequest);
        } else {
            throw new IllegalArgumentException("Either appointmentId or requestId must be provided");
        }

        // 4. Save the new review
        return reviewRepository.save(newReview);
    }
    
    /**
     * Get all reviews for a specific doctor
     */
    public java.util.List<Review> getReviewsByDoctor(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        return reviewRepository.findByDoctor(doctor);
    }
    
    /**
     * Get all reviews by a specific patient
     */
    public java.util.List<Review> getReviewsByPatient(String patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
        return reviewRepository.findByPatient(patient);
    }
    
    /**
     * Get review for a specific appointment
     */
    public Review getReviewByAppointment(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        return reviewRepository.findByAppointment(appointment).orElse(null);
    }
}
