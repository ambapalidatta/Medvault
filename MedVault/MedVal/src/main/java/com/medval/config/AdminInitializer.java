package com.medval.config;

import com.medval.model.Admin;
import com.medval.model.User;
import com.medval.repository.AdminRepository;
import com.medval.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Value("${app.admin.email:${ADMIN_EMAIL:admin@medvault.com}}")
    private String adminEmail;

    @Value("${app.admin.password:${ADMIN_PASSWORD:}}")
    private String adminPassword;

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminPassword == null || adminPassword.isBlank()) {
                System.out.println("Default admin creation skipped: ADMIN_PASSWORD is not set.");
                return;
            }

            User adminUser = userRepository.findByEmail(adminEmail).orElseGet(User::new);

            boolean isNewUser = adminUser.getUserId() == null;

            adminUser.setEmail(adminEmail);
            adminUser.setRole("ADMIN");
            adminUser.setActive(true);
            adminUser.setVerified(true);

            if (isNewUser || adminUser.getPasswordHash() == null || adminUser.getPasswordHash().isBlank()) {
                adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
            }

            userRepository.save(adminUser);

            if (adminRepository.findByUser(adminUser).isEmpty()) {
                Admin adminProfile = new Admin();
                adminProfile.setUser(adminUser);
                adminProfile.setFirstName("System");
                adminProfile.setLastName("Admin");
                adminProfile.setPhone("0000000000");
                adminProfile.setDepartment("Administration");
                adminRepository.save(adminProfile);
            }

            System.out.println("Default admin is ready:");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: [HIDDEN]");
        };
    }
}