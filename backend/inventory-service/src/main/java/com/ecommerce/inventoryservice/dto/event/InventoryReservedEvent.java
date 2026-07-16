package com.ecommerce.inventoryservice.dto.event;

import java.util.UUID;

public class InventoryReservedEvent {
    private UUID orderId;

    public InventoryReservedEvent(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
}
