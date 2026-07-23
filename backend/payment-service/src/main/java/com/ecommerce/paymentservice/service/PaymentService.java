package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.config.VnPayConfig;
import com.ecommerce.paymentservice.domain.entity.Payment;
import com.ecommerce.paymentservice.domain.enums.PaymentMethod;
import com.ecommerce.paymentservice.domain.enums.PaymentStatus;
import com.ecommerce.paymentservice.dto.PaymentResponse;
import com.ecommerce.paymentservice.dto.event.PaymentRequestedEvent;
import com.ecommerce.paymentservice.dto.event.SimpleOrderEvent;
import com.ecommerce.paymentservice.exception.PaymentException;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.ecommerce.paymentservice.util.VnPayUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final KafkaProducerService kafkaProducerService;
    private final VnPayConfig vnPayConfig;
    
    @Value("${payment.provider:mock}")
    private String paymentProvider;

    public PaymentService(PaymentRepository paymentRepository, 
                          KafkaProducerService kafkaProducerService, 
                          VnPayConfig vnPayConfig) {
        this.paymentRepository = paymentRepository;
        this.kafkaProducerService = kafkaProducerService;
        this.vnPayConfig = vnPayConfig;
    }

    @Transactional
    public void processPaymentRequest(PaymentRequestedEvent event) {
        UUID orderId = event.getOrderId();
        
        // Idempotency check
        if (paymentRepository.existsByOrderId(orderId)) {
            log.info("Payment for order {} has already been processed or is pending. Skipping.", orderId);
            return;
        }

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(event.getUserId());
        payment.setAmount(event.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        
        payment.setMethod(PaymentMethod.VNPAY);
        payment.setProvider("VNPAY");
        String txnRef = orderId.toString().substring(0, 8) + "_" + System.currentTimeMillis();
        payment.setProviderTxnRef(txnRef);
        paymentRepository.save(payment);
        log.info("Created PENDING payment for VNPay. txnRef: {}", txnRef);
    }

    @Transactional(readOnly = true)
    public String getVnPayUrl(UUID orderId, UUID userId, String ipAddress) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentException("PAYMENT_NOT_FOUND", "No payment found for this order"));

        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException("FORBIDDEN", "You do not have permission for this payment");
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new PaymentException("ALREADY_PAID", "Order is already paid");
        }

        if (payment.getStatus() != PaymentStatus.PENDING || !"VNPAY".equals(payment.getProvider())) {
            throw new PaymentException("INVALID_STATE", "Payment is not in a valid state for VNPay URL generation");
        }

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.getVersion());
        vnp_Params.put("vnp_Command", vnPayConfig.getCommand());
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        
        // VNPay amount is multiplied by 100
        long amount = payment.getAmount().multiply(new BigDecimal(100)).longValue();
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        
        vnp_Params.put("vnp_CurrCode", vnPayConfig.getCurrCode());
        vnp_Params.put("vnp_TxnRef", payment.getProviderTxnRef());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", vnPayConfig.getLocale());
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", ipAddress);
        
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", now.format(formatter));
        vnp_Params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        String queryUrl = VnPayUtil.buildQueryUrl(vnp_Params, vnPayConfig.getHashSecret());
        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }

    @Transactional
    public Map<String, String> processIpn(Map<String, String> params) {
        Map<String, String> result = new HashMap<>();
        
        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String computedHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), VnPayUtil.buildQueryUrl(params, vnPayConfig.getHashSecret()).split("&vnp_SecureHash=")[0]);
        
        if (!computedHash.equals(vnp_SecureHash)) {
            result.put("RspCode", "97");
            result.put("Message", "Invalid signature");
            return result;
        }

        String txnRef = params.get("vnp_TxnRef");
        Payment payment = paymentRepository.findByProviderTxnRef(txnRef).orElse(null);

        if (payment == null) {
            result.put("RspCode", "01");
            result.put("Message", "Order not found");
            return result;
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            result.put("RspCode", "02");
            result.put("Message", "Order already confirmed");
            return result;
        }

        long amountRequested = payment.getAmount().multiply(new BigDecimal(100)).longValue();
        long amountReceived = Long.parseLong(params.get("vnp_Amount"));
        if (amountRequested != amountReceived) {
            result.put("RspCode", "04");
            result.put("Message", "Invalid amount");
            return result;
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setProviderTransactionNo(params.get("vnp_TransactionNo"));
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            kafkaProducerService.sendPaymentCompleted(new SimpleOrderEvent(payment.getOrderId()));
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("VNPay code: " + responseCode);
            paymentRepository.save(payment);
            kafkaProducerService.sendPaymentFailed(new SimpleOrderEvent(payment.getOrderId()));
        }

        result.put("RspCode", "00");
        result.put("Message", "Confirm Success");
        return result;
    }

    @Transactional(readOnly = true)
    public String getOrderIdByTxnRef(String txnRef) {
        return paymentRepository.findByProviderTxnRef(txnRef)
                .map(payment -> payment.getOrderId().toString())
                .orElse(txnRef);
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
