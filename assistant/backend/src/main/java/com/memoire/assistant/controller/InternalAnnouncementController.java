package com.memoire.assistant.controller;

import com.memoire.assistant.dto.AnnouncementCreateRequest;
import com.memoire.assistant.model.InternalAnnouncement;
import com.memoire.assistant.security.TenantContext;
import com.memoire.assistant.service.InternalAnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal-announcements")
@Tag(name = "Internal Announcements", description = "API pour la gestion des annonces internes")
public class InternalAnnouncementController {
    
    @Autowired
    private InternalAnnouncementService announcementService;
    
    @PostMapping
    @Operation(summary = "Créer une annonce interne", description = "Crée une nouvelle annonce pour l'entreprise")
    public ResponseEntity<InternalAnnouncement> createAnnouncement(@Valid @RequestBody AnnouncementCreateRequest request) {
        try {
            UUID companyId = TenantContext.getCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            InternalAnnouncement announcement = announcementService.createAnnouncement(
                companyId,
                TenantContext.getUserId(),
                request.getTitle(),
                request.getContent(),
                request.getCategory(),
                request.getPriority(),
                request.getTargetAudience(),
                request.getExpiresAt(),
                request.getAttachmentPath(),
                request.getAttachmentName()
            );
            
            return ResponseEntity.ok(announcement);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Erreur lors de la création: " + e.getMessage());
        }
    }
    
    @GetMapping
    @Operation(summary = "Lister les annonces actives", description = "Retourne toutes les annonces actives pour l'entreprise")
    public ResponseEntity<List<InternalAnnouncement>> getActiveAnnouncements() {
        try {
            UUID companyId = TenantContext.getCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<InternalAnnouncement> announcements = announcementService.getActiveAnnouncements(companyId);
            
            // Filtrer selon le rôle de l'utilisateur
            String userRole = TenantContext.getRole();
            String userDepartment = TenantContext.getUserDepartment();
            List<InternalAnnouncement> filteredAnnouncements = announcements.stream()
                .filter(ann -> announcementService.isAnnouncementVisibleForUser(ann, userRole, userDepartment))
                .toList();
            
            return ResponseEntity.ok(filteredAnnouncements);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la récupération: " + e.getMessage());
        }
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "Lister les annonces par catégorie", description = "Retourne les annonces actives d'une catégorie")
    public ResponseEntity<List<InternalAnnouncement>> getAnnouncementsByCategory(
            @Parameter(description = "Catégorie de l'annonce") @PathVariable String category) {
        try {
            UUID companyId = TenantContext.getCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<InternalAnnouncement> announcements = announcementService.getAnnouncementsByCategory(companyId, category);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la récupération: " + e.getMessage());
        }
    }
    
    @GetMapping("/audience/{audience}")
    @Operation(summary = "Lister les annonces par audience", description = "Retourne les annonces pour une audience spécifique")
    public ResponseEntity<List<InternalAnnouncement>> getAnnouncementsByAudience(
            @Parameter(description = "Audience cible") @PathVariable String audience) {
        try {
            UUID companyId = TenantContext.getCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<InternalAnnouncement> announcements = announcementService.getAnnouncementsByAudience(companyId, audience);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la récupération: " + e.getMessage());
        }
    }
    
    @GetMapping("/all")
    @Operation(summary = "Lister toutes les annonces", description = "Retourne toutes les annonces (actives et inactives)")
    public ResponseEntity<List<InternalAnnouncement>> getAllAnnouncements() {
        try {
            UUID companyId = TenantContext.getCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<InternalAnnouncement> announcements = announcementService.getAllAnnouncements(companyId);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la récupération: " + e.getMessage());
        }
    }
    
    @PostMapping("/{announcementId}/read")
    @Operation(summary = "Marquer une annonce comme lue", description = "Incrémente le compteur de lecture")
    public ResponseEntity<String> markAsRead(@PathVariable UUID announcementId) {
        try {
            announcementService.incrementReadCount(announcementId);
            return ResponseEntity.ok("Annonce marquée comme lue");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Erreur lors du marquage: " + e.getMessage());
        }
    }
    
    @PutMapping("/{announcementId}/deactivate")
    @Operation(summary = "Désactiver une annonce", description = "Désactive une annonce (ne sera plus affichée)")
    public ResponseEntity<String> deactivateAnnouncement(@PathVariable UUID announcementId) {
        try {
            announcementService.deactivateAnnouncement(announcementId);
            return ResponseEntity.ok("Annonce désactivée avec succès");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Erreur lors de la désactivation: " + e.getMessage());
        }
    }
    
    @PostMapping("/cleanup-expired")
    @Operation(summary = "Nettoyer les annonces expirées", description = "Désactive automatiquement les annonces expirées")
    public ResponseEntity<String> cleanupExpiredAnnouncements() {
        try {
            announcementService.cleanupExpiredAnnouncements();
            return ResponseEntity.ok("Annonces expirées nettoyées avec succès");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors du nettoyage: " + e.getMessage());
        }
    }
}
