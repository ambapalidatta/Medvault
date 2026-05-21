package com.medval.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medval.dto.ReviewDto;
import com.medval.exception.ResourceNotFoundException;
import com.medval.model.Review;
import com.medval.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Endpoint to submit a new review.
     * It accepts the ReviewDto from the request body.
     */
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDto reviewDto) {
        try {
            // The service handles all the logic
            Review savedReview = reviewService.submitReview(reviewDto);
            return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            // If Patient, Doctor, or Appointment isn't found
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            // If a review already exists
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // For any other unexpected error
            e.printStackTrace(); // Good for debugging
            return new ResponseEntity<>("Error submitting review: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get all reviews for a specific doctor
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getReviewsByDoctor(@PathVariable String doctorId) {
        try {
            List<Review> reviews = reviewService.getReviewsByDoctor(doctorId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching reviews: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get all reviews for a specific patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getReviewsByPatient(@PathVariable String patientId) {
        try {
            List<Review> reviews = reviewService.getReviewsByPatient(patientId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching reviews: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get review for a specific appointment
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getReviewByAppointment(@PathVariable String appointmentId) {
        try {
            Review review = reviewService.getReviewByAppointment(appointmentId);
            if (review != null) {
                return ResponseEntity.ok(review);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching review: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}