package com.ecommerce.searchservice.client;

import com.ecommerce.searchservice.dto.PageResponse;
import com.ecommerce.searchservice.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service", path = "/api/products")
public interface ProductServiceClient {

    @GetMapping
    PageResponse<ProductResponse> getProducts(
            @RequestParam("page") int page,
            @RequestParam("size") int size
    );
}
