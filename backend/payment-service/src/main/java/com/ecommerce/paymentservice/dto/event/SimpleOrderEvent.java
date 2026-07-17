package com.ecommerce.paymentservice.dto.event;

import java.util.UUID;

public class SimpleOrderEvent {
    private UUID orderId;

    public SimpleOrderEvent() {}

    public SimpleOrderEvent(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
}
