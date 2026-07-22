package com.ecommerce.searchservice.dto;

public class CategoryFacet {
    private String categoryId;
    private String categoryName;
    private long count;

    public CategoryFacet() {}

    public CategoryFacet(String categoryId, String categoryName, long count) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.count = count;
    }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
