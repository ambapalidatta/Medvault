package com.medval.repository;

import com.medval.model.IssueReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {
    List<IssueReport> findAllByOrderByCreatedAtDesc();
    List<IssueReport> findByStatusOrderByCreatedAtDesc(String status);
    List<IssueReport> findByEmailOrderByCreatedAtDesc(String email);
    List<IssueReport> findByUserIdAndUserTypeOrderByCreatedAtDesc(String userId, String userType);
    List<IssueReport> findByUserIdOrderByCreatedAtDesc(String userId);
}
