package com.ecommerce.cartservice.service;

import com.ecommerce.cartservice.client.InventoryClient;
import com.ecommerce.cartservice.client.ProductClient;
import com.ecommerce.cartservice.domain.entity.Cart;
import com.ecommerce.cartservice.domain.entity.CartItem;
import com.ecommerce.cartservice.dto.*;
import com.ecommerce.cartservice.exception.CartException;
import com.ecommerce.cartservice.repository.CartItemRepository;
import com.ecommerce.cartservice.repository.CartRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       ProductClient productClient, InventoryClient inventoryClient) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> new Cart(userId));

        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());

        BigDecimal totalPrice = itemResponses.stream()
                .map(item -> item.getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUserId());
        response.setItems(itemResponses);
        response.setTotalPrice(totalPrice);

        return response;
    }

    @Transactional
    public CartResponse addItemToCart(UUID userId, CartItemRequest request) {
        checkInventory(request.getProductId(), request.getQuantity());

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(new Cart(userId)));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            
            // Check inventory again for the combined quantity
            checkInventory(request.getProductId(), newQuantity);
            
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem(cart, request.getProductId(), request.getQuantity());
            cart.getItems().add(newItem);
            cartRepository.save(cart);
        }

        return getCart(userId);
    }

    @Transactional
    public CartResponse updateItemQuantity(UUID userId, UUID productId, CartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartException("CART_NOT_FOUND", "Cart not found for user"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new CartException("ITEM_NOT_FOUND", "Item not found in cart"));

        checkInventory(productId, request.getQuantity());

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return getCart(userId);
    }

    @Transactional
    public CartResponse removeItemFromCart(UUID userId, UUID productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartException("CART_NOT_FOUND", "Cart not found for user"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new CartException("ITEM_NOT_FOUND", "Item not found in cart"));

        cartItemRepository.delete(item);

        return getCart(userId);
    }

    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartException("CART_NOT_FOUND", "Cart not found for user"));
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private void checkInventory(UUID productId, int quantity) {
        try {
            Boolean isAvailable = inventoryClient.checkAvailability(productId, new CheckAvailabilityRequest(quantity));
            if (isAvailable == null || !isAvailable) {
                throw new CartException("INSUFFICIENT_STOCK", "Product is out of stock or insufficient quantity");
            }
        } catch (CartException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error checking inventory for product {}: {}", productId, e.getMessage());
            throw new CartException("INVENTORY_CHECK_FAILED", "Failed to check inventory. Product might be unavailable.");
        }
    }

    private CartItemResponse mapToItemResponse(CartItem item) {
        ProductResponse product = getProductWithFallback(item.getProductId());
        
        CartItemResponse response = new CartItemResponse();
        response.setProductId(item.getProductId());
        response.setQuantity(item.getQuantity());
        response.setProductName(product.getName());
        response.setProductPrice(product.getPrice());
        response.setImageUrl(product.getImageUrl());
        return response;
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "getProductFallback")
    public ProductResponse getProductWithFallback(UUID productId) {
        return productClient.getProductById(productId);
    }

    public ProductResponse getProductFallback(UUID productId, Throwable t) {
        log.warn("Product service is down or failed for product {}: {}", productId, t.getMessage());
        ProductResponse response = new ProductResponse();
        response.setName("Product Unavailable");
        response.setPrice(BigDecimal.ZERO);
        return response;
    }
}
