package com.ecommerce.notificationservice.service;

import com.ecommerce.notificationservice.client.AuthClient;
import com.ecommerce.notificationservice.client.UserResponse;
import com.ecommerce.notificationservice.domain.entity.NotificationLog;
import com.ecommerce.notificationservice.domain.enums.NotificationStatus;
import com.ecommerce.notificationservice.domain.enums.NotificationType;
import com.ecommerce.notificationservice.dto.event.OrderEvent;
import com.ecommerce.notificationservice.dto.event.SimpleOrderEvent;
import com.ecommerce.notificationservice.repository.NotificationLogRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationLogRepository notificationLogRepository;
    private final AuthClient authClient;
    private final EmailService emailService;

    // Fake user ID for demo since order service doesn't pass userId in SimpleOrderEvent.
    // In a real scenario, we'd pass userId in the event.
    // Wait, let's just make AuthClient take a hardcoded ID for demo?
    // Actually, in Phase 6, OrderCreatedEvent has userId, but SimpleOrderEvent (used for order.confirmed) does not.
    // So we can't easily fetch email without the userId unless we call order-service to get order details first.
    // Let's assume we can call order-service, or we can just send to a dummy email for now if userId is missing.

    public NotificationService(NotificationLogRepository notificationLogRepository, AuthClient authClient, EmailService emailService) {
        this.notificationLogRepository = notificationLogRepository;
        this.authClient = authClient;
        this.emailService = emailService;
    }

    public void processOrderConfirmed(SimpleOrderEvent event) {
        UUID orderId = event.getOrderId();
        UUID userId = event.getUserId();
        
        if (notificationLogRepository.existsByOrderIdAndType(orderId, NotificationType.ORDER_CONFIRMED)) {
            log.info("Order confirmation email for order {} has already been sent or attempted. Skipping.", orderId);
            return;
        }

        try {
            UserResponse user = getAuthUserWithCircuitBreaker(userId);
            String toEmail = user.getEmail();
            String customerName = user.getFullName();

            String subject = "Order Confirmation - " + orderId;
            String text = String.format("Dear %s,\n\nYour order %s has been confirmed and payment was successful. Thank you for shopping with us!\n\nBest regards,\nE-Commerce Team", customerName, orderId);
            
            emailService.sendEmail(toEmail, subject, text);
            
            NotificationLog notifLog = new NotificationLog(orderId, userId, NotificationType.ORDER_CONFIRMED, "EMAIL", NotificationStatus.SENT);
            notificationLogRepository.save(notifLog);
        } catch (Exception e) {
            log.error("Failed to process order confirmation notification for {}: {}", orderId, e.getMessage());
            NotificationLog notifLog = new NotificationLog(orderId, userId, NotificationType.ORDER_CONFIRMED, "EMAIL", NotificationStatus.FAILED);
            notificationLogRepository.save(notifLog);
        }
    }

    public void processOrderFailed(OrderEvent event) {
        UUID orderId = event.getOrderId();
        UUID userId = event.getUserId();
        
        if (notificationLogRepository.existsByOrderIdAndType(orderId, NotificationType.ORDER_FAILED)) {
            log.info("Order failed email for order {} has already been sent or attempted. Skipping.", orderId);
            return;
        }

        try {
            UserResponse user = getAuthUserWithCircuitBreaker(userId);
            String toEmail = user.getEmail();
            String customerName = user.getFullName();

            String subject = "Order Failed - " + orderId;
            String text = String.format("Dear %s,\n\nWe're sorry to inform you that your order %s has failed. This could be due to inventory issues or a declined payment. Please try placing your order again.\n\nBest regards,\nE-Commerce Team", customerName, orderId);
            
            emailService.sendEmail(toEmail, subject, text);
            
            NotificationLog notifLog = new NotificationLog(orderId, userId, NotificationType.ORDER_FAILED, "EMAIL", NotificationStatus.SENT);
            notificationLogRepository.save(notifLog);
        } catch (Exception e) {
            log.error("Failed to process order failed notification for {}: {}", orderId, e.getMessage());
            NotificationLog notifLog = new NotificationLog(orderId, userId, NotificationType.ORDER_FAILED, "EMAIL", NotificationStatus.FAILED);
            notificationLogRepository.save(notifLog);
        }
    }

    @CircuitBreaker(name = "authService", fallbackMethod = "getAuthUserFallback")
    public UserResponse getAuthUserWithCircuitBreaker(UUID userId) {
        if (userId == null) {
            throw new RuntimeException("UserId is null in the event payload");
        }
        return authClient.getInternalUserById(userId);
    }

    public UserResponse getAuthUserFallback(UUID userId, Throwable t) {
        log.error("Auth service failed for user {}: {}", userId, t.getMessage());
        throw new RuntimeException("Auth Service Unavailable", t);
    }
}
