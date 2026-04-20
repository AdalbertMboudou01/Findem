package com.memoire.assistant.service;

import com.memoire.assistant.dto.ApplicationSummaryDTO;
import com.memoire.assistant.model.*;
import com.memoire.assistant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FilteringEngineService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private ApplicationSummaryRepository applicationSummaryRepository;
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    public List<ApplicationSummaryDTO> filterApplications(UUID jobId, FilteringCriteria criteria) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Offre non trouvée"));
        
        List<Application> applications = applicationRepository.findByJob_JobId(jobId);
        
        return applications.stream()
            .map(app -> {
                ApplicationSummary summary = applicationSummaryRepository.findByApplication_ApplicationId(app.getApplicationId()).orElse(null);
                if (summary == null) {
                    // Générer la synthèse si elle n'existe pas
                    summary = generateSummaryForApplication(app.getApplicationId());
                }
                return applyFilters(summary, app, criteria);
            })
            .filter(summary -> summary != null)
            .collect(Collectors.toList());
    }
    
    private ApplicationSummary generateSummaryForApplication(UUID applicationId) {
        // Pour éviter la dépendance circulaire, on crée une synthèse basique ici
        // En production, il faudrait revoir l'architecture pour éviter ce problème
        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) return null;
        
        ApplicationSummary summary = new ApplicationSummary(application);
        summary.setMotivationLevel("MEDIUM");
        summary.setTechnicalProfile("MEDIUM");
        summary.setExperienceLevel("JUNIOR");
        summary.setRecommendedAction("REVIEW");
        summary.setSummaryText("Synthèse générée automatiquement");
        
        return applicationSummaryRepository.save(summary);
    }
    
    private ApplicationSummaryDTO applyFilters(ApplicationSummary summary, Application application, FilteringCriteria criteria) {
        ApplicationSummaryDTO dto = convertToDTO(summary);
        
        // Appliquer les filtres de critères bloquants
        if (criteria.getBlockingCriteria() != null && !criteria.getBlockingCriteria().isEmpty()) {
            for (String blockingCriterion : criteria.getBlockingCriteria()) {
                if (!passesBlockingCriterion(summary, application, blockingCriterion)) {
                    return null; // Exclure cette application
                }
            }
        }
        
        // Appliquer les filtres de pertinence
        if (criteria.getMinMotivationLevel() != null) {
            if (!meetsMinimumLevel(summary.getMotivationLevel(), criteria.getMinMotivationLevel())) {
                return null;
            }
        }
        
        if (criteria.getMinTechnicalLevel() != null) {
            if (!meetsMinimumLevel(summary.getTechnicalProfile(), criteria.getMinTechnicalLevel())) {
                return null;
            }
        }
        
        if (criteria.getExperienceLevel() != null) {
            if (!criteria.getExperienceLevel().equals(summary.getExperienceLevel())) {
                return null;
            }
        }
        
        if (criteria.getLocationMatch() != null) {
            if (!criteria.getLocationMatch().equals(summary.getLocationMatch())) {
                return null;
            }
        }
        
        if (criteria.getRecommendedAction() != null) {
            if (!criteria.getRecommendedAction().equals(summary.getRecommendedAction())) {
                return null;
            }
        }
        
        return dto;
    }
    
    private boolean passesBlockingCriterion(ApplicationSummary summary, Application application, String criterion) {
        switch (criterion) {
            case "DISPONIBILITY":
                return summary.getAvailabilityStatus() != null && 
                       !"NON_SPECIFIE".equals(summary.getAvailabilityStatus());
                       
            case "LOCATION":
                return "PERFECT".equals(summary.getLocationMatch()) || 
                       "REMOTE_COMPATIBLE".equals(summary.getLocationMatch());
                       
            case "CONSENT":
                return application.getCandidate().getConsent() != null && 
                       application.getCandidate().getConsent();
                       
            case "COMPLETE_ANSWERS":
                return summary.getMotivationLevel() != null && 
                       summary.getTechnicalProfile() != null;
                       
            default:
                return true;
        }
    }
    
    private boolean meetsMinimumLevel(String currentLevel, String minimumLevel) {
        if (currentLevel == null || minimumLevel == null) return false;
        
        // Hiérarchie des niveaux
        int currentScore = getLevelScore(currentLevel);
        int minimumScore = getLevelScore(minimumLevel);
        
        return currentScore >= minimumScore;
    }
    
    private int getLevelScore(String level) {
        switch (level) {
            case "HIGH":
            case "STRONG":
                return 3;
            case "MEDIUM":
                return 2;
            case "LOW":
            case "WEAK":
                return 1;
            default:
                return 0;
        }
    }
    
    private ApplicationSummaryDTO convertToDTO(ApplicationSummary summary) {
        if (summary == null) return null;
        
        ApplicationSummaryDTO dto = new ApplicationSummaryDTO();
        dto.setSummaryId(summary.getSummaryId());
        dto.setApplicationId(summary.getApplication().getApplicationId());
        dto.setMotivationLevel(summary.getMotivationLevel());
        dto.setTechnicalProfile(summary.getTechnicalProfile());
        dto.setExperienceLevel(summary.getExperienceLevel());
        dto.setKeySkills(summary.getKeySkills());
        dto.setProjectHighlights(summary.getProjectHighlights());
        dto.setAvailabilityStatus(summary.getAvailabilityStatus());
        dto.setLocationMatch(summary.getLocationMatch());
        dto.setRecommendedAction(summary.getRecommendedAction());
        dto.setSummaryText(summary.getSummaryText());
        dto.setBlockingCriteria(summary.getBlockingCriteria());
        dto.setPositivePoints(summary.getPositivePoints());
        dto.setConcerns(summary.getConcerns());
        dto.setGeneratedAt(summary.getGeneratedAt().toString());
        dto.setGeneratedBy(summary.getGeneratedBy());
        
        return dto;
    }
    
    public static class FilteringCriteria {
        private List<String> blockingCriteria;
        private String minMotivationLevel;
        private String minTechnicalLevel;
        private String experienceLevel;
        private String locationMatch;
        private String recommendedAction;
        
        // Constructors
        public FilteringCriteria() {}
        
        // Getters & Setters
        public List<String> getBlockingCriteria() {
            return blockingCriteria;
        }
        
        public void setBlockingCriteria(List<String> blockingCriteria) {
            this.blockingCriteria = blockingCriteria;
        }
        
        public String getMinMotivationLevel() {
            return minMotivationLevel;
        }
        
        public void setMinMotivationLevel(String minMotivationLevel) {
            this.minMotivationLevel = minMotivationLevel;
        }
        
        public String getMinTechnicalLevel() {
            return minTechnicalLevel;
        }
        
        public void setMinTechnicalLevel(String minTechnicalLevel) {
            this.minTechnicalLevel = minTechnicalLevel;
        }
        
        public String getExperienceLevel() {
            return experienceLevel;
        }
        
        public void setExperienceLevel(String experienceLevel) {
            this.experienceLevel = experienceLevel;
        }
        
        public String getLocationMatch() {
            return locationMatch;
        }
        
        public void setLocationMatch(String locationMatch) {
            this.locationMatch = locationMatch;
        }
        
        public String getRecommendedAction() {
            return recommendedAction;
        }
        
        public void setRecommendedAction(String recommendedAction) {
            this.recommendedAction = recommendedAction;
        }
    }
}
