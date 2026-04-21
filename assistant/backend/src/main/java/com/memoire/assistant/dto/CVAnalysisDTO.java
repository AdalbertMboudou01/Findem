package com.memoire.assistant.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CVAnalysisDTO {
    
    private String applicationId;
    private String candidateName;
    private String fileName;
    private String fileType;
    private long fileSize;
    private LocalDateTime uploadedAt;
    
    // Informations extraites du CV
    private String fullName;
    private String email;
    private String phone;
    private String location;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    
    // Expérience
    private List<ExperienceDTO> experiences;
    private int totalExperienceYears;
    private String experienceLevel; // JUNIOR, INTERMEDIATE, SENIOR
    
    // Éducation
    private List<EducationDTO> education;
    private String highestDegree;
    private String fieldOfStudy;
    
    // Compétences techniques
    private List<String> technicalSkills;
    private List<String> programmingLanguages;
    private List<String> frameworks;
    private List<String> databases;
    private List<String> tools;
    private List<String> certifications;
    
    // Projets
    private List<ProjectDTO> projects;
    
    // Langues
    private Map<String, String> languages; // language -> level
    
    // Analyse et scoring
    private double completenessScore; // 0.0 - 1.0
    private double technicalScore;   // 0.0 - 1.0
    private double experienceScore;  // 0.0 - 1.0
    private double overallScore;     // 0.0 - 1.0
    
    // Qualité du parsing
    private boolean parsingSuccessful;
    private String parsingMethod; // PDF_PARSER, OCR, MANUAL
    private List<String> parsingErrors;
    private List<String> missingInformation;
    
    // Correspondance avec le poste
    private Map<String, Double> jobMatchScores; // skill -> match score
    private double overallJobMatch;
    
    // Constructeurs
    public CVAnalysisDTO() {
        this.uploadedAt = LocalDateTime.now();
        this.parsingSuccessful = false;
        this.completenessScore = 0.0;
        this.technicalScore = 0.0;
        this.experienceScore = 0.0;
        this.overallScore = 0.0;
        this.overallJobMatch = 0.0;
    }
    
    public CVAnalysisDTO(String applicationId, String candidateName) {
        this();
        this.applicationId = applicationId;
        this.candidateName = candidateName;
    }
    
    // DTOs imbriqués
    public static class ExperienceDTO {
        private String company;
        private String position;
        private String location;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private boolean current;
        private String description;
        private List<String> achievements;
        private String duration; // "2 ans 3 mois"
        
        // Getters & Setters
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        
        public boolean isCurrent() { return current; }
        public void setCurrent(boolean current) { this.current = current; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public List<String> getAchievements() { return achievements; }
        public void setAchievements(List<String> achievements) { this.achievements = achievements; }
        
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
    }
    
    public static class EducationDTO {
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String gpa;
        private List<String> achievements;
        private String description;
        
        // Getters & Setters
        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }
        
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        
        public String getFieldOfStudy() { return fieldOfStudy; }
        public void setFieldOfStudy(String fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }
        
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        
        public String getGpa() { return gpa; }
        public void setGpa(String gpa) { this.gpa = gpa; }
        
        public List<String> getAchievements() { return achievements; }
        public void setAchievements(List<String> achievements) { this.achievements = achievements; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class ProjectDTO {
        private String name;
        private String description;
        private List<String> technologies;
        private String role;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String url;
        private List<String> achievements;
        
        // Getters & Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public List<String> getTechnologies() { return technologies; }
        public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        
        public List<String> getAchievements() { return achievements; }
        public void setAchievements(List<String> achievements) { this.achievements = achievements; }
    }
    
    // Getters & Setters principaux
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    
    public List<ExperienceDTO> getExperiences() { return experiences; }
    public void setExperiences(List<ExperienceDTO> experiences) { this.experiences = experiences; }
    
    public int getTotalExperienceYears() { return totalExperienceYears; }
    public void setTotalExperienceYears(int totalExperienceYears) { this.totalExperienceYears = totalExperienceYears; }
    
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    
    public List<EducationDTO> getEducation() { return education; }
    public void setEducation(List<EducationDTO> education) { this.education = education; }
    
    public String getHighestDegree() { return highestDegree; }
    public void setHighestDegree(String highestDegree) { this.highestDegree = highestDegree; }
    
    public String getFieldOfStudy() { return fieldOfStudy; }
    public void setFieldOfStudy(String fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }
    
    public List<String> getTechnicalSkills() { return technicalSkills; }
    public void setTechnicalSkills(List<String> technicalSkills) { this.technicalSkills = technicalSkills; }
    
    public List<String> getProgrammingLanguages() { return programmingLanguages; }
    public void setProgrammingLanguages(List<String> programmingLanguages) { this.programmingLanguages = programmingLanguages; }
    
    public List<String> getFrameworks() { return frameworks; }
    public void setFrameworks(List<String> frameworks) { this.frameworks = frameworks; }
    
    public List<String> getDatabases() { return databases; }
    public void setDatabases(List<String> databases) { this.databases = databases; }
    
    public List<String> getTools() { return tools; }
    public void setTools(List<String> tools) { this.tools = tools; }
    
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }
    
    public List<ProjectDTO> getProjects() { return projects; }
    public void setProjects(List<ProjectDTO> projects) { this.projects = projects; }
    
    public Map<String, String> getLanguages() { return languages; }
    public void setLanguages(Map<String, String> languages) { this.languages = languages; }
    
    public double getCompletenessScore() { return completenessScore; }
    public void setCompletenessScore(double completenessScore) { this.completenessScore = completenessScore; }
    
    public double getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(double technicalScore) { this.technicalScore = technicalScore; }
    
    public double getExperienceScore() { return experienceScore; }
    public void setExperienceScore(double experienceScore) { this.experienceScore = experienceScore; }
    
    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }
    
    public boolean isParsingSuccessful() { return parsingSuccessful; }
    public void setParsingSuccessful(boolean parsingSuccessful) { this.parsingSuccessful = parsingSuccessful; }
    
    public String getParsingMethod() { return parsingMethod; }
    public void setParsingMethod(String parsingMethod) { this.parsingMethod = parsingMethod; }
    
    public List<String> getParsingErrors() { return parsingErrors; }
    public void setParsingErrors(List<String> parsingErrors) { this.parsingErrors = parsingErrors; }
    
    public List<String> getMissingInformation() { return missingInformation; }
    public void setMissingInformation(List<String> missingInformation) { this.missingInformation = missingInformation; }
    
    public Map<String, Double> getJobMatchScores() { return jobMatchScores; }
    public void setJobMatchScores(Map<String, Double> jobMatchScores) { this.jobMatchScores = jobMatchScores; }
    
    public double getOverallJobMatch() { return overallJobMatch; }
    public void setOverallJobMatch(double overallJobMatch) { this.overallJobMatch = overallJobMatch; }
}
