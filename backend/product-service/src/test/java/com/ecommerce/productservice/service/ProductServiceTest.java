package com.ecommerce.productservice.service;

import com.ecommerce.productservice.domain.entity.Category;
import com.ecommerce.productservice.domain.entity.Product;
import com.ecommerce.productservice.dto.ProductRequest;
import com.ecommerce.productservice.exception.ProductException;
import com.ecommerce.productservice.repository.CategoryRepository;
import com.ecommerce.productservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private ProductRequest request;
    private UUID categoryId;

    @BeforeEach
    void setUp() {
        categoryId = UUID.randomUUID();
        request = new ProductRequest();
        request.setName("Test Product");
        request.setSlug("test-product");
        request.setPrice(new BigDecimal("100.00"));
        request.setCategoryId(categoryId);
    }

    @Test
    void testCreateProduct_CategoryNotFound() {
        when(productRepository.existsBySlug(request.getSlug())).thenReturn(false);
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        ProductException exception = assertThrows(ProductException.class, () -> productService.createProduct(request));
        assertEquals("CATEGORY_NOT_FOUND", exception.getCode());
    }

    @Test
    void testCreateProduct_SlugAlreadyExists() {
        when(productRepository.existsBySlug(request.getSlug())).thenReturn(true);

        ProductException exception = assertThrows(ProductException.class, () -> productService.createProduct(request));
        assertEquals("SLUG_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void testUpdateProduct_ProductNotFound() {
        UUID productId = UUID.randomUUID();
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        ProductException exception = assertThrows(ProductException.class, () -> productService.updateProduct(productId, request));
        assertEquals("PRODUCT_NOT_FOUND", exception.getCode());
    }
}
