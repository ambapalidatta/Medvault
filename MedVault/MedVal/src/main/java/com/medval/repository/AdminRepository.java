package com.medval.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medval.model.Admin;
import com.medval.model.User;

@Repository
public interface AdminRepository extends JpaRepository<Admin, String> {
    // This method allows finding an admin's profile using their main user account
    Optional<Admin> findByUser(User user);
}