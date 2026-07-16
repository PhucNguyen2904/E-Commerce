package com.ecommerce.productservice.dto;

import java.util.List;
import java.util.UUID;

public class CategoryResponse {
    private UUID id;
    private String name;
    private String slug;
    private List<CategoryResponse> children;

    public CategoryResponse(UUID id, String name, String slug, List<CategoryResponse> children) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.children = children;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public List<CategoryResponse> getChildren() { return children; }
}
