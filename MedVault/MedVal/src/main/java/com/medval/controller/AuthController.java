package com.medval.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medval.dto.AdminRegistrationDto;
import com.medval.dto.DoctorRegistrationDto;
import com.medval.dto.LoginRequestDto;
import com.medval.dto.PatientRegistrationDto;
import com.medval.dto.UserInfoResponseDto;
import com.medval.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDto loginRequestDto) {
        try {
            UserInfoResponseDto userInfo = authService.loginUser(loginRequestDto);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@RequestBody PatientRegistrationDto registrationDto) {
        try {
            authService.registerPatient(registrationDto);
            return ResponseEntity.ok("Patient registered successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorRegistrationDto registrationDto) {
        try {
            authService.registerDoctor(registrationDto);
            return ResponseEntity.ok("Doctor registered successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegistrationDto registrationDto) {
        try {
            authService.registerAdmin(registrationDto);
            return ResponseEntity.ok("Admin registered successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

