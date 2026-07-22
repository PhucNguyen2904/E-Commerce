package com.ecommerce.searchservice.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.ecommerce.searchservice.client.ProductServiceClient;
import com.ecommerce.searchservice.domain.document.ProductDocument;
import com.ecommerce.searchservice.dto.CategoryFacet;
import com.ecommerce.searchservice.dto.PageResponse;
import com.ecommerce.searchservice.dto.ProductResponse;
import com.ecommerce.searchservice.dto.SearchResponse;
import com.ecommerce.searchservice.repository.ProductSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);
    private final ElasticsearchClient elasticsearchClient;
    private final ProductSearchRepository productSearchRepository;
    private final ProductServiceClient productServiceClient;

    public SearchService(ElasticsearchClient elasticsearchClient, ProductSearchRepository productSearchRepository, ProductServiceClient productServiceClient) {
        this.elasticsearchClient = elasticsearchClient;
        this.productSearchRepository = productSearchRepository;
        this.productServiceClient = productServiceClient;
    }

    public SearchResponse searchProducts(String query, String categoryId, Double minPrice, Double maxPrice, Boolean isSale, int page, int size) {
        try {
            co.elastic.clients.elasticsearch.core.SearchResponse<ProductDocument> response = elasticsearchClient.search(s -> {
                s.index("products")
                 .from(page * size)
                 .size(size)
                 .query(q -> q.bool(b -> {
                     b.filter(f -> f.term(t -> t.field("isActive").value(true)));

                     if (categoryId != null && !categoryId.trim().isEmpty()) {
                         b.filter(f -> f.term(t -> t.field("categoryId").value(categoryId)));
                     }

                     if (Boolean.TRUE.equals(isSale)) {
                         b.filter(f -> f.range(r -> r.field("discountPercentage").gt(co.elastic.clients.json.JsonData.of(0))));
                     }

                     if (minPrice != null || maxPrice != null) {
                         b.filter(f -> f.range(r -> {
                             r.field("price");
                             if (minPrice != null) {
                                 r.gte(co.elastic.clients.json.JsonData.of(minPrice));
                             }
                             if (maxPrice != null) {
                                 r.lte(co.elastic.clients.json.JsonData.of(maxPrice));
                             }
                             return r;
                         }));
                     }

                     if (query != null && !query.trim().isEmpty()) {
                         b.must(m -> m.multiMatch(mm -> mm
                                 .query(query)
                                 .fields("name^3", "description^1")
                                 .fuzziness("AUTO")
                         ));
                     }

                     return b;
                 }))
                 .aggregations("categories", a -> a.terms(t -> t.field("categoryId").size(100)));

                return s;
            }, ProductDocument.class);

            List<ProductDocument> items = response.hits().hits().stream()
                    .map(Hit::source)
                    .collect(Collectors.toList());

            List<CategoryFacet> facets = new ArrayList<>();
            co.elastic.clients.elasticsearch._types.aggregations.Aggregate categoriesAgg = response.aggregations().get("categories");
            if (categoriesAgg != null && categoriesAgg.isSterms()) {
                for (co.elastic.clients.elasticsearch._types.aggregations.StringTermsBucket bucket : categoriesAgg.sterms().buckets().array()) {
                    String id = bucket.key().stringValue();
                    long count = bucket.docCount();
                    String name = id;
                    for (ProductDocument item : items) {
                        if (id.equals(item.getCategoryId())) {
                            name = item.getCategoryName();
                            break;
                        }
                    }
                    facets.add(new CategoryFacet(id, name, count));
                }
            }

            long totalElements = response.hits().total() != null ? response.hits().total().value() : 0;
            int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;

            return new SearchResponse(items, totalElements, totalPages, facets);

        } catch (IOException e) {
            log.error("Elasticsearch query failed", e);
            throw new RuntimeException("Search failed", e);
        }
    }

    public long reindexAll() {
        log.info("Starting reindex all products from Product Service");
        productSearchRepository.deleteAll();

        int page = 0;
        int size = 100;
        long indexedCount = 0;

        while (true) {
            PageResponse<ProductResponse> response = productServiceClient.getProducts(page, size);
            if (response.getContent().isEmpty()) {
                break;
            }

            List<ProductDocument> documents = response.getContent().stream()
                    .map(p -> new ProductDocument(
                            p.getId().toString(),
                            p.getName(),
                            p.getDescription(),
                            p.getCategoryId() != null ? p.getCategoryId().toString() : null,
                            p.getCategoryName(),
                            p.getPrice(),
                            p.getImageUrl(),
                            p.isActive(),
                            p.getOriginalPrice(),
                            p.getDiscountPercentage()
                    ))
                    .collect(Collectors.toList());

            productSearchRepository.saveAll(documents);
            indexedCount += documents.size();
            log.info("Indexed {} products, page {}", indexedCount, page);

            if (page >= response.getTotalPages() - 1) {
                break;
            }
            page++;
        }

        log.info("Completed reindexing {} products", indexedCount);
        return indexedCount;
    }
}
