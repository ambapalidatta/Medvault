package com.medval.controller;

import com.medval.dto.ReviewDto;
import com.medval.exception.ResourceNotFoundException;
import com.medval.model.Review;
import com.medval.service.ReviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDto reviewDto) {
        try {
            Review savedReview = reviewService.submitReview(reviewDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            System.err.println("Review submission failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to submit review."));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getReviewsByDoctor(@PathVariable String doctorId) {
        try {
            List<Review> reviews = reviewService.getReviewsByDoctor(doctorId);
            return ResponseEntity.ok(reviews);

        } catch (Exception e) {
            System.err.println("Fetching doctor reviews failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch doctor reviews."));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getReviewsByPatient(@PathVariable String patientId) {
        try {
            List<Review> reviews = reviewService.getReviewsByPatient(patientId);
            return ResponseEntity.ok(reviews);

        } catch (Exception e) {
            System.err.println("Fetching patient reviews failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch patient reviews."));
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getReviewByAppointment(@PathVariable String appointmentId) {
        try {
            Review review = reviewService.getReviewByAppointment(appointmentId);

            if (review == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Review not found."));
            }

            return ResponseEntity.ok(review);

        } catch (Exception e) {
            System.err.println("Fetching appointment review failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch appointment review."));
        }
    }
}