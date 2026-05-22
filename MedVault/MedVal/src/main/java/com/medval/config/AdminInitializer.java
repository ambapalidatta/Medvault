package com.medval.config;

import com.medval.model.Admin;
import com.medval.model.User;
import com.medval.repository.AdminRepository;
import com.medval.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    private static final String ADMIN_EMAIL = "admin@medvault.com";
    private static final String ADMIN_PASSWORD = "admin123";

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            User adminUser = userRepository.findByEmail(ADMIN_EMAIL).orElseGet(User::new);

            adminUser.setEmail(ADMIN_EMAIL);
            adminUser.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
            adminUser.setRole("ADMIN");
            adminUser.setActive(true);
            adminUser.setVerified(true);

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
            System.out.println("Email: " + ADMIN_EMAIL);
            System.out.println("Password: " + ADMIN_PASSWORD);
        };
    }
}
