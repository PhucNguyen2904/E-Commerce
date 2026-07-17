package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.dto.event.PaymentRequestedEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(PaymentService paymentService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "payment.requested", groupId = "payment-group")
    public void handlePaymentRequested(String message) {
        try {
            PaymentRequestedEvent event = objectMapper.readValue(message, PaymentRequestedEvent.class);
            log.info("Received payment.requested for order {}", event.getOrderId());
            paymentService.processPaymentRequest(event);
        } catch (Exception e) {
            log.error("Failed to process payment.requested message: {}", e.getMessage(), e);
        }
    }
}
