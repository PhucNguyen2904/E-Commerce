package com.ecommerce.cartservice.dto;

public class CheckAvailabilityRequest {
    private int quantity;

    public CheckAvailabilityRequest(int quantity) {
        this.quantity = quantity;
    }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
