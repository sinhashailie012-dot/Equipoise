package com.equipoise.backend.notification;

public interface NotificationService {
    void sendAlertNotification(String personName, String alertTitle, String severity);
    void sendDigest(String subject, String content);
    boolean sendTestNotification();
    boolean isSlackConfigured();
    boolean isEmailConfigured();
}
