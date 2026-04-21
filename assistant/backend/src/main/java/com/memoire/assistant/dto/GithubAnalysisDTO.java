package com.memoire.assistant.dto;

import java.util.List;
import java.util.Map;

public class GithubAnalysisDTO {
    private Boolean success;
    private String error;
    private String username;
    private String portfolioUrl;
    private Map<String, Object> profileInfo;
    private Map<String, Object> portfolioInfo;
    private Integer publicRepositories;
    private Integer totalStars;
    private Integer totalForks;
    private List<String> languages;
    private List<String> technologies;
    private List<String> projectHighlights;
    private Integer activityScore;
    private Double profileCompleteness;
    private Boolean hasPortfolio;
    
    // Getters & Setters
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public Map<String, Object> getProfileInfo() { return profileInfo; }
    public void setProfileInfo(Map<String, Object> profileInfo) { this.profileInfo = profileInfo; }
    public Map<String, Object> getPortfolioInfo() { return portfolioInfo; }
    public void setPortfolioInfo(Map<String, Object> portfolioInfo) { this.portfolioInfo = portfolioInfo; }
    public Integer getPublicRepositories() { return publicRepositories; }
    public void setPublicRepositories(Integer publicRepositories) { this.publicRepositories = publicRepositories; }
    public Integer getTotalStars() { return totalStars; }
    public void setTotalStars(Integer totalStars) { this.totalStars = totalStars; }
    public Integer getTotalForks() { return totalForks; }
    public void setTotalForks(Integer totalForks) { this.totalForks = totalForks; }
    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
    public List<String> getTechnologies() { return technologies; }
    public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
    public List<String> getProjectHighlights() { return projectHighlights; }
    public void setProjectHighlights(List<String> projectHighlights) { this.projectHighlights = projectHighlights; }
    public Integer getActivityScore() { return activityScore; }
    public void setActivityScore(Integer activityScore) { this.activityScore = activityScore; }
    public Double getProfileCompleteness() { return profileCompleteness; }
    public void setProfileCompleteness(Double profileCompleteness) { this.profileCompleteness = profileCompleteness; }
    public Boolean getHasPortfolio() { return hasPortfolio; }
    public void setHasPortfolio(Boolean hasPortfolio) { this.hasPortfolio = hasPortfolio; }
}