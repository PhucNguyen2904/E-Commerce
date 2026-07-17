package com.ecommerce.notificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "auth-service", path = "/api/auth")
public interface AuthClient {
    
    @GetMapping("/internal/users/{id}")
    UserResponse getInternalUserById(@PathVariable("id") UUID id);
}
