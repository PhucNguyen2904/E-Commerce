package com.ecommerce.paymentservice.gateway;

import com.ecommerce.paymentservice.domain.entity.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MockPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentGateway.class);

    @Override
    public boolean processPayment(Payment payment) {
        log.info("Processing mock payment for order {} with amount {}", payment.getOrderId(), payment.getAmount());
        
        // Mock rule: If amount is divisible by 13, fail the payment.
        BigDecimal[] result = payment.getAmount().divideAndRemainder(new BigDecimal("13"));
        if (result[1].compareTo(BigDecimal.ZERO) == 0) {
            log.warn("Mock payment failed for order {} due to amount {} divisible by 13", payment.getOrderId(), payment.getAmount());
            return false;
        }

        log.info("Mock payment successful for order {}", payment.getOrderId());
        return true;
    }
}
