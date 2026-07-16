package com.ecommerce.productservice.exception;

public class ProductException extends RuntimeException {
    private final String code;

    public ProductException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
