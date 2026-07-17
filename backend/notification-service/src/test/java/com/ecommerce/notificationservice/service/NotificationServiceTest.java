package com.ecommerce.notificationservice.service;

import com.ecommerce.notificationservice.client.AuthClient;
import com.ecommerce.notificationservice.client.UserResponse;
import com.ecommerce.notificationservice.domain.entity.NotificationLog;
import com.ecommerce.notificationservice.domain.enums.NotificationStatus;
import com.ecommerce.notificationservice.dto.event.SimpleOrderEvent;
import com.ecommerce.notificationservice.repository.NotificationLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private AuthClient authClient;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationService notificationService;

    private UUID orderId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        userId = UUID.randomUUID();
    }

    @Test
    void processOrderConfirmed_SkipIfExists() {
        SimpleOrderEvent event = new SimpleOrderEvent();
        event.setOrderId(orderId);
        event.setUserId(userId);

        when(notificationLogRepository.existsByOrderIdAndType(any(), any())).thenReturn(true);

        notificationService.processOrderConfirmed(event);

        verify(authClient, never()).getInternalUserById(any());
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    void processOrderConfirmed_Success() {
        SimpleOrderEvent event = new SimpleOrderEvent();
        event.setOrderId(orderId);
        event.setUserId(userId);

        UserResponse user = new UserResponse();
        user.setEmail("test@test.com");
        user.setFullName("Test User");

        when(notificationLogRepository.existsByOrderIdAndType(any(), any())).thenReturn(false);
        when(authClient.getInternalUserById(userId)).thenReturn(user);

        notificationService.processOrderConfirmed(event);

        verify(emailService, times(1)).sendEmail(eq("test@test.com"), contains("Order Confirmation"), anyString());
        verify(notificationLogRepository, times(1)).save(argThat(log -> log.getStatus() == NotificationStatus.SENT));
    }

    @Test
    void processOrderConfirmed_AuthClientFails() {
        SimpleOrderEvent event = new SimpleOrderEvent();
        event.setOrderId(orderId);
        event.setUserId(userId);

        when(notificationLogRepository.existsByOrderIdAndType(any(), any())).thenReturn(false);
        when(authClient.getInternalUserById(userId)).thenThrow(new RuntimeException("Auth service down"));

        // Fallback is called when @CircuitBreaker triggers, but in Mockito we need to test the logic directly
        // The fallback logic in this test might throw since we're mocking AuthClient.
        // Actually, without AOP proxy in unit test, it will just throw.
        try {
            notificationService.processOrderConfirmed(event);
        } catch (Exception ignored) {}

        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
        verify(notificationLogRepository, times(1)).save(argThat(log -> log.getStatus() == NotificationStatus.FAILED));
    }
}
