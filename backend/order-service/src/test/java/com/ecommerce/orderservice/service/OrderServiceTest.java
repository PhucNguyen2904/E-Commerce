package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.client.CartClient;
import com.ecommerce.orderservice.client.ProductClient;
import com.ecommerce.orderservice.domain.entity.Order;
import com.ecommerce.orderservice.domain.enums.OrderStatus;
import com.ecommerce.orderservice.dto.CartItemResponse;
import com.ecommerce.orderservice.dto.CartResponse;
import com.ecommerce.orderservice.dto.OrderRequest;
import com.ecommerce.orderservice.dto.OrderResponse;
import com.ecommerce.orderservice.dto.ProductResponse;
import com.ecommerce.orderservice.exception.OrderException;
import com.ecommerce.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartClient cartClient;

    @Mock
    private ProductClient productClient;

    @Mock
    private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private OrderService orderService;

    private UUID userId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
    }

    @Test
    void testCreateOrder_EmptyCart() {
        OrderRequest request = new OrderRequest();
        request.setShippingAddress("123 Street");

        when(cartClient.getCart(userId)).thenReturn(new CartResponse());

        OrderException exception = assertThrows(OrderException.class, () -> orderService.createOrder(userId, request));
        assertEquals("CART_EMPTY", exception.getCode());
    }

    @Test
    void testCreateOrder_Success() {
        OrderRequest request = new OrderRequest();
        request.setShippingAddress("123 Street");

        CartResponse cartResponse = new CartResponse();
        CartItemResponse item = new CartItemResponse();
        item.setProductId(productId);
        item.setQuantity(2);
        cartResponse.setItems(Collections.singletonList(item));

        when(cartClient.getCart(userId)).thenReturn(cartResponse);

        ProductResponse product = new ProductResponse();
        product.setName("Test Product");
        product.setPrice(new BigDecimal("100.00"));
        when(productClient.getProductById(productId)).thenReturn(product);

        Order savedOrder = new Order();
        savedOrder.setId(UUID.randomUUID());
        savedOrder.setUserId(userId);
        savedOrder.setStatus(OrderStatus.PENDING);
        savedOrder.setTotalAmount(new BigDecimal("200.00"));
        
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        OrderResponse response = orderService.createOrder(userId, request);

        assertNotNull(response);
        assertEquals(OrderStatus.PENDING, response.getStatus());
        verify(kafkaProducerService, times(1)).sendOrderCreated(any());
    }

    @Test
    void testHandleInventoryReservationFailed() {
        UUID orderId = UUID.randomUUID();
        Order order = new Order();
        order.setId(orderId);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        orderService.handleInventoryReservationFailed(orderId, "Out of stock");

        assertEquals(OrderStatus.FAILED, order.getStatus());
        verify(orderRepository).save(order);
    }
}
