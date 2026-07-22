package com.ecommerce.productservice.service;

import com.ecommerce.productservice.domain.entity.Product;
import com.ecommerce.productservice.dto.ProductEventMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ProductEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ProductEventPublisher.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ProductEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishProductCreatedEvent(Product product) {
        ProductEventMessage message = mapToMessage(product);
        kafkaTemplate.send("product.created", message.getId().toString(), message);
        log.info("Published product.created event for product: {}", message.getId());
    }

    public void publishProductUpdatedEvent(Product product) {
        ProductEventMessage message = mapToMessage(product);
        kafkaTemplate.send("product.updated", message.getId().toString(), message);
        log.info("Published product.updated event for product: {}", message.getId());
    }

    public void publishProductDeletedEvent(UUID productId) {
        kafkaTemplate.send("product.deleted", productId.toString(), java.util.Collections.singletonMap("id", productId.toString()));
        log.info("Published product.deleted event for product: {}", productId);
    }

    private ProductEventMessage mapToMessage(Product product) {
        return new ProductEventMessage(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getPrice(),
                product.getImageUrl(),
                product.isActive(),
                product.getOriginalPrice(),
                product.getDiscountPercentage()
        );
    }
}
