package com.ecommerce.paymentservice.controller;

import com.ecommerce.paymentservice.dto.PaymentResponse;
import com.ecommerce.paymentservice.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "CUSTOMER") String role) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId, userId, role));
    }
}
