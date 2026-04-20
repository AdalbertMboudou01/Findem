package com.memoire.assistant.dto;

import java.util.List;

public class GithubSkillsAnalysisDTO {
    private String username;
    private List<String> foundSkills;
    private List<String> missingSkills;
    private int repoCount;
    // Getters & Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public List<String> getFoundSkills() { return foundSkills; }
    public void setFoundSkills(List<String> foundSkills) { this.foundSkills = foundSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public int getRepoCount() { return repoCount; }
    public void setRepoCount(int repoCount) { this.repoCount = repoCount; }
}