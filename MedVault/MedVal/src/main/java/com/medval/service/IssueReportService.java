package com.medval.service;

import com.medval.dto.IssueReportDto;
import com.medval.model.IssueReport;
import com.medval.repository.IssueReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class IssueReportService {

    private final IssueReportRepository issueReportRepository;
    private final NotificationService notificationService;

    public IssueReportService(
            IssueReportRepository issueReportRepository,
            NotificationService notificationService) {
        this.issueReportRepository = issueReportRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public IssueReport createIssue(IssueReportDto dto) {
        IssueReport issue = new IssueReport();

        issue.setName(dto.getName());
        issue.setEmail(dto.getEmail());
        issue.setPhoneNumber(dto.getPhoneNumber());
        issue.setMessage(dto.getMessage());
        issue.setSubject(dto.getSubject());
        issue.setUserId(dto.getUserId());
        issue.setUserType(dto.getUserType());
        issue.setStatus("pending");

        IssueReport savedIssue = issueReportRepository.save(issue);

        String userTypeLabel = dto.getUserType() != null && !dto.getUserType().isBlank()
                ? dto.getUserType()
                : "User";

        String notificationMessage = "New issue reported by " + userTypeLabel + ": "
                + safeText(dto.getName()) + " - Subject: "
                + safeText(dto.getSubject());

        notificationService.notifyAdmins(notificationMessage, "ISSUE_REPORTED");

        return savedIssue;
    }

    @Transactional(readOnly = true)
    public List<IssueReport> getAllIssues() {
        return issueReportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<IssueReport> getIssuesByStatus(String status) {
        return issueReportRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public Optional<IssueReport> getIssueById(Long id) {
        return issueReportRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<IssueReport> getIssuesByUserId(String userId) {
        return issueReportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<IssueReport> getIssuesByUserIdAndType(String userId, String userType) {
        return issueReportRepository.findByUserIdAndUserTypeOrderByCreatedAtDesc(userId, userType);
    }

    @Transactional(readOnly = true)
    public List<IssueReport> getIssuesByEmail(String email) {
        return issueReportRepository.findByEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public IssueReport updateIssueStatus(Long id, String status) {
        IssueReport issue = issueReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue report not found."));

        issue.setStatus(status);
        return issueReportRepository.save(issue);
    }

    @Transactional
    public IssueReport updateIssueWithAdminMessage(Long id, String status, String adminMessage) {
        IssueReport issue = issueReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue report not found."));

        if (status != null && !status.isBlank()) {
            issue.setStatus(status);
        }

        if (adminMessage != null) {
            issue.setAdminMessage(adminMessage);
        }

        return issueReportRepository.save(issue);
    }

    @Transactional
    public void deleteIssue(Long id) {
        if (!issueReportRepository.existsById(id)) {
            throw new RuntimeException("Issue report not found.");
        }

        issueReportRepository.deleteById(id);
    }

    private String safeText(String value) {
        return value == null || value.isBlank() ? "N/A" : value.trim();
    }
}