package com.medval.service;

import com.medval.dto.IssueReportDto;
import com.medval.model.IssueReport;
import com.medval.repository.IssueReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IssueReportService {
    
    @Autowired
    private IssueReportRepository issueReportRepository;
    
    @Autowired
    private NotificationService notificationService;
    
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
        
        // Notify admins about the new issue
        String userTypeLabel = dto.getUserType() != null ? dto.getUserType() : "User";
        String notificationMessage = "New Issue Reported by " + userTypeLabel + ": " + dto.getName() + " - Subject: " + dto.getSubject();
        notificationService.notifyAdmins(notificationMessage, "ISSUE_REPORTED");
        
        return savedIssue;
    }
    
    public List<IssueReport> getAllIssues() {
        return issueReportRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<IssueReport> getIssuesByStatus(String status) {
        return issueReportRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public Optional<IssueReport> getIssueById(Long id) {
        return issueReportRepository.findById(id);
    }
    
    public List<IssueReport> getIssuesByUserId(String userId) {
        return issueReportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<IssueReport> getIssuesByUserIdAndType(String userId, String userType) {
        return issueReportRepository.findByUserIdAndUserTypeOrderByCreatedAtDesc(userId, userType);
    }
    
    public List<IssueReport> getIssuesByEmail(String email) {
        return issueReportRepository.findByEmailOrderByCreatedAtDesc(email);
    }
    
    public IssueReport updateIssueStatus(Long id, String status) {
        Optional<IssueReport> optionalIssue = issueReportRepository.findById(id);
        if (optionalIssue.isPresent()) {
            IssueReport issue = optionalIssue.get();
            issue.setStatus(status);
            return issueReportRepository.save(issue);
        }
        return null;
    }
    
    public IssueReport updateIssueWithAdminMessage(Long id, String status, String adminMessage) {
        Optional<IssueReport> optionalIssue = issueReportRepository.findById(id);
        if (optionalIssue.isPresent()) {
            IssueReport issue = optionalIssue.get();
            if (status != null && !status.isEmpty()) {
                issue.setStatus(status);
            }
            if (adminMessage != null) {
                issue.setAdminMessage(adminMessage);
            }
            return issueReportRepository.save(issue);
        }
        return null;
    }
    
    public void deleteIssue(Long id) {
        issueReportRepository.deleteById(id);
    }
}
