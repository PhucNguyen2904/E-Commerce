package com.ecommerce.productservice.repository;

import com.ecommerce.productservice.domain.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIsNull();
    boolean existsBySlug(String slug);
}
