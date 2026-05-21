package com.medval.repository;

import com.medval.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalse(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    long countByUserIdAndIsReadFalse(String userId);
    
    @Modifying
    @Transactional
    void deleteByUserIdAndIsReadTrue(String userId);
}