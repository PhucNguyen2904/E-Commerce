package com.ecommerce.chatbotservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "search-service", path = "/api/search")
public interface SearchClient {

    @GetMapping("/products")
    Object searchProducts(@RequestParam(value = "q", required = false) String query,
                          @RequestParam(value = "categoryId", required = false) String categoryId,
                          @RequestParam(value = "maxPrice", required = false) Double maxPrice,
                          @RequestParam(value = "size", defaultValue = "5") int size);
}
