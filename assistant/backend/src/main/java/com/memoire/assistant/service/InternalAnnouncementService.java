package com.memoire.assistant.service;

import com.memoire.assistant.model.InternalAnnouncement;
import com.memoire.assistant.repository.InternalAnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InternalAnnouncementService {
    
    @Autowired
    private InternalAnnouncementRepository announcementRepository;
    
    /**
     * Créer une nouvelle annonce interne
     */
    public InternalAnnouncement createAnnouncement(UUID companyId, UUID authorId, String title, String content, 
                                              String category, String priority, String targetAudience, 
                                              LocalDateTime expiresAt, String attachmentPath, String attachmentName) {
        InternalAnnouncement announcement = new InternalAnnouncement();
        // Company et Author seront settés par le contrôleur
        
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setCategory(category);
        announcement.setPriority(priority);
        announcement.setTargetAudience(targetAudience);
        announcement.setExpiresAt(expiresAt);
        announcement.setAttachmentPath(attachmentPath);
        announcement.setAttachmentName(attachmentName);
        
        return announcementRepository.save(announcement);
    }
    
    /**
     * Obtenir toutes les annonces actives pour une entreprise
     */
    public List<InternalAnnouncement> getActiveAnnouncements(UUID companyId) {
        return announcementRepository.findActiveAnnouncementsByCompany(companyId, LocalDateTime.now());
    }
    
    /**
     * Obtenir les annonces par catégorie pour une entreprise
     */
    public List<InternalAnnouncement> getAnnouncementsByCategory(UUID companyId, String category) {
        return announcementRepository.findActiveAnnouncementsByCategoryAndCompany(category, companyId);
    }
    
    /**
     * Obtenir les annonces par audience pour une entreprise
     */
    public List<InternalAnnouncement> getAnnouncementsByAudience(UUID companyId, String audience) {
        return announcementRepository.findAnnouncementsByAudienceAndCompany(audience, companyId);
    }
    
    /**
     * Obtenir toutes les annonces pour une entreprise
     */
    public List<InternalAnnouncement> getAllAnnouncements(UUID companyId) {
        return announcementRepository.findByCompany_CompanyIdOrderByCreatedAtDesc(companyId);
    }
    
    /**
     * Mettre à jour le compteur de lecture
     */
    public void incrementReadCount(UUID announcementId) {
        InternalAnnouncement announcement = announcementRepository.findById(announcementId)
            .orElseThrow(() -> new IllegalArgumentException("Annonce non trouvée: " + announcementId));
        announcement.setReadCount(announcement.getReadCount() + 1);
        announcementRepository.save(announcement);
    }
    
    /**
     * Désactiver une annonce
     */
    public void deactivateAnnouncement(UUID announcementId) {
        InternalAnnouncement announcement = announcementRepository.findById(announcementId)
            .orElseThrow(() -> new IllegalArgumentException("Annonce non trouvée: " + announcementId));
        announcement.setIsActive(false);
        announcementRepository.save(announcement);
    }
    
    /**
     * Nettoyer les annonces expirées
     */
    public void cleanupExpiredAnnouncements() {
        List<InternalAnnouncement> expiredAnnouncements = announcementRepository.findExpiredAnnouncements(LocalDateTime.now());
        for (InternalAnnouncement announcement : expiredAnnouncements) {
            announcement.setIsActive(false);
            announcementRepository.save(announcement);
        }
    }
    
    /**
     * Compter les annonces actives pour une entreprise
     */
    public long countActiveAnnouncements(UUID companyId) {
        return announcementRepository.countActiveAnnouncementsByCompany(companyId, LocalDateTime.now());
    }
    
    /**
     * Vérifier si une annonce est visible pour un utilisateur donné
     */
    public boolean isAnnouncementVisibleForUser(InternalAnnouncement announcement, String userRole, String userDepartment) {
        // Vérifier si l'annonce est active et non expirée
        if (!announcement.getIsActive() || 
            (announcement.getExpiresAt() != null && announcement.getExpiresAt().isBefore(LocalDateTime.now()))) {
            return false;
        }
        
        // Vérifier l'audience
        String targetAudience = announcement.getTargetAudience();
        if ("ALL".equals(targetAudience)) {
            return true;
        }
        
        if ("RECRUITERS".equals(targetAudience) && "RECRUITER".equals(userRole)) {
            return true;
        }
        
        if ("MANAGEMENT".equals(targetAudience) && ("ADMIN".equals(userRole) || "HIRING_MANAGER".equals(userRole))) {
            return true;
        }
        
        if ("TECHNICAL".equals(targetAudience) && ("TECHNICAL".equals(userRole) || "CANDIDATE".equals(userRole))) {
            return true;
        }
        
        return false;
    }
}
