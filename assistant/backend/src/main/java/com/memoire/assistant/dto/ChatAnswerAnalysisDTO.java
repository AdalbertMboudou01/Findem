package com.memoire.assistant.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChatAnswerAnalysisDTO {
    
    private String applicationId;
    private LocalDateTime analyzedAt;
    
    // Analyse de motivation
    private String motivationLevel; // HIGH, MEDIUM, LOW
    private String motivationSummary;
    private List<String> motivationKeywords;
    private boolean hasSpecificMotivation;
    
    // Analyse technique et projets
    private String technicalLevel; // STRONG, MEDIUM, WEAK
    private List<String> mentionedProjects;
    private List<String> technicalSkills;
    private boolean hasProjectDetails;
    private boolean hasGitHubOrPortfolio;
    
    // Analyse disponibilité et rythme
    private String availabilityStatus; // IMMEDIATE, FUTURE, UNSPECIFIED
    private String alternanceRhythm; // FULL_TIME, PART_TIME, FLEXIBLE
    private boolean hasClearAvailability;
    
    // Analyse localisation
    private String locationMatch; // PERFECT, REMOTE_COMPATIBLE, INCOMPATIBLE
    private boolean hasMobility;
    
    // Analyse globale
    private double completenessScore; // 0.0 to 1.0
    private List<String> missingInformation;
    private List<String> inconsistencies;
    private String recommendedAction; // PRIORITY, REVIEW, REJECT
    
    // Constructeurs
    public ChatAnswerAnalysisDTO() {
        this.analyzedAt = LocalDateTime.now();
    }
    
    public ChatAnswerAnalysisDTO(String applicationId) {
        this();
        this.applicationId = applicationId;
    }
    
    // Getters & Setters
    public String getApplicationId() {
        return applicationId;
    }
    
    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }
    
    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }
    
    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
    
    public String getMotivationLevel() {
        return motivationLevel;
    }
    
    public void setMotivationLevel(String motivationLevel) {
        this.motivationLevel = motivationLevel;
    }
    
    public String getMotivationSummary() {
        return motivationSummary;
    }
    
    public void setMotivationSummary(String motivationSummary) {
        this.motivationSummary = motivationSummary;
    }
    
    public List<String> getMotivationKeywords() {
        return motivationKeywords;
    }
    
    public void setMotivationKeywords(List<String> motivationKeywords) {
        this.motivationKeywords = motivationKeywords;
    }
    
    public boolean isHasSpecificMotivation() {
        return hasSpecificMotivation;
    }
    
    public void setHasSpecificMotivation(boolean hasSpecificMotivation) {
        this.hasSpecificMotivation = hasSpecificMotivation;
    }
    
    public String getTechnicalLevel() {
        return technicalLevel;
    }
    
    public void setTechnicalLevel(String technicalLevel) {
        this.technicalLevel = technicalLevel;
    }
    
    public List<String> getMentionedProjects() {
        return mentionedProjects;
    }
    
    public void setMentionedProjects(List<String> mentionedProjects) {
        this.mentionedProjects = mentionedProjects;
    }
    
    public List<String> getTechnicalSkills() {
        return technicalSkills;
    }
    
    public void setTechnicalSkills(List<String> technicalSkills) {
        this.technicalSkills = technicalSkills;
    }
    
    public boolean isHasProjectDetails() {
        return hasProjectDetails;
    }
    
    public void setHasProjectDetails(boolean hasProjectDetails) {
        this.hasProjectDetails = hasProjectDetails;
    }
    
    public boolean isHasGitHubOrPortfolio() {
        return hasGitHubOrPortfolio;
    }
    
    public void setHasGitHubOrPortfolio(boolean hasGitHubOrPortfolio) {
        this.hasGitHubOrPortfolio = hasGitHubOrPortfolio;
    }
    
    public String getAvailabilityStatus() {
        return availabilityStatus;
    }
    
    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
    
    public String getAlternanceRhythm() {
        return alternanceRhythm;
    }
    
    public void setAlternanceRhythm(String alternanceRhythm) {
        this.alternanceRhythm = alternanceRhythm;
    }
    
    public boolean isHasClearAvailability() {
        return hasClearAvailability;
    }
    
    public void setHasClearAvailability(boolean hasClearAvailability) {
        this.hasClearAvailability = hasClearAvailability;
    }
    
    public String getLocationMatch() {
        return locationMatch;
    }
    
    public void setLocationMatch(String locationMatch) {
        this.locationMatch = locationMatch;
    }
    
    public boolean isHasMobility() {
        return hasMobility;
    }
    
    public void setHasMobility(boolean hasMobility) {
        this.hasMobility = hasMobility;
    }
    
    public double getCompletenessScore() {
        return completenessScore;
    }
    
    public void setCompletenessScore(double completenessScore) {
        this.completenessScore = completenessScore;
    }
    
    public List<String> getMissingInformation() {
        return missingInformation;
    }
    
    public void setMissingInformation(List<String> missingInformation) {
        this.missingInformation = missingInformation;
    }
    
    public List<String> getInconsistencies() {
        return inconsistencies;
    }
    
    public void setInconsistencies(List<String> inconsistencies) {
        this.inconsistencies = inconsistencies;
    }
    
    public String getRecommendedAction() {
        return recommendedAction;
    }
    
    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }
}
