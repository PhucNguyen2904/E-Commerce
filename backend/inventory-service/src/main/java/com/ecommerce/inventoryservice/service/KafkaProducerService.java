package com.ecommerce.inventoryservice.service;

import com.ecommerce.inventoryservice.dto.event.InventoryReservationFailedEvent;
import com.ecommerce.inventoryservice.dto.event.InventoryReservedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendInventoryReserved(InventoryReservedEvent event) {
        kafkaTemplate.send("inventory.reserved", event.getOrderId().toString(), event);
    }

    public void sendInventoryReservationFailed(InventoryReservationFailedEvent event) {
        kafkaTemplate.send("inventory.reservation-failed", event.getOrderId().toString(), event);
    }
}
