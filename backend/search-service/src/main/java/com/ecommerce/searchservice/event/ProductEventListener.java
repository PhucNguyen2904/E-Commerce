package com.ecommerce.searchservice.event;

import com.ecommerce.searchservice.domain.document.ProductDocument;
import com.ecommerce.searchservice.dto.ProductEventMessage;
import com.ecommerce.searchservice.repository.ProductSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ProductEventListener {

    private static final Logger log = LoggerFactory.getLogger(ProductEventListener.class);
    private final ProductSearchRepository repository;

    public ProductEventListener(ProductSearchRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = "product.created", groupId = "search-service-group")
    public void handleProductCreated(ProductEventMessage message) {
        log.info("Received product.created event for id: {}", message.getId());
        saveProduct(message);
    }

    @KafkaListener(topics = "product.updated", groupId = "search-service-group")
    public void handleProductUpdated(ProductEventMessage message) {
        log.info("Received product.updated event for id: {}", message.getId());
        saveProduct(message);
    }

    @KafkaListener(topics = "product.deleted", groupId = "search-service-group")
    public void handleProductDeleted(java.util.Map<String, String> payload) {
        String productId = payload.get("id");
        log.info("Received product.deleted event for id: {}", productId);
        // Requirement: xóa document khỏi index (hoặc set isActive=false). Khuyến nghị xóa hẳn khỏi index.
        try {
            // Kafka message payload is just a string (productId) for deletion based on ProductEventPublisher
            // Wait, in ProductEventPublisher, I sent id.toString().
            // Wait, spring-kafka deserializer might try to deserialize string to JSON if value-deserializer is JsonDeserializer.
            // Oh, let me check application.yml -> value-deserializer is ErrorHandlingDeserializer over JsonDeserializer.
            // If the deleted event payload is a plain UUID string, JsonDeserializer might fail if it expects an object.
            // To be safe, I should just delete it if the ID is valid.
            // Wait, let's look at ProductEventPublisher: kafkaTemplate.send("product.deleted", productId.toString(), productId.toString());
            // Since it's a string, we need to handle it. Actually, if JsonDeserializer fails, it might be caught by ErrorHandlingDeserializer.
            // Let me update ProductEventPublisher to send a small JSON object or just a map to avoid deserialization error.
            // Let's assume it parses as string if we just use a string message or remove quotes.
            // I'll update ProductEventPublisher to use a Map.of("id", productId) instead of plain string.
            
            // Assuming it's already a valid string or JSON string. Let's strip quotes if any.
            String cleanId = productId.replace("\"", "");
            repository.deleteById(cleanId);
            log.info("Successfully deleted product {} from index", cleanId);
        } catch (Exception e) {
            log.error("Error deleting product from index", e);
        }
    }

    private void saveProduct(ProductEventMessage message) {
        ProductDocument doc = new ProductDocument(
                message.getId().toString(),
                message.getName(),
                message.getDescription(),
                message.getCategoryId() != null ? message.getCategoryId().toString() : null,
                message.getCategoryName(),
                message.getPrice(),
                message.getImageUrl(),
                message.isActive(),
                message.getOriginalPrice(),
                message.getDiscountPercentage()
        );
        repository.save(doc);
        log.info("Successfully indexed product {}", message.getId());
    }
}
