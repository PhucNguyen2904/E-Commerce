package com.ecommerce.orderservice.client;

import com.ecommerce.orderservice.dto.CartResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.UUID;

@FeignClient(name = "cart-service", path = "/api/cart")
public interface CartClient {
    
    @GetMapping
    CartResponse getCart(@RequestHeader("X-User-Id") UUID userId);

    @DeleteMapping("/internal/{userId}")
    void clearCartInternal(@PathVariable("userId") UUID userId);
}
