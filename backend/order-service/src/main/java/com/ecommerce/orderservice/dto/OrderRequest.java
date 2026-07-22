package com.ecommerce.orderservice.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String paymentMethod = "COD";

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
