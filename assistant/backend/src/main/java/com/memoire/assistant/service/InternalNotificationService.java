package com.memoire.assistant.service;

import com.memoire.assistant.model.InternalNotification;
import com.memoire.assistant.repository.InternalNotificationRepository;
import com.memoire.assistant.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class InternalNotificationService {

    @Autowired
    private InternalNotificationRepository repository;

    /**
     * Crée une notification in-app pour un utilisateur donné.
     * Appelé par CommentService (MENTION), TaskService (TASK_ASSIGNED), DecisionService (DECISION_NEEDED).
     */
    public void notify(UUID targetUserId, UUID companyId, InternalNotification.Type type,
                       String title, String message, String referenceType, UUID referenceId) {
        InternalNotification n = new InternalNotification();
        n.setUserId(targetUserId);
        n.setCompanyId(companyId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setReferenceType(referenceType);
        n.setReferenceId(referenceId);
        repository.save(n);
    }

    public List<Map<String, Object>> getMyNotifications() {
        UUID userId = TenantContext.getRecruiterId() != null
                ? TenantContext.getRecruiterId()
                : TenantContext.getUserId();
        UUID companyId = TenantContext.getCompanyId();

        return repository
                .findByUserIdAndCompanyIdOrderByCreatedAtDesc(userId, companyId)
                .stream()
                .map(n -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", n.getId().toString());
                    m.put("type", n.getType().name());
                    m.put("title", n.getTitle());
                    m.put("message", n.getMessage());
                    m.put("read", n.getReadAt() != null);
                    m.put("referenceType", n.getReferenceType());
                    m.put("referenceId", n.getReferenceId() != null ? n.getReferenceId().toString() : null);
                    m.put("createdAt", n.getCreatedAt().toString());
                    return m;
                })
                .toList();
    }

    public long getUnreadCount() {
        UUID userId = TenantContext.getRecruiterId() != null
                ? TenantContext.getRecruiterId()
                : TenantContext.getUserId();
        UUID companyId = TenantContext.getCompanyId();
        return repository.countByUserIdAndCompanyIdAndReadAtIsNull(userId, companyId);
    }

    public void markAsRead(UUID notificationId) {
        repository.findById(notificationId).ifPresent(n -> {
            n.setReadAt(LocalDateTime.now());
            repository.save(n);
        });
    }

    public void markAllAsRead() {
        UUID userId = TenantContext.getRecruiterId() != null
                ? TenantContext.getRecruiterId()
                : TenantContext.getUserId();
        UUID companyId = TenantContext.getCompanyId();
        repository.findByUserIdAndCompanyIdOrderByCreatedAtDesc(userId, companyId)
                .stream()
                .filter(n -> n.getReadAt() == null)
                .forEach(n -> {
                    n.setReadAt(LocalDateTime.now());
                    repository.save(n);
                });
    }
}
