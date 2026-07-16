package com.ecommerce.orderservice.dto;

import java.util.List;

public class CartResponse {
    private List<CartItemResponse> items;

    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
}
