package com.ecommerce.searchservice.repository;

import com.ecommerce.searchservice.domain.document.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
}
