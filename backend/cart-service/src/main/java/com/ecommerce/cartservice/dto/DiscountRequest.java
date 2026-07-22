package com.ecommerce.cartservice.dto;

import jakarta.validation.constraints.NotNull;

public class DiscountRequest {
    private String discountCode;

    public String getDiscountCode() {
        return discountCode;
    }

    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }
}
