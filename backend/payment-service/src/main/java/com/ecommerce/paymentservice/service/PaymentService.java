package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.domain.entity.Payment;
import com.ecommerce.paymentservice.domain.enums.PaymentMethod;
import com.ecommerce.paymentservice.domain.enums.PaymentStatus;
import com.ecommerce.paymentservice.dto.PaymentResponse;
import com.ecommerce.paymentservice.dto.event.PaymentRequestedEvent;
import com.ecommerce.paymentservice.dto.event.SimpleOrderEvent;
import com.ecommerce.paymentservice.exception.PaymentException;
import com.ecommerce.paymentservice.gateway.PaymentGateway;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final PaymentGateway paymentGateway;
    private final KafkaProducerService kafkaProducerService;

    public PaymentService(PaymentRepository paymentRepository, PaymentGateway paymentGateway, KafkaProducerService kafkaProducerService) {
        this.paymentRepository = paymentRepository;
        this.paymentGateway = paymentGateway;
        this.kafkaProducerService = kafkaProducerService;
    }

    @Transactional
    public void processPaymentRequest(PaymentRequestedEvent event) {
        UUID orderId = event.getOrderId();
        
        // Idempotency check: Ensure we haven't already processed this order's payment
        if (paymentRepository.existsByOrderId(orderId)) {
            log.info("Payment for order {} has already been processed or is pending. Skipping.", orderId);
            return;
        }

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(event.getUserId());
        payment.setAmount(event.getTotalAmount());
        payment.setMethod(PaymentMethod.MOCK_GATEWAY);
        payment.setStatus(PaymentStatus.PENDING);
        
        payment = paymentRepository.save(payment);
        
        boolean success = paymentGateway.processPayment(payment);
        
        if (success) {
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);
            kafkaProducerService.sendPaymentCompleted(new SimpleOrderEvent(orderId));
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Mock gateway rejected payment due to amount rule");
            paymentRepository.save(payment);
            kafkaProducerService.sendPaymentFailed(new SimpleOrderEvent(orderId));
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(UUID orderId, UUID userId, String role) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentException("PAYMENT_NOT_FOUND", "No payment found for this order"));

        if (!"ADMIN".equals(role) && !payment.getUserId().equals(userId)) {
            throw new PaymentException("FORBIDDEN", "You do not have permission to view this payment");
        }

        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setOrderId(payment.getOrderId());
        response.setUserId(payment.getUserId());
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus());
        response.setMethod(payment.getMethod());
        response.setFailureReason(payment.getFailureReason());
        response.setCreatedAt(payment.getCreatedAt());

        return response;
    }
}
