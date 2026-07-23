package com.ecommerce.paymentservice.controller;

import com.ecommerce.paymentservice.dto.PaymentResponse;
import com.ecommerce.paymentservice.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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

    @GetMapping("/order/{orderId}/vnpay-url")
    public ResponseEntity<Map<String, String>> getVnPayUrl(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Id") UUID userId,
            jakarta.servlet.http.HttpServletRequest request) {
        
        // Simple way to get IP, might need refinement behind proxies
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        
        String url = paymentService.getVnPayUrl(orderId, userId, ipAddress);
        return ResponseEntity.ok(java.util.Map.of("paymentUrl", url));
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Map<String, String>> vnpayReturn(@RequestParam Map<String, String> params) {
        try {
            paymentService.processIpn(new java.util.HashMap<>(params));
        } catch (Exception e) {
            // Ignore error so return URL still loads properly
        }
        
        String txnRef = params.getOrDefault("vnp_TxnRef", "");
        String orderId = paymentService.getOrderIdByTxnRef(txnRef);
        return ResponseEntity.ok(java.util.Map.of(
            "vnp_ResponseCode", params.getOrDefault("vnp_ResponseCode", ""),
            "vnp_TransactionStatus", params.getOrDefault("vnp_TransactionStatus", ""),
            "vnp_TxnRef", txnRef,
            "orderId", orderId
        ));
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(paymentService.processIpn(params));
    }
}
