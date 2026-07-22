package com.ecommerce.chatbotservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "order-service", path = "/api/orders")
public interface OrderClient {

    @GetMapping
    Object getMyOrders(@RequestHeader("X-User-Id") String userId);

    @GetMapping("/{orderId}")
    Object getOrderById(@PathVariable("orderId") String orderId, @RequestHeader("X-User-Id") String userId);
}
