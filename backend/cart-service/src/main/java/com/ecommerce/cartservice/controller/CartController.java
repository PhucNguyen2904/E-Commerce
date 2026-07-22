package com.ecommerce.cartservice.controller;

import com.ecommerce.cartservice.dto.CartItemRequest;
import com.ecommerce.cartservice.dto.CartResponse;
import com.ecommerce.cartservice.dto.DiscountRequest;
import com.ecommerce.cartservice.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItemToCart(userId, request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID productId,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, productId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID productId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, productId));
    }

    @PostMapping("/discount")
    public ResponseEntity<CartResponse> applyDiscount(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody DiscountRequest request) {
        return ResponseEntity.ok(cartService.applyDiscount(userId, request.getDiscountCode()));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestHeader("X-User-Id") UUID userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/internal/{userId}")
    public ResponseEntity<Void> clearCartInternal(@PathVariable UUID userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
