package com.medval.config;

import com.medval.model.User;
import com.medval.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@medvault.com";

            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole("ADMIN");
                admin.setFirstName("System");
                admin.setLastName("Admin");

                userRepository.save(admin);

                System.out.println("Default admin created:");
                System.out.println("Email: admin@medvault.com");
                System.out.println("Password: Admin@123");
            } else {
                System.out.println("Default admin already exists.");
            }
        };
    }
}