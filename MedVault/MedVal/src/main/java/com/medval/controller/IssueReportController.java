package com.medval.controller;

import com.medval.dto.IssueReportDto;
import com.medval.model.IssueReport;
import com.medval.service.IssueReportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class IssueReportController {

    private final IssueReportService issueReportService;

    public IssueReportController(IssueReportService issueReportService) {
        this.issueReportService = issueReportService;
    }

    @PostMapping("/issues")
    public ResponseEntity<?> submitIssue(@RequestBody IssueReportDto dto) {
        try {
            IssueReport issue = issueReportService.createIssue(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(issue);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Issue submission failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to submit issue. Please try again later."));
        }
    }

    @GetMapping("/admin/issues")
    public ResponseEntity<List<IssueReport>> getAllIssues() {
        return ResponseEntity.ok(issueReportService.getAllIssues());
    }

    @GetMapping("/admin/issues/status/{status}")
    public ResponseEntity<List<IssueReport>> getIssuesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(issueReportService.getIssuesByStatus(status));
    }

    @GetMapping("/admin/issues/{id}")
    public ResponseEntity<?> getIssueById(@PathVariable Long id) {
        Optional<IssueReport> issue = issueReportService.getIssueById(id);

        return issue
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    @PutMapping("/admin/issues/{id}/status")
    public ResponseEntity<?> updateIssueStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        String adminMessage = body.get("adminMessage");

        if ((status == null || status.isBlank()) && (adminMessage == null || adminMessage.isBlank())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Status or admin message is required."));
        }

        try {
            IssueReport updated = issueReportService.updateIssueWithAdminMessage(id, status, adminMessage);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Issue update failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update issue."));
        }
    }

    @GetMapping("/issues/user/{userId}")
    public ResponseEntity<List<IssueReport>> getIssuesByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(issueReportService.getIssuesByUserId(userId));
    }

    @GetMapping("/issues/email/{email}")
    public ResponseEntity<List<IssueReport>> getIssuesByEmail(@PathVariable String email) {
        return ResponseEntity.ok(issueReportService.getIssuesByEmail(email));
    }

    @DeleteMapping("/admin/issues/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        try {
            issueReportService.deleteIssue(id);
            return ResponseEntity.ok(Map.of("message", "Issue deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Issue deletion failed: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to delete issue."));
        }
    }
}