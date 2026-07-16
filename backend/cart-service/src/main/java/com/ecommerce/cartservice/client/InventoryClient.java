package com.ecommerce.cartservice.client;

import com.ecommerce.cartservice.dto.CheckAvailabilityRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "inventory-service", path = "/api/inventory")
public interface InventoryClient {

    @PostMapping("/{productId}/check")
    Boolean checkAvailability(@PathVariable("productId") UUID productId, @RequestBody CheckAvailabilityRequest request);
}
