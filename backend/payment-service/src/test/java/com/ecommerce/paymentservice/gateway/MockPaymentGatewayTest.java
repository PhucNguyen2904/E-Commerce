package com.ecommerce.paymentservice.gateway;

import com.ecommerce.paymentservice.domain.entity.Payment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MockPaymentGatewayTest {

    private MockPaymentGateway gateway;

    @BeforeEach
    void setUp() {
        gateway = new MockPaymentGateway();
    }

    @Test
    void processPayment_Success_WhenNotDivisibleBy13() {
        Payment payment = new Payment();
        payment.setOrderId(UUID.randomUUID());
        payment.setAmount(new BigDecimal("100.00")); // 100 % 13 != 0

        assertTrue(gateway.processPayment(payment));
    }

    @Test
    void processPayment_Failure_WhenDivisibleBy13() {
        Payment payment = new Payment();
        payment.setOrderId(UUID.randomUUID());
        payment.setAmount(new BigDecimal("130.00")); // 130 % 13 == 0

        assertFalse(gateway.processPayment(payment));
    }
}
