package com.ecommerce.paymentservice.gateway;

import com.ecommerce.paymentservice.domain.entity.Payment;

public interface PaymentGateway {
    boolean processPayment(Payment payment);
}
