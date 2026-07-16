package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.dto.event.OrderCreatedEvent;
import com.ecommerce.orderservice.dto.event.OrderEvent;
import com.ecommerce.orderservice.dto.event.PaymentRequestedEvent;
import com.ecommerce.orderservice.dto.event.SimpleOrderEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendOrderCreated(OrderCreatedEvent event) {
        kafkaTemplate.send("order.created", event.getOrderId().toString(), event);
    }

    public void sendPaymentRequested(PaymentRequestedEvent event) {
        kafkaTemplate.send("payment.requested", event.getOrderId().toString(), event);
    }

    public void sendOrderConfirmed(SimpleOrderEvent event) {
        kafkaTemplate.send("order.confirmed", event.getOrderId().toString(), event);
    }

    public void sendOrderCancelled(OrderEvent event) {
        kafkaTemplate.send("order.cancelled", event.getOrderId().toString(), event);
    }
}
