package com.ecommerce.inventoryservice.service;

import com.ecommerce.inventoryservice.domain.entity.ProcessedEvent;
import com.ecommerce.inventoryservice.dto.event.OrderCreatedEvent;
import com.ecommerce.inventoryservice.dto.event.OrderEvent;
import com.ecommerce.inventoryservice.exception.InventoryException;
import com.ecommerce.inventoryservice.repository.ProcessedEventRepository;
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

    public KafkaConsumerService(InventoryService inventoryService, KafkaProducerService kafkaProducerService, ProcessedEventRepository processedEventRepository) {
        this.inventoryService = inventoryService;
        this.kafkaProducerService = kafkaProducerService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = "order.created", groupId = "inventory-group")
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
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
            // Note: If transaction rolls back, we still want to send the failure event. 
            // In a real system we'd need to handle this carefully (e.g. TransactionalEventListener or Outbox pattern)
            // But since Spring Kafka listener transaction might rollback the send as well if they share transaction manager, 
            // we should be careful. Assuming here standard behavior without chained transaction manager.
        }

        processedEventRepository.save(new ProcessedEvent(eventId));
    }

    @KafkaListener(topics = {"payment.failed", "order.cancelled"}, groupId = "inventory-group")
    @Transactional
    public void handleReservationRelease(OrderEvent event) {
        String eventId = event.getOrderId().toString() + "-release";
        if (processedEventRepository.existsById(eventId)) {
            return;
        }

        inventoryService.releaseReservation(event);
        processedEventRepository.save(new ProcessedEvent(eventId));
    }

    @KafkaListener(topics = "payment.completed", groupId = "inventory-group")
    @Transactional
    public void handleReservationCommit(OrderEvent event) {
        String eventId = event.getOrderId().toString() + "-commit";
        if (processedEventRepository.existsById(eventId)) {
            return;
        }

        inventoryService.commitReservation(event);
        processedEventRepository.save(new ProcessedEvent(eventId));
    }
}
