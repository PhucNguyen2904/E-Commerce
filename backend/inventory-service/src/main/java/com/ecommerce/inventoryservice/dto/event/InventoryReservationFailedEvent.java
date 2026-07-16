package com.ecommerce.inventoryservice.dto.event;

import java.util.UUID;

public class InventoryReservationFailedEvent {
    private UUID orderId;
    private String reason;

    public InventoryReservationFailedEvent(UUID orderId, String reason) {
        this.orderId = orderId;
        this.reason = reason;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
