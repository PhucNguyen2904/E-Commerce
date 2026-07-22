package com.ecommerce.searchservice.dto;

import com.ecommerce.searchservice.domain.document.ProductDocument;
import java.util.List;

public class SearchResponse {
    private List<ProductDocument> items;
    private long totalElements;
    private int totalPages;
    private List<CategoryFacet> categoryFacets;

    public SearchResponse() {}

    public SearchResponse(List<ProductDocument> items, long totalElements, int totalPages, List<CategoryFacet> categoryFacets) {
        this.items = items;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.categoryFacets = categoryFacets;
    }

    public List<ProductDocument> getItems() { return items; }
    public void setItems(List<ProductDocument> items) { this.items = items; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public List<CategoryFacet> getCategoryFacets() { return categoryFacets; }
    public void setCategoryFacets(List<CategoryFacet> categoryFacets) { this.categoryFacets = categoryFacets; }
}
