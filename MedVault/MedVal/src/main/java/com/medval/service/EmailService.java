package com.medval.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final String FROM_EMAIL = "ambapali890@gmail.com";

    /**
     * Sends a simple plain-text email.
     */
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);

        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }

    /**
     * Sends an HTML email.
     */
    public void sendHtmlMessage(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);
            System.out.println("HTML Email sent successfully to " + to);

        } catch (Exception e) {
            System.err.println("Error sending HTML email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}