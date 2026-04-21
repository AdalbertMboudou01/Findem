package com.memoire.assistant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cv_analysis")
public class CVAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_type")
    private String fileType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    
    @Column(name = "github_url")
    private String githubUrl;
    
    @Column(name = "portfolio_url")
    private String portfolioUrl;
    
    @Column(name = "total_experience_years")
    private Integer totalExperienceYears;
    
    @Column(name = "experience_level")
    private String experienceLevel;
    
    @Column(name = "highest_degree")
    private String highestDegree;
    
    @Column(name = "field_of_study")
    private String fieldOfStudy;
    
    @ElementCollection
    @CollectionTable(name = "cv_technical_skills", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "skill")
    private List<String> technicalSkills;
    
    @ElementCollection
    @CollectionTable(name = "cv_programming_languages", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "language")
    private List<String> programmingLanguages;
    
    @ElementCollection
    @CollectionTable(name = "cv_frameworks", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "framework")
    private List<String> frameworks;
    
    @ElementCollection
    @CollectionTable(name = "cv_databases", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "database")
    private List<String> databases;
    
    @ElementCollection
    @CollectionTable(name = "cv_tools", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "tool")
    private List<String> tools;
    
    @ElementCollection
    @CollectionTable(name = "cv_certifications", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "certification")
    private List<String> certifications;
    
    @Column(name = "completeness_score")
    private Double completenessScore;
    
    @Column(name = "technical_score")
    private Double technicalScore;
    
    @Column(name = "experience_score")
    private Double experienceScore;
    
    @Column(name = "overall_score")
    private Double overallScore;
    
    @Column(name = "parsing_successful")
    private Boolean parsingSuccessful;
    
    @Column(name = "parsing_method")
    private String parsingMethod;
    
    @ElementCollection
    @CollectionTable(name = "cv_parsing_errors", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "error")
    private List<String> parsingErrors;
    
    @ElementCollection
    @CollectionTable(name = "cv_missing_information", joinColumns = @JoinColumn(name = "cv_analysis_id"))
    @Column(name = "missing_info")
    private List<String> missingInformation;
    
    @Column(name = "overall_job_match")
    private Double overallJobMatch;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructeurs
    public CVAnalysis() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.parsingSuccessful = false;
    }
    
    public CVAnalysis(Application application) {
        this();
        this.application = application;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters & Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public Application getApplication() {
        return application;
    }
    
    public void setApplication(Application application) {
        this.application = application;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFileType() {
        return fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getLinkedinUrl() {
        return linkedinUrl;
    }
    
    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
    
    public String getGithubUrl() {
        return githubUrl;
    }
    
    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }
    
    public String getPortfolioUrl() {
        return portfolioUrl;
    }
    
    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }
    
    public Integer getTotalExperienceYears() {
        return totalExperienceYears;
    }
    
    public void setTotalExperienceYears(Integer totalExperienceYears) {
        this.totalExperienceYears = totalExperienceYears;
    }
    
    public String getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public String getHighestDegree() {
        return highestDegree;
    }
    
    public void setHighestDegree(String highestDegree) {
        this.highestDegree = highestDegree;
    }
    
    public String getFieldOfStudy() {
        return fieldOfStudy;
    }
    
    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }
    
    public List<String> getTechnicalSkills() {
        return technicalSkills;
    }
    
    public void setTechnicalSkills(List<String> technicalSkills) {
        this.technicalSkills = technicalSkills;
    }
    
    public List<String> getProgrammingLanguages() {
        return programmingLanguages;
    }
    
    public void setProgrammingLanguages(List<String> programmingLanguages) {
        this.programmingLanguages = programmingLanguages;
    }
    
    public List<String> getFrameworks() {
        return frameworks;
    }
    
    public void setFrameworks(List<String> frameworks) {
        this.frameworks = frameworks;
    }
    
    public List<String> getDatabases() {
        return databases;
    }
    
    public void setDatabases(List<String> databases) {
        this.databases = databases;
    }
    
    public List<String> getTools() {
        return tools;
    }
    
    public void setTools(List<String> tools) {
        this.tools = tools;
    }
    
    public List<String> getCertifications() {
        return certifications;
    }
    
    public void setCertifications(List<String> certifications) {
        this.certifications = certifications;
    }
    
    public Double getCompletenessScore() {
        return completenessScore;
    }
    
    public void setCompletenessScore(Double completenessScore) {
        this.completenessScore = completenessScore;
    }
    
    public Double getTechnicalScore() {
        return technicalScore;
    }
    
    public void setTechnicalScore(Double technicalScore) {
        this.technicalScore = technicalScore;
    }
    
    public Double getExperienceScore() {
        return experienceScore;
    }
    
    public void setExperienceScore(Double experienceScore) {
        this.experienceScore = experienceScore;
    }
    
    public Double getOverallScore() {
        return overallScore;
    }
    
    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }
    
    public Boolean getParsingSuccessful() {
        return parsingSuccessful;
    }
    
    public void setParsingSuccessful(Boolean parsingSuccessful) {
        this.parsingSuccessful = parsingSuccessful;
    }
    
    public String getParsingMethod() {
        return parsingMethod;
    }
    
    public void setParsingMethod(String parsingMethod) {
        this.parsingMethod = parsingMethod;
    }
    
    public List<String> getParsingErrors() {
        return parsingErrors;
    }
    
    public void setParsingErrors(List<String> parsingErrors) {
        this.parsingErrors = parsingErrors;
    }
    
    public List<String> getMissingInformation() {
        return missingInformation;
    }
    
    public void setMissingInformation(List<String> missingInformation) {
        this.missingInformation = missingInformation;
    }
    
    public Double getOverallJobMatch() {
        return overallJobMatch;
    }
    
    public void setOverallJobMatch(Double overallJobMatch) {
        this.overallJobMatch = overallJobMatch;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
