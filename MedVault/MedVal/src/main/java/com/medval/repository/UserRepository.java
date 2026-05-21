package com.medval.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // Custom query to find a user by their email address
    Optional<User> findByEmail(String email);

    // Custom query to check if a user exists with a given email
    Boolean existsByEmail(String email);

    // Custom query to find users by role
    List<User> findByRole(String role);
    
    // Case-insensitive role search
    List<User> findByRoleIgnoreCase(String role);
}
