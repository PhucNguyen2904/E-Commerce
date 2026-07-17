package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.domain.entity.ProcessedEvent;
import com.ecommerce.orderservice.dto.event.InventoryReservationFailedEvent;
import com.ecommerce.orderservice.dto.event.OrderEvent;
import com.ecommerce.orderservice.dto.event.SimpleOrderEvent;
import com.ecommerce.orderservice.repository.ProcessedEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final OrderService orderService;
    private final ProcessedEventRepository processedEventRepository;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(OrderService orderService, ProcessedEventRepository processedEventRepository,
                                 ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.processedEventRepository = processedEventRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "inventory.reserved", groupId = "order-group")
    public void handleInventoryReserved(String message) {
        try {
            SimpleOrderEvent event = objectMapper.readValue(message, SimpleOrderEvent.class);
            String eventId = event.getOrderId().toString() + "-inventory.reserved";
            if (checkProcessed(eventId)) return;
            orderService.handleInventoryReserved(event.getOrderId());
            markProcessed(eventId);
        } catch (Exception e) {
            log.error("Failed to process inventory.reserved: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "inventory.reservation-failed", groupId = "order-group")
    public void handleInventoryReservationFailed(String message) {
        try {
            InventoryReservationFailedEvent event = objectMapper.readValue(message, InventoryReservationFailedEvent.class);
            String eventId = event.getOrderId().toString() + "-inventory.reservation-failed";
            if (checkProcessed(eventId)) return;
            orderService.handleInventoryReservationFailed(event.getOrderId(), event.getReason());
            markProcessed(eventId);
        } catch (Exception e) {
            log.error("Failed to process inventory.reservation-failed: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "payment.completed", groupId = "order-group")
    public void handlePaymentCompleted(String message) {
        try {
            SimpleOrderEvent event = objectMapper.readValue(message, SimpleOrderEvent.class);
            String eventId = event.getOrderId().toString() + "-payment.completed";
            if (checkProcessed(eventId)) return;
            orderService.handlePaymentCompleted(event.getOrderId());
            markProcessed(eventId);
        } catch (Exception e) {
            log.error("Failed to process payment.completed: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "payment.failed", groupId = "order-group")
    public void handlePaymentFailed(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            String eventId = event.getOrderId().toString() + "-payment.failed";
            if (checkProcessed(eventId)) return;
            orderService.handlePaymentFailed(event.getOrderId());
            markProcessed(eventId);
        } catch (Exception e) {
            log.error("Failed to process payment.failed: {}", e.getMessage(), e);
        }
    }

    private boolean checkProcessed(String eventId) {
        if (processedEventRepository.existsById(eventId)) {
            log.info("Event {} already processed. Skipping.", eventId);
            return true;
        }
        return false;
    }

    private void markProcessed(String eventId) {
        processedEventRepository.save(new ProcessedEvent(eventId));
    }
}
