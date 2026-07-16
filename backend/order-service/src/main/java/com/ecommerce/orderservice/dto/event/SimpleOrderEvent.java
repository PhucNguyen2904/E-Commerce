package com.ecommerce.orderservice.dto.event;

import java.util.UUID;

public class SimpleOrderEvent {
    private UUID orderId;

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
}
