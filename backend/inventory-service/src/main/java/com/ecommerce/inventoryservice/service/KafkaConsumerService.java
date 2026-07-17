package com.ecommerce.inventoryservice.service;

import com.ecommerce.inventoryservice.domain.entity.ProcessedEvent;
import com.ecommerce.inventoryservice.dto.event.OrderCreatedEvent;
import com.ecommerce.inventoryservice.dto.event.OrderEvent;
import com.ecommerce.inventoryservice.exception.InventoryException;
import com.ecommerce.inventoryservice.repository.ProcessedEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final InventoryService inventoryService;
    private final KafkaProducerService kafkaProducerService;
    private final ProcessedEventRepository processedEventRepository;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(InventoryService inventoryService, KafkaProducerService kafkaProducerService,
                                 ProcessedEventRepository processedEventRepository, ObjectMapper objectMapper) {
        this.inventoryService = inventoryService;
        this.kafkaProducerService = kafkaProducerService;
        this.processedEventRepository = processedEventRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "order.created", groupId = "inventory-group")
    @Transactional
    public void handleOrderCreated(String message) {
        try {
            OrderCreatedEvent event = objectMapper.readValue(message, OrderCreatedEvent.class);
            String eventId = event.getOrderId().toString() + "-order.created";
            if (processedEventRepository.existsById(eventId)) {
                log.info("Event {} already processed. Skipping...", eventId);
                return;
            }

            try {
                inventoryService.reserveInventory(event);
                kafkaProducerService.sendInventoryReserved(new com.ecommerce.inventoryservice.dto.event.InventoryReservedEvent(event.getOrderId()));
            } catch (InventoryException e) {
                log.error("Failed to reserve inventory for order {}: {}", event.getOrderId(), e.getMessage());
                kafkaProducerService.sendInventoryReservationFailed(new com.ecommerce.inventoryservice.dto.event.InventoryReservationFailedEvent(event.getOrderId(), e.getMessage()));
            }

            processedEventRepository.save(new ProcessedEvent(eventId));
        } catch (Exception e) {
            log.error("Failed to process order.created message: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = {"payment.failed", "order.cancelled"}, groupId = "inventory-group")
    @Transactional
    public void handleReservationRelease(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            String eventId = event.getOrderId().toString() + "-release";
            if (processedEventRepository.existsById(eventId)) {
                return;
            }
            inventoryService.releaseReservation(event);
            processedEventRepository.save(new ProcessedEvent(eventId));
        } catch (Exception e) {
            log.error("Failed to process reservation release message: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "payment.completed", groupId = "inventory-group")
    @Transactional
    public void handleReservationCommit(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            String eventId = event.getOrderId().toString() + "-commit";
            if (processedEventRepository.existsById(eventId)) {
                return;
            }
            inventoryService.commitReservation(event);
            processedEventRepository.save(new ProcessedEvent(eventId));
        } catch (Exception e) {
            log.error("Failed to process reservation commit message: {}", e.getMessage(), e);
        }
    }
}
