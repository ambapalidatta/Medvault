package com.medval.service;

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
import com.medval.security.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final JwtService jwtService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            NotificationService notificationService,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public UserInfoResponseDto loginUser(LoginRequestDto loginRequestDto) {
        User user = userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!user.isActive()) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String name = "";
        String profilePictureUrl = null;
        String patientId = null;
        String doctorId = null;

        String role = user.getRole() == null ? "" : user.getRole().toUpperCase();

        switch (role) {
            case "PATIENT":
                Patient patient = patientRepository.findByUser(user).orElse(null);
                if (patient != null) {
                    name = safeFullName(patient.getFirstName(), patient.getLastName());
                    profilePictureUrl = patient.getProfilePictureUrl();
                    patientId = patient.getPatientId();
                }
                break;

            case "DOCTOR":
                Doctor doctor = doctorRepository.findByUser(user).orElse(null);
                if (doctor != null) {
                    name = "Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName());
                    profilePictureUrl = doctor.getProfilePictureUrl();
                    doctorId = doctor.getProfessionalId();
                }
                break;

            case "ADMIN":
                Admin admin = adminRepository.findByUser(user).orElse(null);
                if (admin != null) {
                    name = safeFullName(admin.getFirstName(), admin.getLastName());
                    profilePictureUrl = admin.getProfilePictureUrl();
                }
                break;

            default:
                throw new BadCredentialsException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user);

        return new UserInfoResponseDto(
                user.getUserId(),
                name,
                user.getEmail(),
                user.getRole(),
                profilePictureUrl,
                patientId,
                doctorId,
                token);
    }

    @Transactional
    public void registerPatient(PatientRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }

        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole("PATIENT");
        user.setActive(true);
        user.setVerified(true);
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

        notificationService.notifyAdmins(
                "New patient registered: " + safeFullName(patient.getFirstName(), patient.getLastName()),
                "PATIENT_REGISTERED");

        sendPatientWelcomeEmail(user, patient);
    }

    @Transactional
    public void registerDoctor(DoctorRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }

        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole("DOCTOR");
        user.setActive(true);
        user.setVerified(false);
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

        notificationService.notifyAdmins(
                "New doctor registered: Dr. " + safeFullName(doctor.getFirstName(), doctor.getLastName()),
                "DOCTOR_REGISTERED");

        sendDoctorWelcomeEmail(user, doctor);
    }

    @Transactional
    public void registerAdmin(AdminRegistrationDto registrationDto) {
        throw new RuntimeException("Admin registration is disabled.");
    }

    private void sendPatientWelcomeEmail(User user, Patient patient) {
        try {
            String loginLink = buildFrontendUrl("#login?role=patient");
            String subject = "Welcome to MedVault, " + patient.getFirstName() + "!";

            String htmlBody = buildEmailTemplate(
                    "Welcome aboard, " + patient.getFirstName() + "!",
                    "Your MedVault patient account has been created successfully.",
                    "You can now book appointments, upload health records, view prescriptions, and manage your healthcare journey securely.",
                    "Access Patient Portal",
                    loginLink,
                    "#7c3aed");

            emailService.sendHtmlMessage(user.getEmail(), subject, htmlBody);
        } catch (Exception e) {
            System.err.println("Welcome email failed for patient " + user.getEmail() + ": " + e.getMessage());
        }
    }

    private void sendDoctorWelcomeEmail(User user, Doctor doctor) {
        try {
            String loginLink = buildFrontendUrl("#login?role=doctor");
            String subject = "Welcome to MedVault, Dr. " + doctor.getFirstName() + "!";

            String htmlBody = buildEmailTemplate(
                    "Welcome aboard, Dr. " + doctor.getFirstName() + "!",
                    "Your MedVault doctor account has been created successfully.",
                    "Your account is pending admin verification. Please upload your qualification and license documents to complete verification.",
                    "Access Doctor Portal",
                    loginLink,
                    "#4f46e5");

            emailService.sendHtmlMessage(user.getEmail(), subject, htmlBody);
        } catch (Exception e) {
            System.err.println("Welcome email failed for doctor " + user.getEmail() + ": " + e.getMessage());
        }
    }

    private String buildFrontendUrl(String pathOrHash) {
        String baseUrl = frontendUrl == null || frontendUrl.isBlank()
                ? "http://localhost:5173"
                : frontendUrl.split(",")[0].trim();

        if (pathOrHash == null || pathOrHash.isBlank()) {
            return baseUrl;
        }

        if (pathOrHash.startsWith("#")) {
            return baseUrl + "/" + pathOrHash;
        }

        if (pathOrHash.startsWith("/")) {
            return baseUrl + pathOrHash;
        }

        return baseUrl + "/" + pathOrHash;
    }

    private String buildEmailTemplate(
            String heading,
            String intro,
            String message,
            String buttonText,
            String buttonLink,
            String themeColor) {

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;'>" +
                "<div style='max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.12);'>"
                +
                "<div style='background:" + themeColor + ";padding:32px;color:#ffffff;'>" +
                "<h1 style='margin:0;font-size:26px;'>MedVault</h1>" +
                "<p style='margin:8px 0 0;font-size:14px;opacity:0.9;'>Healthcare Platform</p>" +
                "</div>" +
                "<div style='padding:32px;'>" +
                "<h2 style='margin:0 0 16px;color:#0f172a;font-size:24px;'>" + escapeHtml(heading) + "</h2>" +
                "<p style='color:#334155;font-size:15px;line-height:1.7;margin:0 0 14px;'>" + escapeHtml(intro) + "</p>"
                +
                "<p style='color:#334155;font-size:15px;line-height:1.7;margin:0 0 28px;'>" + escapeHtml(message)
                + "</p>" +
                "<div style='text-align:center;margin:32px 0;'>" +
                "<a href='" + buttonLink + "' style='display:inline-block;background:" + themeColor
                + ";color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:8px;font-weight:700;'>" +
                escapeHtml(buttonText) +
                "</a>" +
                "</div>" +
                "<p style='color:#64748b;font-size:12px;text-align:center;'>If the button does not work, open this link:<br>"
                +
                "<a href='" + buttonLink + "' style='color:" + themeColor + ";'>" + buttonLink + "</a></p>" +
                "</div>" +
                "<div style='background:#0f172a;padding:20px;text-align:center;color:#94a3b8;font-size:12px;'>" +
                "© 2026 MedVault. All rights reserved." +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String safeFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }

    private String escapeHtml(String value) {
        if (value == null)
            return "";

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}