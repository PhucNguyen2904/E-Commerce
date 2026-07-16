package com.ecommerce.orderservice.domain.enums;

public enum OrderStatus {
    PENDING,
    INVENTORY_RESERVED,
    PAYMENT_COMPLETED,
    CONFIRMED,
    CANCELLED,
    FAILED
}
