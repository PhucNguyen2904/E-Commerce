package com.ecommerce.orderservice.repository;

import com.ecommerce.orderservice.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Order> findByStatusAndCreatedAtBefore(com.ecommerce.orderservice.domain.enums.OrderStatus status, java.time.LocalDateTime time);
}
