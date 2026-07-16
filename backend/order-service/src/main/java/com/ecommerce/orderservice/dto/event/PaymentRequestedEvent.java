package com.ecommerce.orderservice.dto.event;

import java.math.BigDecimal;
import java.util.UUID;

public class PaymentRequestedEvent {
    private UUID orderId;
    private UUID userId;
    private BigDecimal totalAmount;

    public PaymentRequestedEvent(UUID orderId, UUID userId, BigDecimal totalAmount) {
        this.orderId = orderId;
        this.userId = userId;
        this.totalAmount = totalAmount;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}
