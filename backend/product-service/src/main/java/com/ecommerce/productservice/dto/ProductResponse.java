package com.ecommerce.productservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class ProductResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private UUID categoryId;
    private String categoryName;
    private String imageUrl;
    private boolean isActive;

    public ProductResponse(UUID id, String name, String slug, String description, BigDecimal price, UUID categoryId, String categoryName, String imageUrl, boolean isActive) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public UUID getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return isActive; }
}
