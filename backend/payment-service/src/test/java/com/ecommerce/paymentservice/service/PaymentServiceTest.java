package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.domain.entity.Payment;
import com.ecommerce.paymentservice.domain.enums.PaymentStatus;
import com.ecommerce.paymentservice.dto.event.PaymentRequestedEvent;
import com.ecommerce.paymentservice.gateway.PaymentGateway;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private PaymentService paymentService;

    private UUID orderId;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
    }

    @Test
    void processPaymentRequest_Skip_IfAlreadyExists() {
        PaymentRequestedEvent event = new PaymentRequestedEvent();
        event.setOrderId(orderId);

        when(paymentRepository.existsByOrderId(orderId)).thenReturn(true);

        paymentService.processPaymentRequest(event);

        verify(paymentRepository, never()).save(any());
        verify(paymentGateway, never()).processPayment(any());
    }

    @Test
    void processPaymentRequest_Success() {
        PaymentRequestedEvent event = new PaymentRequestedEvent();
        event.setOrderId(orderId);
        event.setUserId(UUID.randomUUID());
        event.setTotalAmount(new BigDecimal("100"));

        when(paymentRepository.existsByOrderId(orderId)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);
        when(paymentGateway.processPayment(any(Payment.class))).thenReturn(true);

        paymentService.processPaymentRequest(event);

        verify(paymentRepository, times(2)).save(any(Payment.class)); // 1 for PENDING, 1 for SUCCESS
        verify(kafkaProducerService, times(1)).sendPaymentCompleted(any());
    }

    @Test
    void processPaymentRequest_Failed() {
        PaymentRequestedEvent event = new PaymentRequestedEvent();
        event.setOrderId(orderId);
        event.setUserId(UUID.randomUUID());
        event.setTotalAmount(new BigDecimal("130"));

        when(paymentRepository.existsByOrderId(orderId)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);
        when(paymentGateway.processPayment(any(Payment.class))).thenReturn(false);

        paymentService.processPaymentRequest(event);

        verify(paymentRepository, times(2)).save(any(Payment.class)); // 1 for PENDING, 1 for FAILED
        verify(kafkaProducerService, times(1)).sendPaymentFailed(any());
    }
}
