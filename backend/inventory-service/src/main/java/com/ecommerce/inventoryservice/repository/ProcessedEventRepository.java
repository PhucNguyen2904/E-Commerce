package com.ecommerce.inventoryservice.repository;

import com.ecommerce.inventoryservice.domain.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, String> {
}
