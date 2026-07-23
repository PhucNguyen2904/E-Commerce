package com.ecommerce.orderservice.controller;

import com.ecommerce.orderservice.dto.OrderRequest;
import com.ecommerce.orderservice.dto.OrderResponse;
import com.ecommerce.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(orderService.getOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String userRole) {
        return ResponseEntity.ok(orderService.getOrderById(id, userId, userRole));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        orderService.cancelOrder(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Void> payOrder(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        orderService.markOrderAsPaid(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrdersAdmin(
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new com.ecommerce.orderservice.exception.OrderException("FORBIDDEN", "Admin access required");
        }
        return ResponseEntity.ok(orderService.getAllOrdersAdmin());
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<OrderResponse> getOrderByIdAdmin(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new com.ecommerce.orderservice.exception.OrderException("FORBIDDEN", "Admin access required");
        }
        return ResponseEntity.ok(orderService.getOrderByIdAdmin(id));
    }

    @PutMapping("/admin/{id}/cancel")
    public ResponseEntity<Void> cancelOrderAdmin(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new com.ecommerce.orderservice.exception.OrderException("FORBIDDEN", "Admin access required");
        }
        orderService.cancelOrderAdmin(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteOrderAdmin(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new com.ecommerce.orderservice.exception.OrderException("FORBIDDEN", "Admin access required");
        }
        orderService.deleteOrderAdmin(id);
        return ResponseEntity.ok().build();
    }
}
