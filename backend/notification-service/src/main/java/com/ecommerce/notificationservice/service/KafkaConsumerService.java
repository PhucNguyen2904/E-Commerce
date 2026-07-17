package com.ecommerce.notificationservice.service;

import com.ecommerce.notificationservice.dto.event.OrderEvent;
import com.ecommerce.notificationservice.dto.event.SimpleOrderEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(NotificationService notificationService, ObjectMapper objectMapper) {
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "order.confirmed", groupId = "notification-group")
    public void handleOrderConfirmed(String message) {
        try {
            SimpleOrderEvent event = objectMapper.readValue(message, SimpleOrderEvent.class);
            log.info("Received order.confirmed for order {}", event.getOrderId());
            notificationService.processOrderConfirmed(event);
        } catch (Exception e) {
            log.error("Failed to process order.confirmed: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "order.cancelled", groupId = "notification-group")
    public void handleOrderCancelled(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            log.info("Received order.cancelled for order {}", event.getOrderId());
            notificationService.processOrderFailed(event);
        } catch (Exception e) {
            log.error("Failed to process order.cancelled: {}", e.getMessage(), e);
        }
    }
}
