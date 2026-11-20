package com.equipoise.backend.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class EmailNotifier {

    private static final Logger log = LoggerFactory.getLogger(EmailNotifier.class);

    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String fromAddress;
    private JavaMailSender mailSender;

    @Autowired
    public EmailNotifier(
            @Value("${app.notifications.mail.host:}") String host,
            @Value("${app.notifications.mail.port:587}") int port,
            @Value("${app.notifications.mail.username:}") String username,
            @Value("${app.notifications.mail.password:}") String password,
            @Value("${app.notifications.mail.from:notifications@equipoise.local}") String fromAddress
    ) {
        this.host = host == null ? "" : host.trim();
        this.port = port;
        this.username = username == null ? "" : username.trim();
        this.password = password == null ? "" : password.trim();
        this.fromAddress = fromAddress == null || fromAddress.isBlank() ? "notifications@equipoise.local" : fromAddress.trim();

        if (isConfigured()) {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(this.host);
            sender.setPort(this.port);
            if (!this.username.isBlank()) {
                sender.setUsername(this.username);
                sender.setPassword(this.password);
            }
            Properties props = sender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", !this.username.isBlank() ? "true" : "false");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.connectiontimeout", "5000");
            props.put("mail.smtp.timeout", "5000");
            this.mailSender = sender;
        }
    }

    // Constructor for testing / injection
    public EmailNotifier(JavaMailSender mailSender, String host, String fromAddress) {
        this.mailSender = mailSender;
        this.host = host;
        this.port = 587;
        this.username = "";
        this.password = "";
        this.fromAddress = fromAddress;
    }

    public boolean isConfigured() {
        return !host.isBlank();
    }

    public boolean send(String to, String subject, String body) {
        if (!isConfigured() || mailSender == null) {
            log.info("[EMAIL NOT CONFIGURED] To: {}, Subject: '{}', Body: {}", to, subject, body);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Successfully sent email notification to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email notification to {}: {}", to, e.getMessage());
            return false;
        }
    }
}
