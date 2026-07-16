package com.ecommerce.cartservice.exception;

public class CartException extends RuntimeException {
    private final String code;

    public CartException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
