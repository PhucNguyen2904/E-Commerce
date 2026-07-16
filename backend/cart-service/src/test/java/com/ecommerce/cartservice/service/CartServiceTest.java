package com.ecommerce.cartservice.service;

import com.ecommerce.cartservice.client.InventoryClient;
import com.ecommerce.cartservice.client.ProductClient;
import com.ecommerce.cartservice.domain.entity.Cart;
import com.ecommerce.cartservice.domain.entity.CartItem;
import com.ecommerce.cartservice.dto.CartItemRequest;
import com.ecommerce.cartservice.dto.CartResponse;
import com.ecommerce.cartservice.dto.ProductResponse;
import com.ecommerce.cartservice.exception.CartException;
import com.ecommerce.cartservice.repository.CartItemRepository;
import com.ecommerce.cartservice.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductClient productClient;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private CartService cartService;

    private UUID userId;
    private UUID productId;
    private Cart cart;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
        cart = new Cart(userId);
        cart.setId(UUID.randomUUID());
        cart.setItems(new ArrayList<>());
    }

    @Test
    void testAddItemToCart_InsufficientStock() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(productId);
        request.setQuantity(5);

        when(inventoryClient.checkAvailability(eq(productId), any())).thenReturn(false);

        CartException exception = assertThrows(CartException.class, () -> cartService.addItemToCart(userId, request));
        assertEquals("INSUFFICIENT_STOCK", exception.getCode());
    }

    @Test
    void testAddItemToCart_SumQuantity() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(productId);
        request.setQuantity(2);

        CartItem existingItem = new CartItem(cart, productId, 3);
        cart.getItems().add(existingItem);

        when(inventoryClient.checkAvailability(eq(productId), any())).thenReturn(true);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)).thenReturn(Optional.of(existingItem));
        
        ProductResponse mockProduct = new ProductResponse();
        mockProduct.setName("Test Product");
        mockProduct.setPrice(BigDecimal.TEN);
        when(productClient.getProductById(productId)).thenReturn(mockProduct);

        CartResponse response = cartService.addItemToCart(userId, request);

        assertEquals(5, existingItem.getQuantity());
        verify(cartItemRepository).save(existingItem);
        assertEquals(1, response.getItems().size());
        assertEquals(5, response.getItems().get(0).getQuantity());
    }

    @Test
    void testGetProductFallback() {
        ProductResponse response = cartService.getProductFallback(productId, new RuntimeException("Service down"));
        assertEquals("Product Unavailable", response.getName());
        assertEquals(BigDecimal.ZERO, response.getPrice());
    }
}
