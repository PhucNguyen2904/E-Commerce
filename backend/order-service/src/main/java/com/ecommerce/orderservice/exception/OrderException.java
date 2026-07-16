package com.ecommerce.orderservice.exception;

public class OrderException extends RuntimeException {
    private final String code;

    public OrderException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
