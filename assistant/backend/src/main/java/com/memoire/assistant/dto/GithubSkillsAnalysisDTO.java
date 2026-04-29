package com.memoire.assistant.dto;

import java.util.List;

public class GithubSkillsAnalysisDTO {
    private List<String> foundSkills;
    private List<String> totalSkills;
    private List<String> languages;
    private List<String> technologies;
    private List<String> projectHighlights;
    
    // Getters & Setters
    public List<String> getFoundSkills() { return foundSkills; }
    public void setFoundSkills(List<String> foundSkills) { this.foundSkills = foundSkills; }
    public List<String> getTotalSkills() { return totalSkills; }
    public void setTotalSkills(List<String> totalSkills) { this.totalSkills = totalSkills; }
    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
    public List<String> getTechnologies() { return technologies; }
    public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
    public List<String> getProjectHighlights() { return projectHighlights; }
    public void setProjectHighlights(List<String> projectHighlights) { this.projectHighlights = projectHighlights; }
}