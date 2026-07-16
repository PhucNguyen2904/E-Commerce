package com.ecommerce.inventoryservice.dto;

import java.util.UUID;

public class InventoryResponse {
    private UUID productId;
    private int quantityAvailable;
    private int quantityReserved;

    public InventoryResponse(UUID productId, int quantityAvailable, int quantityReserved) {
        this.productId = productId;
        this.quantityAvailable = quantityAvailable;
        this.quantityReserved = quantityReserved;
    }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public int getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(int quantityAvailable) { this.quantityAvailable = quantityAvailable; }
    public int getQuantityReserved() { return quantityReserved; }
    public void setQuantityReserved(int quantityReserved) { this.quantityReserved = quantityReserved; }
}
