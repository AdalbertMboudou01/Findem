package com.memoire.assistant.service;

import com.memoire.assistant.dto.ApplicationSummaryDTO;
import com.memoire.assistant.dto.ChatAnswerAnalysisDTO;
import com.memoire.assistant.dto.FilteringCriteria;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.ApplicationSummary;
import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.model.CVAnalysis;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.ApplicationRepository;
import com.memoire.assistant.repository.ApplicationSummaryRepository;
import com.memoire.assistant.repository.CandidateRepository;
import com.memoire.assistant.repository.CVAnalysisRepository;
import com.memoire.assistant.repository.JobRepository;
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
    
    @Autowired
    private ChatAnswerService chatAnswerService;
    
    @Autowired
    private CVAnalysisService cvAnalysisService;
    
    @Autowired
    private CVAnalysisRepository cvAnalysisRepository;
    
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
        try {
            Application application = applicationRepository.findById(applicationId).orElse(null);
            if (application == null) return null;
            
            ApplicationSummary summary = new ApplicationSummary(application);
            
            // Analyser les réponses du chatbot
            var chatAnalysis = chatAnswerService.analyzeChatAnswers(applicationId);
            
            // Analyser le CV si disponible
            CVAnalysis cvAnalysis = cvAnalysisRepository.findByApplication_ApplicationId(applicationId).orElse(null);
            
            // Combiner les analyses pour une évaluation complète
            String combinedTechnicalLevel = determineCombinedTechnicalLevel(chatAnalysis, cvAnalysis);
            String combinedExperienceLevel = determineCombinedExperienceLevel(chatAnalysis, cvAnalysis);
            String recommendedAction = determineRecommendedAction(chatAnalysis, cvAnalysis);
            
            // Utiliser les résultats de l'analyse combinée
            summary.setMotivationLevel(chatAnalysis.getMotivationLevel());
            summary.setTechnicalProfile(combinedTechnicalLevel);
            summary.setExperienceLevel(combinedExperienceLevel);
            summary.setRecommendedAction(recommendedAction);
            
            // Enrichir avec les données CV si disponibles
            if (cvAnalysis != null) {
                enrichSummaryWithCVData(summary, cvAnalysis);
            }
            
            // Générer un texte de synthèse complet
            StringBuilder summaryText = new StringBuilder();
            summaryText.append("Analyse complète de la candidature:\n\n");
            
            // Section Chatbot
            summaryText.append("=== ANALYSE CHATBOT ===\n");
            summaryText.append("Motivation: ").append(chatAnalysis.getMotivationLevel()).append("\n");
            summaryText.append("Profil technique (chatbot): ").append(chatAnalysis.getTechnicalLevel()).append("\n");
            summaryText.append("Score de complétude: ").append(String.format("%.1f%%", chatAnalysis.getCompletenessScore() * 100)).append("\n");
            
            // Section CV si disponible
            if (cvAnalysis != null) {
                summaryText.append("\n=== ANALYSE CV ===\n");
                summaryText.append("Score technique CV: ").append(String.format("%.1f%%", cvAnalysis.getTechnicalScore() * 100)).append("\n");
                summaryText.append("Score expérience CV: ").append(String.format("%.1f%%", cvAnalysis.getExperienceScore() * 100)).append("\n");
                summaryText.append("Score global CV: ").append(String.format("%.1f%%", cvAnalysis.getOverallScore() * 100)).append("\n");
                summaryText.append("Correspondance poste: ").append(String.format("%.1f%%", cvAnalysis.getOverallJobMatch() * 100)).append("\n");
                
                if (cvAnalysis.getTechnicalSkills() != null && !cvAnalysis.getTechnicalSkills().isEmpty()) {
                    summaryText.append("Compétences clés: ").append(String.join(", ", cvAnalysis.getTechnicalSkills())).append("\n");
                }
                
                if (cvAnalysis.getTotalExperienceYears() != null) {
                    summaryText.append("Années d'expérience: ").append(cvAnalysis.getTotalExperienceYears()).append("\n");
                }
            }
            
            // Section synthèse combinée
            summaryText.append("\n=== SYNTHÈSE COMBINÉE ===\n");
            summaryText.append("Niveau technique final: ").append(combinedTechnicalLevel).append("\n");
            summaryText.append("Niveau expérience final: ").append(combinedExperienceLevel).append("\n");
            summaryText.append("Recommandation: ").append(recommendedAction).append("\n");
            
            // Informations manquantes et incohérences
            if (!chatAnalysis.getMissingInformation().isEmpty()) {
                summaryText.append("\nInformations manquantes: ").append(String.join(", ", chatAnalysis.getMissingInformation()));
            }
            
            if (cvAnalysis != null && cvAnalysis.getMissingInformation() != null && !cvAnalysis.getMissingInformation().isEmpty()) {
                summaryText.append("\nInformations CV manquantes: ").append(String.join(", ", cvAnalysis.getMissingInformation()));
            }
            
            if (!chatAnalysis.getInconsistencies().isEmpty()) {
                summaryText.append("\nIncohérences détectées: ").append(String.join(", ", chatAnalysis.getInconsistencies()));
            }
            
            summary.setSummaryText(summaryText.toString());
            
            return applicationSummaryRepository.save(summary);
        } catch (Exception e) {
            // Fallback en cas d'erreur
            Application application = applicationRepository.findById(applicationId).orElse(null);
            if (application == null) return null;
            
            ApplicationSummary summary = new ApplicationSummary(application);
            summary.setMotivationLevel("MEDIUM");
            summary.setTechnicalProfile("MEDIUM");
            summary.setExperienceLevel("JUNIOR");
            summary.setRecommendedAction("REVIEW");
            summary.setSummaryText("Synthèse générée automatiquement (mode fallback)");
            
            return applicationSummaryRepository.save(summary);
        }
    }
    
    /**
     * Détermine le niveau technique combiné (chatbot + CV)
     */
    private String determineCombinedTechnicalLevel(ChatAnswerAnalysisDTO chatAnalysis, CVAnalysis cvAnalysis) {
        String chatbotLevel = chatAnalysis.getTechnicalLevel();
        
        if (cvAnalysis == null) {
            return chatbotLevel;
        }
        
        double cvScore = cvAnalysis.getTechnicalScore();
        
        // Si le CV a un score élevé, il peut améliorer l'évaluation
        if (cvScore >= 0.8) {
            if ("WEAK".equals(chatbotLevel)) return "MEDIUM";
            if ("MEDIUM".equals(chatbotLevel)) return "STRONG";
            return "STRONG";
        } else if (cvScore >= 0.5) {
            if ("WEAK".equals(chatbotLevel)) return "WEAK";
            if ("MEDIUM".equals(chatbotLevel)) return "MEDIUM";
            return "STRONG";
        } else {
            // CV faible, on garde le niveau du chatbot ou on réduit
            if ("STRONG".equals(chatbotLevel)) return "MEDIUM";
            return chatbotLevel;
        }
    }
    
    /**
     * Détermine le niveau d'expérience combiné
     */
    private String determineCombinedExperienceLevel(ChatAnswerAnalysisDTO chatAnalysis, CVAnalysis cvAnalysis) {
        if (cvAnalysis == null || cvAnalysis.getExperienceLevel() == null) {
            return "JUNIOR"; // Default si pas de CV
        }
        
        return cvAnalysis.getExperienceLevel();
    }
    
    /**
     * Détermine l'action recommandée combinée
     */
    private String determineRecommendedAction(ChatAnswerAnalysisDTO chatAnalysis, CVAnalysis cvAnalysis) {
        String chatbotAction = chatAnalysis.getRecommendedAction();
        
        if (cvAnalysis == null) {
            return chatbotAction;
        }
        
        double cvScore = cvAnalysis.getOverallScore();
        double cvJobMatch = cvAnalysis.getOverallJobMatch();
        
        // Si le CV est excellent, il peut surclasser une recommandation négative du chatbot
        if (cvScore >= 0.8 && cvJobMatch >= 0.8) {
            return "INTERVIEW";
        } else if (cvScore >= 0.6 && cvJobMatch >= 0.6) {
            if ("REJECT".equals(chatbotAction)) return "REVIEW";
            return chatbotAction;
        } else if (cvScore < 0.3 || cvJobMatch < 0.3) {
            // CV très faible, peut surclasser une recommandation positive
            if ("INTERVIEW".equals(chatbotAction)) return "REVIEW";
            return chatbotAction;
        }
        
        return chatbotAction;
    }
    
    /**
     * Enrichit la synthèse avec les données CV
     */
    private void enrichSummaryWithCVData(ApplicationSummary summary, CVAnalysis cvAnalysis) {
        // Enrichir les compétences clés avec les données CV
        StringBuilder enhancedSkills = new StringBuilder();
        if (summary.getKeySkills() != null && !summary.getKeySkills().trim().isEmpty()) {
            enhancedSkills.append(summary.getKeySkills());
        }
        
        if (cvAnalysis.getTechnicalSkills() != null && !cvAnalysis.getTechnicalSkills().isEmpty()) {
            if (enhancedSkills.length() > 0) enhancedSkills.append(" | ");
            enhancedSkills.append("CV: ").append(String.join(", ", cvAnalysis.getTechnicalSkills()));
        }
        
        summary.setKeySkills(enhancedSkills.toString());
        
        // Enrichir les points positifs avec les données CV
        StringBuilder enhancedPositive = new StringBuilder();
        if (summary.getPositivePoints() != null && !summary.getPositivePoints().trim().isEmpty()) {
            enhancedPositive.append(summary.getPositivePoints());
        }
        
        if (cvAnalysis.getOverallScore() >= 0.7) {
            if (enhancedPositive.length() > 0) enhancedPositive.append("\n");
            enhancedPositive.append("CV bien structuré avec ").append(cvAnalysis.getTotalExperienceYears()).append(" an(s) d'expérience");
        }
        
        if (cvAnalysis.getOverallJobMatch() >= 0.8) {
            if (enhancedPositive.length() > 0) enhancedPositive.append("\n");
            enhancedPositive.append("Excellente correspondance avec le poste (").append(String.format("%.0f%%", cvAnalysis.getOverallJobMatch() * 100)).append(")");
        }
        
        summary.setPositivePoints(enhancedPositive.toString());
        
        // Ajouter des préoccupations si le CV est faible
        StringBuilder enhancedConcerns = new StringBuilder();
        if (summary.getConcerns() != null && !summary.getConcerns().trim().isEmpty()) {
            enhancedConcerns.append(summary.getConcerns());
        }
        
        if (cvAnalysis.getOverallScore() < 0.4) {
            if (enhancedConcerns.length() > 0) enhancedConcerns.append("\n");
            enhancedConcerns.append("CV peu détaillé ou mal structuré");
        }
        
        if (cvAnalysis.getOverallJobMatch() < 0.5) {
            if (enhancedConcerns.length() > 0) enhancedConcerns.append("\n");
            enhancedConcerns.append("Faible correspondance avec les requirements du poste");
        }
        
        summary.setConcerns(enhancedConcerns.toString());
    }
    
    private ApplicationSummaryDTO applyFilters(ApplicationSummary summary, Application application, FilteringCriteria criteria) {
        ApplicationSummaryDTO dto = convertToDTO(summary);

        // Récupérer l'analyse CV si disponible
        CVAnalysis cvAnalysis = cvAnalysisRepository.findByApplication_ApplicationId(application.getApplicationId()).orElse(null);

        // Si la conversion en DTO a échoué, on ne filtre pas (évite NullPointerException)
        if (dto == null) {
            return null;
        }

        // Appliquer les filtres de critères bloquants (améliorés avec CV)
        if (criteria.getBlockingCriteria() != null && !criteria.getBlockingCriteria().isEmpty()) {
            for (String blockingCriterion : criteria.getBlockingCriteria()) {
                if (!passesBlockingCriterion(summary, application, blockingCriterion, cvAnalysis)) {
                    return null; // Exclure cette application
                }
            }
        }

        // Appliquer les filtres de pertinence (améliorés avec données CV)
        if (criteria.getMinMotivationLevel() != null) {
            if (!meetsMinimumLevel(summary.getMotivationLevel(), criteria.getMinMotivationLevel())) {
                return null;
            }
        }

        if (criteria.getMinTechnicalLevel() != null) {
            if (!passesTechnicalFilter(summary, criteria.getMinTechnicalLevel(), cvAnalysis)) {
                return null;
            }
        }

        if (criteria.getExperienceLevel() != null) {
            if (!passesExperienceFilter(summary, criteria.getExperienceLevel(), cvAnalysis)) {
                return null;
            }
        }

        // Nouveaux filtres basés sur les données CV
        if (criteria.getMinCVScore() != null && cvAnalysis != null) {
            if (!passesCVScoreFilter(cvAnalysis, criteria.getMinCVScore())) {
                return null;
            }
        }

        if (criteria.getRequiredSkills() != null && !criteria.getRequiredSkills().isEmpty() && cvAnalysis != null) {
            if (!passesRequiredSkillsFilter(cvAnalysis, criteria.getRequiredSkills())) {
                return null;
            }
        }

        if (criteria.getMinExperienceYears() != null && cvAnalysis != null) {
            if (!passesExperienceYearsFilter(cvAnalysis, criteria.getMinExperienceYears())) {
                return null;
            }
        }

        if (criteria.getMinJobMatch() != null && cvAnalysis != null) {
            if (!passesJobMatchFilter(cvAnalysis, criteria.getMinJobMatch())) {
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

        // Calculer le score de pertinence amélioré avec données CV
        double relevanceScore = calculateEnhancedRelevanceScore(summary, criteria, cvAnalysis);
        dto.setRelevanceScore(relevanceScore);

        // Ajouter les données CV au DTO si disponibles
        if (cvAnalysis != null) {
            dto.setCvScore(cvAnalysis.getOverallScore());
            dto.setCvTechnicalScore(cvAnalysis.getTechnicalScore());
            dto.setCvExperienceScore(cvAnalysis.getExperienceScore());
            dto.setJobMatch(cvAnalysis.getOverallJobMatch());
            dto.setTechnicalSkills(cvAnalysis.getTechnicalSkills());
            dto.setExperienceYears(cvAnalysis.getTotalExperienceYears());
        }

        return dto;
    }
    
    /**
     * Filtre technique amélioré avec données CV
     */
    private boolean passesTechnicalFilter(ApplicationSummary summary, String minLevel, CVAnalysis cvAnalysis) {
        // Si CV disponible, utiliser le score technique CV pour affiner l'évaluation
        if (cvAnalysis != null && cvAnalysis.getParsingSuccessful()) {
            double cvScore = cvAnalysis.getTechnicalScore();
            String chatbotLevel = summary.getTechnicalProfile();
            
            // Améliorer le niveau technique si le CV est bon
            if (cvScore >= 0.8 && "WEAK".equals(chatbotLevel)) {
                return meetsMinimumLevel("MEDIUM", minLevel);
            } else if (cvScore >= 0.6 && "WEAK".equals(chatbotLevel)) {
                return meetsMinimumLevel("MEDIUM", minLevel);
            } else if (cvScore < 0.4 && "STRONG".equals(chatbotLevel)) {
                return meetsMinimumLevel("MEDIUM", minLevel);
            }
        }
        
        return meetsMinimumLevel(summary.getTechnicalProfile(), minLevel);
    }
    
    /**
     * Filtre expérience amélioré avec données CV
     */
    private boolean passesExperienceFilter(ApplicationSummary summary, String requiredLevel, CVAnalysis cvAnalysis) {
        // Priorité aux données CV si disponibles
        if (cvAnalysis != null && cvAnalysis.getExperienceLevel() != null) {
            return requiredLevel.equals(cvAnalysis.getExperienceLevel());
        }
        
        return requiredLevel.equals(summary.getExperienceLevel());
    }
    
    /**
     * Filtre sur le score global du CV
     */
    private boolean passesCVScoreFilter(CVAnalysis cvAnalysis, Double minScore) {
        return cvAnalysis.getOverallScore() >= minScore;
    }
    
    /**
     * Filtre sur les compétences requises
     */
    private boolean passesRequiredSkillsFilter(CVAnalysis cvAnalysis, List<String> requiredSkills) {
        if (cvAnalysis.getTechnicalSkills() == null || cvAnalysis.getTechnicalSkills().isEmpty()) {
            return false;
        }
        
        List<String> candidateSkills = cvAnalysis.getTechnicalSkills().stream()
            .map(String::toUpperCase)
            .collect(java.util.stream.Collectors.toList());
        
        // Vérifier que toutes les compétences requises sont présentes
        for (String requiredSkill : requiredSkills) {
            if (!candidateSkills.contains(requiredSkill.toUpperCase())) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Filtre sur le nombre d'années d'expérience
     */
    private boolean passesExperienceYearsFilter(CVAnalysis cvAnalysis, Integer minYears) {
        if (cvAnalysis.getTotalExperienceYears() == null) {
            return false;
        }
        
        return cvAnalysis.getTotalExperienceYears() >= minYears;
    }
    
    /**
     * Filtre sur la correspondance avec le poste
     */
    private boolean passesJobMatchFilter(CVAnalysis cvAnalysis, Double minMatch) {
        return cvAnalysis.getOverallJobMatch() >= minMatch;
    }
    
    /**
     * Calcul du score de pertinence amélioré avec données CV
     */
    private double calculateEnhancedRelevanceScore(ApplicationSummary summary, FilteringCriteria criteria, CVAnalysis cvAnalysis) {
        double score = 0.0;
        int criteriaCount = 0;
        
        // Score de motivation
        if (criteria.getMinMotivationLevel() != null) {
            score += getMotivationScore(summary.getMotivationLevel()) * 0.3;
            criteriaCount++;
        }
        
        // Score technique (amélioré avec CV)
        if (criteria.getMinTechnicalLevel() != null) {
            double techScore = getTechnicalScore(summary.getTechnicalProfile());
            if (cvAnalysis != null && cvAnalysis.getParsingSuccessful()) {
                // Combiner score chatbot et CV
                techScore = (techScore + cvAnalysis.getTechnicalScore()) / 2.0;
            }
            score += techScore * 0.4;
            criteriaCount++;
        }
        
        // Score d'expérience (amélioré avec CV)
        if (criteria.getExperienceLevel() != null) {
            double expScore = getExperienceScore(summary.getExperienceLevel());
            if (cvAnalysis != null && cvAnalysis.getExperienceScore() != null) {
                // Combiner score chatbot et CV
                expScore = (expScore + cvAnalysis.getExperienceScore()) / 2.0;
            }
            score += expScore * 0.2;
            criteriaCount++;
        }
        
        // Bonus si CV disponible et de bonne qualité
        if (cvAnalysis != null && cvAnalysis.getParsingSuccessful()) {
            score += cvAnalysis.getOverallScore() * 0.1;
            criteriaCount++;
        }
        
        return criteriaCount > 0 ? score / criteriaCount : 0.0;
    }
    
    /**
     * Vérifie si le niveau actuel répond au niveau minimum requis
     */
    private boolean meetsMinimumLevel(String currentLevel, String minLevel) {
        if (currentLevel == null || minLevel == null) return false;
        
        int current = getLevelValue(currentLevel);
        int minimum = getLevelValue(minLevel);
        
        return current >= minimum;
    }
    
    /**
     * Convertit le niveau en valeur numérique
     */
    private int getLevelValue(String level) {
        switch (level) {
            case "HIGH": case "STRONG": return 3;
            case "MEDIUM": case "INTERMEDIATE": return 2;
            case "LOW": case "WEAK": case "JUNIOR": return 1;
            default: return 0;
        }
    }
    
    /**
     * Calcule le score de motivation (0-1)
     */
    private double getMotivationScore(String level) {
        switch (level) {
            case "HIGH": return 1.0;
            case "MEDIUM": return 0.7;
            case "LOW": return 0.3;
            default: return 0.0;
        }
    }
    
    /**
     * Calcule le score technique (0-1)
     */
    private double getTechnicalScore(String level) {
        switch (level) {
            case "STRONG": return 1.0;
            case "MEDIUM": return 0.7;
            case "WEAK": return 0.3;
            default: return 0.0;
        }
    }
    
    /**
     * Calcule le score d'expérience (0-1)
     */
    private double getExperienceScore(String level) {
        switch (level) {
            case "SENIOR": return 1.0;
            case "INTERMEDIATE": return 0.7;
            case "JUNIOR": return 0.4;
            default: return 0.0;
        }
    }
    
    private boolean passesBlockingCriterion(ApplicationSummary summary, Application application, String criterion, CVAnalysis cvAnalysis) {
        switch (criterion) {
            case "DISPONIBILITY":
                return summary.getAvailabilityStatus() != null && 
                       !"NON_SPECIFIE".equals(summary.getAvailabilityStatus());
            
            case "CV_REQUIRED":
                return cvAnalysis != null && cvAnalysis.getParsingSuccessful();
                       
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
        
        // Nouveaux critères basés sur les données CV
        private Double minCVScore;
        private List<String> requiredSkills;
        private Integer minExperienceYears;
        private Double minJobMatch;
        
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
        
        // Getters & Setters pour les nouveaux champs CV
        public Double getMinCVScore() {
            return minCVScore;
        }
        
        public void setMinCVScore(Double minCVScore) {
            this.minCVScore = minCVScore;
        }
        
        public List<String> getRequiredSkills() {
            return requiredSkills;
        }
        
        public void setRequiredSkills(List<String> requiredSkills) {
            this.requiredSkills = requiredSkills;
        }
        
        public Integer getMinExperienceYears() {
            return minExperienceYears;
        }
        
        public void setMinExperienceYears(Integer minExperienceYears) {
            this.minExperienceYears = minExperienceYears;
        }
        
        public Double getMinJobMatch() {
            return minJobMatch;
        }
        
        public void setMinJobMatch(Double minJobMatch) {
            this.minJobMatch = minJobMatch;
        }
    }
}
