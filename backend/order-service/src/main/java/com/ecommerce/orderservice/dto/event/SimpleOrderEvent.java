package com.ecommerce.orderservice.dto.event;

import java.util.UUID;

public class SimpleOrderEvent {
    private UUID orderId;
    private UUID userId;

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
}
