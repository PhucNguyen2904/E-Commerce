package com.ecommerce.productservice.service;

import com.ecommerce.productservice.domain.entity.Category;
import com.ecommerce.productservice.domain.entity.Product;
import com.ecommerce.productservice.dto.PageResponse;
import com.ecommerce.productservice.dto.ProductRequest;
import com.ecommerce.productservice.dto.ProductResponse;
import com.ecommerce.productservice.exception.ProductException;
import com.ecommerce.productservice.repository.CategoryRepository;
import com.ecommerce.productservice.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductEventPublisher productEventPublisher;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, ProductEventPublisher productEventPublisher) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productEventPublisher = productEventPublisher;
    }

    @Cacheable(value = "products", key = "#categoryId + '-' + #keyword + '-' + #gender + '-' + #isSale + '-' + #page + '-' + #size")
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(UUID categoryId, String keyword, String gender, Boolean isSale, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.searchProducts(categoryId, keyword, gender, isSale, pageable);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductByIdentifier(String identifier) {
        Product product;
        try {
            UUID id = UUID.fromString(identifier);
            product = productRepository.findByIdAndIsActiveTrue(id)
                    .orElseThrow(() -> new ProductException("PRODUCT_NOT_FOUND", "Product not found or inactive"));
        } catch (IllegalArgumentException e) {
            product = productRepository.findBySlugAndIsActiveTrue(identifier)
                    .orElseThrow(() -> new ProductException("PRODUCT_NOT_FOUND", "Product not found or inactive"));
        }
        return mapToResponse(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new ProductException("SLUG_ALREADY_EXISTS", "Product slug already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ProductException("CATEGORY_NOT_FOUND", "Category not found"));

        Product product = new Product();
        updateProductFromRequest(product, request, category);

        Product savedProduct = productRepository.save(product);
        productEventPublisher.publishProductCreatedEvent(savedProduct);
        return mapToResponse(savedProduct);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductException("PRODUCT_NOT_FOUND", "Product not found"));

        if (!product.getSlug().equals(request.getSlug()) && productRepository.existsBySlug(request.getSlug())) {
            throw new ProductException("SLUG_ALREADY_EXISTS", "Product slug already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ProductException("CATEGORY_NOT_FOUND", "Category not found"));

        updateProductFromRequest(product, request, category);
        
        Product updatedProduct = productRepository.save(product);
        productEventPublisher.publishProductUpdatedEvent(updatedProduct);
        return mapToResponse(updatedProduct);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductException("PRODUCT_NOT_FOUND", "Product not found"));
        product.setActive(false);
        productRepository.save(product);
        productEventPublisher.publishProductDeletedEvent(id);
    }

    private void updateProductFromRequest(Product product, ProductRequest request, Category category) {
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setGender(request.getGender());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscountPercentage(request.getDiscountPercentage());
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getImageUrl(),
                product.getGender(),
                product.getOriginalPrice(),
                product.getDiscountPercentage(),
                product.isActive()
        );
    }
}
