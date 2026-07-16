package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.domain.entity.ProcessedEvent;
import com.ecommerce.orderservice.dto.event.InventoryReservationFailedEvent;
import com.ecommerce.orderservice.dto.event.OrderEvent;
import com.ecommerce.orderservice.dto.event.SimpleOrderEvent;
import com.ecommerce.orderservice.repository.ProcessedEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final OrderService orderService;
    private final ProcessedEventRepository processedEventRepository;

    public KafkaConsumerService(OrderService orderService, ProcessedEventRepository processedEventRepository) {
        this.orderService = orderService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = "inventory.reserved", groupId = "order-group")
    public void handleInventoryReserved(SimpleOrderEvent event) {
        String eventId = event.getOrderId().toString() + "-inventory.reserved";
        if (checkProcessed(eventId)) return;

        orderService.handleInventoryReserved(event.getOrderId());
        markProcessed(eventId);
    }

    @KafkaListener(topics = "inventory.reservation-failed", groupId = "order-group")
    public void handleInventoryReservationFailed(InventoryReservationFailedEvent event) {
        String eventId = event.getOrderId().toString() + "-inventory.reservation-failed";
        if (checkProcessed(eventId)) return;

        orderService.handleInventoryReservationFailed(event.getOrderId(), event.getReason());
        markProcessed(eventId);
    }

    @KafkaListener(topics = "payment.completed", groupId = "order-group")
    public void handlePaymentCompleted(SimpleOrderEvent event) {
        String eventId = event.getOrderId().toString() + "-payment.completed";
        if (checkProcessed(eventId)) return;

        orderService.handlePaymentCompleted(event.getOrderId());
        markProcessed(eventId);
    }

    @KafkaListener(topics = "payment.failed", groupId = "order-group")
    public void handlePaymentFailed(OrderEvent event) {
        String eventId = event.getOrderId().toString() + "-payment.failed";
        if (checkProcessed(eventId)) return;

        orderService.handlePaymentFailed(event.getOrderId());
        markProcessed(eventId);
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
