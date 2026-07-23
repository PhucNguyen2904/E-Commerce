package com.ecommerce.orderservice.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String fullName;
    private String phone;

    private String paymentMethod = "COD";

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
