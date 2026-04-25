package com.memoire.assistant.repository;

import com.memoire.assistant.model.InternalAnnouncement;
import com.memoire.assistant.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface InternalAnnouncementRepository extends JpaRepository<InternalAnnouncement, UUID> {
    
    List<InternalAnnouncement> findByCompany_CompanyIdOrderByCreatedAtDesc(UUID companyId);
    
    @Query("SELECT a FROM InternalAnnouncement a WHERE a.company.companyId = :companyId AND a.isActive = true AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.priority DESC, a.createdAt DESC")
    List<InternalAnnouncement> findActiveAnnouncementsByCompany(@Param("companyId") UUID companyId, @Param("now") LocalDateTime now);
    
    List<InternalAnnouncement> findByCategory(String category);
    
    List<InternalAnnouncement> findByPriority(String priority);
    
    @Query("SELECT a FROM InternalAnnouncement a WHERE a.category = :category AND a.company.companyId = :companyId AND a.isActive = true ORDER BY a.createdAt DESC")
    List<InternalAnnouncement> findActiveAnnouncementsByCategoryAndCompany(@Param("category") String category, @Param("companyId") UUID companyId);
    
    @Query("SELECT a FROM InternalAnnouncement a WHERE a.targetAudience = :audience OR a.targetAudience = 'ALL' AND a.company.companyId = :companyId AND a.isActive = true ORDER BY a.priority DESC, a.createdAt DESC")
    List<InternalAnnouncement> findAnnouncementsByAudienceAndCompany(@Param("audience") String audience, @Param("companyId") UUID companyId);
    
    @Query("SELECT a FROM InternalAnnouncement a WHERE a.expiresAt < :now AND a.isActive = true")
    List<InternalAnnouncement> findExpiredAnnouncements(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(a) FROM InternalAnnouncement a WHERE a.company.companyId = :companyId AND a.isActive = true AND (a.expiresAt IS NULL OR a.expiresAt > :now)")
    Long countActiveAnnouncementsByCompany(@Param("companyId") UUID companyId, @Param("now") LocalDateTime now);
}
