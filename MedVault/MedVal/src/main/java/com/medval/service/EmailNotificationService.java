package com.medval.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailNotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setText(htmlBody, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("ambapali890@gmail.com");
            mailSender.send(mimeMessage);
            System.out.println("✅ Email sent successfully to: " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send email to: " + to);
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
