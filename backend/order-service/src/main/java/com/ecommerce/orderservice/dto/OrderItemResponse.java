package com.ecommerce.orderservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemResponse {
    private UUID productId;
    private String productName;
    private BigDecimal unitPrice;
    private int quantity;

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
