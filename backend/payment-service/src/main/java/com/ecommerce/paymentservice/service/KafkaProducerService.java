package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.dto.event.SimpleOrderEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendPaymentCompleted(SimpleOrderEvent event) {
        kafkaTemplate.send("payment.completed", event.getOrderId().toString(), event);
    }

    public void sendPaymentFailed(SimpleOrderEvent event) {
        // We use SimpleOrderEvent which contains orderId.
        // It will be safely deserialized by order-service.
        kafkaTemplate.send("payment.failed", event.getOrderId().toString(), event);
    }
}
