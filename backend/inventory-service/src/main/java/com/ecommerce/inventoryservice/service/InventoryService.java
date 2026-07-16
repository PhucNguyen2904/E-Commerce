package com.ecommerce.inventoryservice.service;

import com.ecommerce.inventoryservice.domain.entity.Inventory;
import com.ecommerce.inventoryservice.dto.CheckAvailabilityRequest;
import com.ecommerce.inventoryservice.dto.InventoryRequest;
import com.ecommerce.inventoryservice.dto.InventoryResponse;
import com.ecommerce.inventoryservice.dto.event.OrderCreatedEvent;
import com.ecommerce.inventoryservice.dto.event.OrderEvent;
import com.ecommerce.inventoryservice.exception.InventoryException;
import com.ecommerce.inventoryservice.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);
    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventory(UUID productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryException("INVENTORY_NOT_FOUND", "Inventory not found for product"));
        return new InventoryResponse(inventory.getProductId(), inventory.getQuantityAvailable(), inventory.getQuantityReserved());
    }

    @Transactional
    public InventoryResponse updateInventory(UUID productId, InventoryRequest request) {
        Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
                .orElseGet(() -> new Inventory(productId, 0));
        
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);
        return new InventoryResponse(saved.getProductId(), saved.getQuantityAvailable(), saved.getQuantityReserved());
    }

    @Transactional(readOnly = true)
    public boolean checkAvailability(UUID productId, CheckAvailabilityRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryException("INVENTORY_NOT_FOUND", "Inventory not found for product"));
        
        int available = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
        return available >= request.getQuantity();
    }

    @Transactional
    public void reserveInventory(OrderCreatedEvent event) {
        log.info("Processing reservation for order: {}", event.getOrderId());
        
        for (OrderCreatedEvent.OrderItem item : event.getItems()) {
            Inventory inventory = inventoryRepository.findByProductIdWithLock(item.getProductId())
                    .orElseThrow(() -> new InventoryException("INVENTORY_NOT_FOUND", "Product " + item.getProductId() + " not found in inventory"));
            
            int availableToReserve = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
            if (availableToReserve < item.getQuantity()) {
                throw new InventoryException("INSUFFICIENT_STOCK", "Not enough stock for product: " + item.getProductId());
            }
            
            inventory.setQuantityReserved(inventory.getQuantityReserved() + item.getQuantity());
            inventoryRepository.save(inventory);
        }
    }

    @Transactional
    public void releaseReservation(OrderEvent event) {
        log.info("Releasing reservation for order: {}", event.getOrderId());
        
        for (OrderEvent.OrderItem item : event.getItems()) {
            Inventory inventory = inventoryRepository.findByProductIdWithLock(item.getProductId())
                    .orElseThrow(() -> new InventoryException("INVENTORY_NOT_FOUND", "Product " + item.getProductId() + " not found in inventory"));
            
            inventory.setQuantityReserved(inventory.getQuantityReserved() - item.getQuantity());
            inventoryRepository.save(inventory);
        }
    }

    @Transactional
    public void commitReservation(OrderEvent event) {
        log.info("Committing reservation (deducting stock) for order: {}", event.getOrderId());
        
        for (OrderEvent.OrderItem item : event.getItems()) {
            Inventory inventory = inventoryRepository.findByProductIdWithLock(item.getProductId())
                    .orElseThrow(() -> new InventoryException("INVENTORY_NOT_FOUND", "Product " + item.getProductId() + " not found in inventory"));
            
            inventory.setQuantityAvailable(inventory.getQuantityAvailable() - item.getQuantity());
            inventory.setQuantityReserved(inventory.getQuantityReserved() - item.getQuantity());
            inventoryRepository.save(inventory);
        }
    }
}
