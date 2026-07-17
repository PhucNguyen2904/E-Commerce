package com.ecommerce.notificationservice.repository;

import com.ecommerce.notificationservice.domain.entity.NotificationLog;
import com.ecommerce.notificationservice.domain.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
    boolean existsByOrderIdAndType(UUID orderId, NotificationType type);
}
