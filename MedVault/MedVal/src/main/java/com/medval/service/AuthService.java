package com.medval.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medval.dto.AdminRegistrationDto;
import com.medval.dto.DoctorRegistrationDto;
import com.medval.dto.LoginRequestDto;
import com.medval.dto.PatientRegistrationDto;
import com.medval.dto.UserInfoResponseDto;
import com.medval.model.Admin;
import com.medval.model.Doctor;
import com.medval.model.Patient;
import com.medval.model.User;
import com.medval.repository.AdminRepository;
import com.medval.repository.DoctorRepository;
import com.medval.repository.PatientRepository;
import com.medval.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final NotificationService notificationService; // Inject NotificationService

    @Autowired
    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       NotificationService notificationService) { // Add to constructor
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.notificationService = notificationService; // Initialize
    }


    @Transactional(readOnly = true)
    public UserInfoResponseDto loginUser(LoginRequestDto loginRequestDto) {
        User user = userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        // --- FIX 1: Declare variables ---
        String name = "";
        String profilePictureUrl = null;
        
        // --- FIX 2: Rename variables to match frontend (patientId, doctorId) ---
        String patientId = null;
        String doctorId = null;

        switch (user.getRole()) {
            case "patient":
                Patient patient = patientRepository.findByUser(user).orElse(null);
                if (patient != null) {
                    name = patient.getFirstName() + " " + patient.getLastName();
                    profilePictureUrl = patient.getProfilePictureUrl();
                    patientId = patient.getPatientId(); // Use renamed variable
                }
                break;
            case "doctor":
                Doctor doctor = doctorRepository.findByUser(user).orElse(null);
                 if (doctor != null) {
                    name = "Dr. " + doctor.getFirstName() + " " + doctor.getLastName();
                    profilePictureUrl = doctor.getProfilePictureUrl();
                    doctorId = doctor.getProfessionalId(); // Use renamed variable
                }
                break;
            case "admin":
            case "ADMIN":
                 Admin admin = adminRepository.findByUser(user).orElse(null);
                 if (admin != null) {
                    name = admin.getFirstName() + " " + admin.getLastName();
                    profilePictureUrl = admin.getProfilePictureUrl();
                 }
                break;
        }

        // --- FIX 3: Pass correct variables to DTO ---
        return new UserInfoResponseDto(user.getUserId(), name, user.getEmail(), user.getRole(), profilePictureUrl, patientId, doctorId);
    }
    
    @Transactional
    public void registerPatient(PatientRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword())); 
        user.setRole("patient");
        user.setActive(true);
        userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(user);
        patient.setFirstName(registrationDto.getFirstName());
        patient.setLastName(registrationDto.getLastName());
        patient.setDateOfBirth(registrationDto.getDateOfBirth());
        patient.setGender(registrationDto.getGender());
        patient.setBloodGroup(registrationDto.getBloodGroup());
        patient.setPhone(registrationDto.getPhone());
        patient.setEmergencyContactName(registrationDto.getEmergencyContactName());
        patient.setEmergencyContactPhone(registrationDto.getEmergencyContactPhone());
        patient.setAddress(registrationDto.getAddress());
        patient.setCity(registrationDto.getCity());
        patient.setState(registrationDto.getState());
        patient.setCountry(registrationDto.getCountry());
        patient.setPostalCode(registrationDto.getPostalCode());
        patient.setProfilePictureUrl(registrationDto.getProfilePictureUrl());
        patientRepository.save(patient);

        // Notify admins about new patient registration
        notificationService.notifyAdmins("New patient registered: " + patient.getFirstName() + " " + patient.getLastName(), "PATIENT_REGISTERED");

        // Send welcome email to patient - Purple gradient theme
        try {
            String subject = "Welcome to MedVault, " + patient.getFirstName() + "!";
            String loginLink = "http://localhost:5173/#login?role=patient";
            
            String htmlBody = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background-color: #f5f3ff;'>" +
                "<div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; box-shadow: 0 10px 40px rgba(124, 58, 237, 0.15);'>" +
                
                // Header - Purple gradient with patient icon
                "<div style='background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%); padding: 45px 35px;'>" +
                "<table width='100%'><tr>" +
                "<td><h1 style='color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;'>MedVault</h1>" +
                "<p style='color: rgba(255,255,255,0.85); margin: 5px 0 0 0; font-size: 13px; letter-spacing: 1px;'>HEALTHCARE PLATFORM</p></td>" +
                "<td style='text-align: right;'><img src='https://cdn-icons-png.flaticon.com/256/2869/2869812.png' alt='Patient' style='width: 55px; height: 55px;'/></td>" +
                "</tr></table>" +
                "</div>" +
                
                // Welcome banner
                "<div style='background: linear-gradient(90deg, #a78bfa 0%, #c4b5fd 100%); padding: 20px 35px;'>" +
                "<p style='color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;'>Welcome aboard, " + patient.getFirstName() + "!</p>" +
                "</div>" +
                
                // Content
                "<div style='padding: 40px 35px;'>" +
                "<p style='color: #374151; font-size: 15px; line-height: 1.8; margin: 0 0 20px 0;'>" +
                "Thank you for joining MedVault. Your account has been successfully created and is ready to use. We're excited to be part of your healthcare journey." +
                "</p>" +
                
                // Features - With icons/ticks
                "<p style='color: #7c3aed; font-size: 13px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;'>What You Can Do</p>" +
                "<table style='width: 100%; margin-bottom: 30px;' cellpadding='10'>" +
                "<tr style='background: #f5f3ff;'><td style='color: #7c3aed; width: 30px;'>📅</td><td style='color: #374151; font-size: 14px;'>Book appointments with verified doctors</td></tr>" +
                "<tr><td style='color: #7c3aed;'>🔐</td><td style='color: #374151; font-size: 14px;'>Access your medical records securely</td></tr>" +
                "<tr style='background: #f5f3ff;'><td style='color: #7c3aed;'>💊</td><td style='color: #374151; font-size: 14px;'>View digital prescriptions</td></tr>" +
                "<tr><td style='color: #7c3aed;'>🚨</td><td style='color: #374151; font-size: 14px;'>Request emergency consultations</td></tr>" +
                "<tr style='background: #f5f3ff;'><td style='color: #7c3aed;'>📊</td><td style='color: #374151; font-size: 14px;'>Track your complete health history</td></tr>" +
                "</table>" +
                
                // CTA Button
                "<div style='text-align: center; margin: 35px 0;'>" +
                "<a href='" + loginLink + "' style='display: inline-block; background: #7c3aed; color: #ffffff; padding: 16px 45px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;'>Access Patient Portal</a>" +
                "</div>" +
                
                "<p style='color: #9ca3af; font-size: 12px; text-align: center;'>Login URL: <a href='" + loginLink + "' style='color: #7c3aed;'>" + loginLink + "</a></p>" +
                "</div>" +
                
                // Footer
                "<div style='background: #1e1b4b; padding: 25px 35px; text-align: center;'>" +
                "<p style='color: #a5b4fc; font-size: 12px; margin: 0 0 5px 0;'>MedVault Healthcare Solutions</p>" +
                "<p style='color: #7c3aed; font-size: 11px; margin: 0;'>© 2025 All rights reserved</p>" +
                "</div>" +
                
                "</div>" +
                "</body>" +
                "</html>";
            
            emailService.sendHtmlMessage(user.getEmail(), subject, htmlBody);
        
        } catch (Exception e) {
            System.err.println("CRITICAL: Welcome email failed to send for user: " + user.getEmail());
            e.printStackTrace();
        }
    }

    @Transactional
    public void registerDoctor(DoctorRegistrationDto registrationDto) {
         if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole("doctor");
        user.setActive(true);
        userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFirstName(registrationDto.getFirstName());
        doctor.setLastName(registrationDto.getLastName());
        doctor.setSpecialization(registrationDto.getSpecialization());
        doctor.setLicenseNumber(registrationDto.getLicenseNumber());
        doctor.setLicenseExpiry(registrationDto.getLicenseExpiry());
        doctor.setQualification(registrationDto.getQualification());
        doctor.setExperienceYears(registrationDto.getExperienceYears());
        doctor.setPhone(registrationDto.getPhone());
        doctor.setHospitalAffiliation(registrationDto.getHospitalAffiliation());
        doctor.setAddress(registrationDto.getAddress());
        doctor.setCity(registrationDto.getCity());
        doctor.setState(registrationDto.getState());
        doctor.setCountry(registrationDto.getCountry());
        doctor.setPostalCode(registrationDto.getPostalCode());
        doctor.setProfilePictureUrl(registrationDto.getProfilePictureUrl());
        doctor.setConsultationFee(registrationDto.getConsultationFee());
        doctor.setVerified(false); 
        
        doctorRepository.save(doctor);

        // Notify admins about new doctor registration
        notificationService.notifyAdmins("New doctor registered: Dr. " + doctor.getFirstName() + " " + doctor.getLastName(), "DOCTOR_REGISTERED");

        // Send welcome email to doctor - Indigo/Purple professional theme
        try {
            String subject = "Welcome to MedVault, Dr. " + doctor.getFirstName() + "!";
            String loginLink = "http://localhost:5173/#login?role=doctor";
            
            String htmlBody = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background-color: #eef2ff;'>" +
                "<div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 0; overflow: hidden; box-shadow: 0 10px 40px rgba(99, 102, 241, 0.15);'>" +
                
                // Header - Professional indigo with stethoscope icon
                "<div style='background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 45px 35px;'>" +
                "<table width='100%'><tr>" +
                "<td><h1 style='color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;'>MedVault</h1>" +
                "<p style='color: rgba(255,255,255,0.85); margin: 5px 0 0 0; font-size: 13px; letter-spacing: 1px;'>HEALTHCARE PLATFORM</p></td>" +
                "<td style='text-align: right;'><img src='https://cdn-icons-png.flaticon.com/256/709/709094.png' alt='Doctor' style='width: 55px; height: 55px;'/></td>" +
                "</tr></table>" +
                "</div>" +
                
                // Welcome banner
                "<div style='background: linear-gradient(90deg, #818cf8 0%, #a78bfa 100%); padding: 20px 35px;'>" +
                "<p style='color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;'>Welcome aboard, Dr. " + doctor.getFirstName() + "!</p>" +
                "</div>" +
                
                // Content
                "<div style='padding: 40px 35px;'>" +
                "<p style='color: #374151; font-size: 15px; line-height: 1.8; margin: 0 0 20px 0;'>" +
                "Thank you for registering with MedVault. Your account has been created successfully. Our verification team will review your credentials within <strong>24-48 hours</strong>." +
                "</p>" +
                
                // Verification notice - amber
                "<div style='background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 8px; padding: 18px; margin: 0 0 25px 0; border: 1px solid #fcd34d;'>" +
                "<p style='color: #92400e; font-size: 14px; margin: 0;'><strong>⏳ Next Step:</strong> Upload your qualifications and medical license to expedite verification.</p>" +
                "</div>" +
                
                // Features - Two column style
                "<p style='color: #4f46e5; font-size: 13px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;'>Platform Features</p>" +
                "<table style='width: 100%; margin-bottom: 30px;' cellpadding='10'>" +
                "<tr style='background: #f5f3ff;'><td style='color: #5b21b6; width: 30px;'>📅</td><td style='color: #374151; font-size: 14px;'>Appointment Management</td></tr>" +
                "<tr><td style='color: #5b21b6;'>🔐</td><td style='color: #374151; font-size: 14px;'>Secure Patient Records Access</td></tr>" +
                "<tr style='background: #f5f3ff;'><td style='color: #5b21b6;'>🗓️</td><td style='color: #374151; font-size: 14px;'>Availability Scheduling</td></tr>" +
                "<tr><td style='color: #5b21b6;'>💊</td><td style='color: #374151; font-size: 14px;'>Digital Prescriptions</td></tr>" +
                "<tr style='background: #f5f3ff;'><td style='color: #5b21b6;'>🚨</td><td style='color: #374151; font-size: 14px;'>Emergency Consultations</td></tr>" +
                "<tr><td style='color: #5b21b6;'>📊</td><td style='color: #374151; font-size: 14px;'>Earnings Dashboard</td></tr>" +
                "</table>" +
                
                // CTA Button - Square professional style
                "<div style='text-align: center; margin: 35px 0;'>" +
                "<a href='" + loginLink + "' style='display: inline-block; background: #4f46e5; color: #ffffff; padding: 16px 45px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;'>Access Doctor Portal</a>" +
                "</div>" +
                
                "<p style='color: #9ca3af; font-size: 12px; text-align: center;'>Login URL: <a href='" + loginLink + "' style='color: #6366f1;'>" + loginLink + "</a></p>" +
                "</div>" +
                
                // Footer - Dark professional
                "<div style='background: #1e1b4b; padding: 25px 35px; text-align: center;'>" +
                "<p style='color: #a5b4fc; font-size: 12px; margin: 0 0 5px 0;'>MedVault Healthcare Solutions</p>" +
                "<p style='color: #6366f1; font-size: 11px; margin: 0;'>© 2025 All rights reserved</p>" +
                "</div>" +
                
                "</div>" +
                "</body>" +
                "</html>";
            
            emailService.sendHtmlMessage(user.getEmail(), subject, htmlBody);
        
        } catch (Exception e) {
            System.err.println("CRITICAL: Welcome email failed to send for doctor: " + user.getEmail());
            e.printStackTrace();
        }
    }

    @Transactional
    public void registerAdmin(AdminRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole("admin");
        user.setActive(true);
        userRepository.save(user);

        Admin admin = new Admin();
        admin.setUser(user);
        admin.setFirstName(registrationDto.getFirstName());
        admin.setLastName(registrationDto.getLastName());
        admin.setPhone(registrationDto.getPhone());
        admin.setDepartment(registrationDto.getDepartment());
        adminRepository.save(admin);
    }
}