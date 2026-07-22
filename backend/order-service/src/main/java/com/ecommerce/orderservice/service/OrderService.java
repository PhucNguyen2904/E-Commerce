package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.client.CartClient;
import com.ecommerce.orderservice.client.ProductClient;
import com.ecommerce.orderservice.domain.entity.Order;
import com.ecommerce.orderservice.domain.entity.OrderItem;
import com.ecommerce.orderservice.domain.enums.OrderStatus;
import com.ecommerce.orderservice.dto.*;
import com.ecommerce.orderservice.dto.event.*;
import com.ecommerce.orderservice.exception.OrderException;
import com.ecommerce.orderservice.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final KafkaProducerService kafkaProducerService;

    public OrderService(OrderRepository orderRepository, CartClient cartClient, ProductClient productClient, KafkaProducerService kafkaProducerService) {
        this.orderRepository = orderRepository;
        this.cartClient = cartClient;
        this.productClient = productClient;
        this.kafkaProducerService = kafkaProducerService;
    }

    @Transactional
    public OrderResponse createOrder(UUID userId, OrderRequest request) {
        CartResponse cartResponse = getCartWithCircuitBreaker(userId);
        
        if (cartResponse == null || cartResponse.getItems() == null || cartResponse.getItems().isEmpty()) {
            throw new OrderException("CART_EMPTY", "Cannot create order from an empty cart");
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("PENDING");
        order.setStatus(OrderStatus.PENDING);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemResponse cartItem : cartResponse.getItems()) {
            // Fetch live product price (snapshot)
            ProductResponse product = getProductWithCircuitBreaker(cartItem.getProductId());
            if (product == null) {
                throw new OrderException("PRODUCT_UNAVAILABLE", "Product " + cartItem.getProductId() + " is currently unavailable");
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            
            orderItems.add(orderItem);
            
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        
        Order savedOrder = orderRepository.save(order);

        // Prepare and send Kafka event
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(savedOrder.getId());
        event.setUserId(userId);
        event.setTotalAmount(totalAmount);
        
        List<OrderCreatedEvent.OrderItem> eventItems = orderItems.stream()
                .map(item -> new OrderCreatedEvent.OrderItem(item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());
        event.setItems(eventItems);
        
        kafkaProducerService.sendOrderCreated(event);

        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id, UUID userId, String userRole) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderException("ORDER_NOT_FOUND", "Order not found"));
        
        if (!"ADMIN".equals(userRole) && !order.getUserId().equals(userId)) {
            throw new OrderException("FORBIDDEN", "You do not have permission to view this order");
        }
        
        return mapToOrderResponse(order);
    }

    @Transactional
    public void cancelOrder(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderException("ORDER_NOT_FOUND", "Order not found"));
        
        if (!order.getUserId().equals(userId)) {
            throw new OrderException("FORBIDDEN", "You do not have permission to cancel this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new OrderException("INVALID_STATE", "Only PENDING orders can be manually cancelled");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional
    public void markOrderAsPaid(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderException("ORDER_NOT_FOUND", "Order not found"));
        
        if (!order.getUserId().equals(userId)) {
            throw new OrderException("FORBIDDEN", "You do not have permission to modify this order");
        }
        
        order.setPaymentStatus("PAID");
        orderRepository.save(order);
    }

    // Saga Handlers
    @Transactional
    public void handleInventoryReserved(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.INVENTORY_RESERVED);
            orderRepository.save(order);
            
            PaymentRequestedEvent event = new PaymentRequestedEvent(orderId, order.getUserId(), order.getTotalAmount());
            kafkaProducerService.sendPaymentRequested(event);
        }
    }

    @Transactional
    public void handleInventoryReservationFailed(UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.FAILED);
            log.warn("Order {} failed due to inventory: {}", orderId, reason);
            orderRepository.save(order);
        }
    }

    @Transactional
    public void handlePaymentCompleted(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null && order.getStatus() == OrderStatus.INVENTORY_RESERVED) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            
            // Clear cart internal
            try {
                cartClient.clearCartInternal(order.getUserId());
            } catch (Exception e) {
                log.error("Failed to clear cart for user {} after order {}. It should be handled or retried.", order.getUserId(), orderId);
            }
            
            SimpleOrderEvent event = new SimpleOrderEvent();
            event.setOrderId(orderId);
            event.setUserId(order.getUserId());
            kafkaProducerService.sendOrderConfirmed(event);
        }
    }

    @Transactional
    public void handlePaymentFailed(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null && order.getStatus() == OrderStatus.INVENTORY_RESERVED) {
            order.setStatus(OrderStatus.FAILED);
            orderRepository.save(order);
            
            OrderEvent event = new OrderEvent();
            event.setOrderId(orderId);
            event.setUserId(order.getUserId());
            List<OrderEvent.OrderItem> eventItems = order.getItems().stream()
                .map(item -> new OrderEvent.OrderItem(item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());
            event.setItems(eventItems);
            
            kafkaProducerService.sendOrderCancelled(event);
        }
    }

    // Circuit Breakers
    @CircuitBreaker(name = "cartService", fallbackMethod = "getCartFallback")
    public CartResponse getCartWithCircuitBreaker(UUID userId) {
        return cartClient.getCart(userId);
    }

    public CartResponse getCartFallback(UUID userId, Throwable t) {
        log.error("Cart service failed for user {}: {}", userId, t.getMessage());
        throw new OrderException("CART_SERVICE_DOWN", "Unable to fetch cart to create order");
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "getProductFallback")
    public ProductResponse getProductWithCircuitBreaker(UUID productId) {
        return productClient.getProductById(productId);
    }

    public ProductResponse getProductFallback(UUID productId, Throwable t) {
        log.error("Product service failed for product {}: {}", productId, t.getMessage());
        return null; // Let the main method throw PRODUCT_UNAVAILABLE
    }

    // Mapping
    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUserId());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setShippingAddress(order.getShippingAddress());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        
        if ("VNPAY".equals(order.getPaymentMethod()) && "PENDING".equals(order.getPaymentStatus())) {
            response.setPaymentUrl("/payment/" + order.getId());
        }
        
        response.setCreatedAt(order.getCreatedAt());
        
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderItemResponse ir = new OrderItemResponse();
            ir.setProductId(item.getProductId());
            ir.setProductName(item.getProductName());
            ir.setUnitPrice(item.getUnitPrice());
            ir.setQuantity(item.getQuantity());
            return ir;
        }).collect(Collectors.toList());
        
        response.setItems(itemResponses);
        return response;
    }
}
