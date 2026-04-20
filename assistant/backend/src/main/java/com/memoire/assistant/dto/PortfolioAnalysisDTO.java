package com.memoire.assistant.dto;

import java.util.List;

public class PortfolioAnalysisDTO {
    private boolean accessible;
    private List<String> foundSkills;
    private List<String> missingSkills;
    private String pageTitle;
    // Getters & Setters
    public boolean isAccessible() { return accessible; }
    public void setAccessible(boolean accessible) { this.accessible = accessible; }
    public List<String> getFoundSkills() { return foundSkills; }
    public void setFoundSkills(List<String> foundSkills) { this.foundSkills = foundSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public String getPageTitle() { return pageTitle; }
    public void setPageTitle(String pageTitle) { this.pageTitle = pageTitle; }
}