package com.medval.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Use allowedOriginPatterns instead of allowedOrigins to support wildcards with credentials
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Content-Disposition", "Content-Length", "*")); 
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // Allow credentials (cookies/headers)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF
            .csrf(csrf -> csrf.disable()) 

            // 2. Configure CORS using the bean above
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            
            // 3. Stateless Session
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. AUTHORIZATION
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/notifications/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/doctors/**", "/api/patients/**", "/api/slots/**").permitAll()
                .requestMatchers("/api/appointments/**", "/api/emergency-requests/**").permitAll()
                // Allow common public resources
                .requestMatchers("/api/medications/**", "/api/records/**", "/api/qualifications/**").permitAll()
                .requestMatchers("/api/consent-requests/**").permitAll()
                // Allow static file uploads to be served
                .requestMatchers("/uploads/**", "/api/files/**").permitAll()
                
                // Allow everything else for now (to prevent 403 errors during testing)
                .anyRequest().permitAll()
            );
            
        return http.build();
    }
}