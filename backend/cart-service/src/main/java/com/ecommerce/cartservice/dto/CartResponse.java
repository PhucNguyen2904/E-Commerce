package com.ecommerce.cartservice.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CartResponse {
    private UUID id;
    private UUID userId;
    private List<CartItemResponse> items;
    private BigDecimal totalPrice;
    private BigDecimal originalTotalPrice;
    private String discountCode;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getOriginalTotalPrice() { return originalTotalPrice; }
    public void setOriginalTotalPrice(BigDecimal originalTotalPrice) { this.originalTotalPrice = originalTotalPrice; }
    public String getDiscountCode() { return discountCode; }
    public void setDiscountCode(String discountCode) { this.discountCode = discountCode; }
}
