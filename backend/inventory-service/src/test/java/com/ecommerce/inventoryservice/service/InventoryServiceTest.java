package com.ecommerce.inventoryservice.service;

import com.ecommerce.inventoryservice.domain.entity.Inventory;
import com.ecommerce.inventoryservice.dto.event.OrderCreatedEvent;
import com.ecommerce.inventoryservice.exception.InventoryException;
import com.ecommerce.inventoryservice.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID productId;
    private OrderCreatedEvent event;
    private OrderCreatedEvent.OrderItem item;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        event = new OrderCreatedEvent();
        event.setOrderId(UUID.randomUUID());
        
        item = new OrderCreatedEvent.OrderItem();
        item.setProductId(productId);
        item.setQuantity(2);
        
        event.setItems(List.of(item));
    }

    @Test
    void testReserveInventory_Success() {
        Inventory inventory = new Inventory(productId, 10);
        when(inventoryRepository.findByProductIdWithLock(productId)).thenReturn(Optional.of(inventory));

        inventoryService.reserveInventory(event);

        assertEquals(2, inventory.getQuantityReserved());
        verify(inventoryRepository, times(1)).save(inventory);
    }

    @Test
    void testReserveInventory_InsufficientStock() {
        Inventory inventory = new Inventory(productId, 1);
        when(inventoryRepository.findByProductIdWithLock(productId)).thenReturn(Optional.of(inventory));

        InventoryException exception = assertThrows(InventoryException.class, () -> inventoryService.reserveInventory(event));
        assertEquals("INSUFFICIENT_STOCK", exception.getCode());
        verify(inventoryRepository, never()).save(any());
    }

    @Test
    void testReserveInventory_ProductNotFound() {
        when(inventoryRepository.findByProductIdWithLock(productId)).thenReturn(Optional.empty());

        InventoryException exception = assertThrows(InventoryException.class, () -> inventoryService.reserveInventory(event));
        assertEquals("INVENTORY_NOT_FOUND", exception.getCode());
        verify(inventoryRepository, never()).save(any());
    }
}
