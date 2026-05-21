package com.medval.controller;

import com.medval.dto.IssueReportDto;
import com.medval.model.IssueReport;
import com.medval.service.IssueReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class IssueReportController {
    
    @Autowired
    private IssueReportService issueReportService;
    
    // Submit a new issue (public endpoint for users)
    @PostMapping("/issues")
    public ResponseEntity<?> submitIssue(@RequestBody IssueReportDto dto) {
        try {
            IssueReport issue = issueReportService.createIssue(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(issue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit issue: " + e.getMessage()));
        }
    }
    
    // Get all issues (admin endpoint)
    @GetMapping("/admin/issues")
    public ResponseEntity<List<IssueReport>> getAllIssues() {
        List<IssueReport> issues = issueReportService.getAllIssues();
        return ResponseEntity.ok(issues);
    }
    
    // Get issues by status (admin endpoint)
    @GetMapping("/admin/issues/status/{status}")
    public ResponseEntity<List<IssueReport>> getIssuesByStatus(@PathVariable String status) {
        List<IssueReport> issues = issueReportService.getIssuesByStatus(status);
        return ResponseEntity.ok(issues);
    }
    
    // Get single issue by ID (admin endpoint)
    @GetMapping("/admin/issues/{id}")
    public ResponseEntity<?> getIssueById(@PathVariable Long id) {
        Optional<IssueReport> issue = issueReportService.getIssueById(id);
        if (issue.isPresent()) {
            return ResponseEntity.ok(issue.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Issue not found"));
    }
    
    // Update issue status (admin endpoint)
    @PutMapping("/admin/issues/{id}/status")
    public ResponseEntity<?> updateIssueStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String adminMessage = body.get("adminMessage");
        
        if ((status == null || status.isEmpty()) && (adminMessage == null || adminMessage.isEmpty())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status or admin message is required"));
        }
        
        IssueReport updated = issueReportService.updateIssueWithAdminMessage(id, status, adminMessage);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Issue not found"));
    }
    
    // Get issues by user ID (for patient/doctor dashboard)
    @GetMapping("/issues/user/{userId}")
    public ResponseEntity<List<IssueReport>> getIssuesByUserId(@PathVariable String userId) {
        List<IssueReport> issues = issueReportService.getIssuesByUserId(userId);
        return ResponseEntity.ok(issues);
    }
    
    // Get issues by email (for patient/doctor dashboard - fallback)
    @GetMapping("/issues/email/{email}")
    public ResponseEntity<List<IssueReport>> getIssuesByEmail(@PathVariable String email) {
        List<IssueReport> issues = issueReportService.getIssuesByEmail(email);
        return ResponseEntity.ok(issues);
    }
    
    // Delete issue (admin endpoint)
    @DeleteMapping("/admin/issues/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        try {
            issueReportService.deleteIssue(id);
            return ResponseEntity.ok(Map.of("message", "Issue deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete issue: " + e.getMessage()));
        }
    }
}
