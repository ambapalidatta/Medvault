package com.medval.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.medval.dto.AdminRegistrationDto;
import com.medval.dto.DoctorRegistrationDto;
import com.medval.dto.LoginRequestDto;
import com.medval.dto.PatientRegistrationDto;
import com.medval.dto.UserInfoResponseDto;
import com.medval.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDto loginRequestDto) {
        try {
            UserInfoResponseDto userInfo = authService.loginUser(loginRequestDto);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@RequestBody PatientRegistrationDto registrationDto) {
        try {
            authService.registerPatient(registrationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body("Patient registered successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorRegistrationDto registrationDto) {
        try {
            authService.registerDoctor(registrationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body("Doctor registered successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegistrationDto registrationDto) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Admin registration is disabled.");
    }
}