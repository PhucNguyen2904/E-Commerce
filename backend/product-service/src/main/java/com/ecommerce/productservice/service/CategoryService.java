package com.ecommerce.productservice.service;

import com.ecommerce.productservice.domain.entity.Category;
import com.ecommerce.productservice.dto.CategoryRequest;
import com.ecommerce.productservice.dto.CategoryResponse;
import com.ecommerce.productservice.exception.ProductException;
import com.ecommerce.productservice.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        List<Category> topLevelCategories = categoryRepository.findByParentIsNull();
        return topLevelCategories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new ProductException("SLUG_ALREADY_EXISTS", "Category slug already exists");
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ProductException("CATEGORY_NOT_FOUND", "Parent category not found"));
        }

        Category category = new Category(request.getName(), request.getSlug(), parent);
        Category savedCategory = categoryRepository.save(category);
        return mapToResponse(savedCategory);
    }

    private CategoryResponse mapToResponse(Category category) {
        List<CategoryResponse> children = null;
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            children = category.getChildren().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug(), children);
    }
}
