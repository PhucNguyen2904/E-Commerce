package com.ecommerce.searchservice.controller;

import com.ecommerce.searchservice.dto.SearchResponse;
import com.ecommerce.searchservice.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/products")
    public ResponseEntity<SearchResponse> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean isSale,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(searchService.searchProducts(q, categoryId, minPrice, maxPrice, isSale, page, size));
    }

    @PostMapping("/admin/reindex")
    public ResponseEntity<Map<String, Object>> reindexAll() {
        long count = searchService.reindexAll();
        return ResponseEntity.ok(Collections.singletonMap("indexedCount", count));
    }
}
