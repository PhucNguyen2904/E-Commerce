package com.ecommerce.inventoryservice.controller;

import com.ecommerce.inventoryservice.dto.CheckAvailabilityRequest;
import com.ecommerce.inventoryservice.dto.InventoryRequest;
import com.ecommerce.inventoryservice.dto.InventoryResponse;
import com.ecommerce.inventoryservice.interceptor.RequireRole;
import com.ecommerce.inventoryservice.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getInventory(productId));
    }

    @PutMapping("/{productId}")
    @RequireRole("ADMIN")
    public ResponseEntity<InventoryResponse> updateInventory(
            @PathVariable UUID productId,
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(productId, request));
    }

    @PostMapping("/{productId}/check")
    public ResponseEntity<Boolean> checkAvailability(
            @PathVariable UUID productId,
            @Valid @RequestBody CheckAvailabilityRequest request) {
        return ResponseEntity.ok(inventoryService.checkAvailability(productId, request));
    }
}
