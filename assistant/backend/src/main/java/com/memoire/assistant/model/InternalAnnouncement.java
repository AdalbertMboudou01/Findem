package com.memoire.assistant.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "internal_announcements")
public class InternalAnnouncement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID announcementId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Recruiter author;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "category", nullable = false)
    private String category; // GENERAL, HIRING, EVENT, POLICY, UPDATE
    
    @Column(name = "priority", nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    
    @Column(name = "target_audience")
    private String targetAudience; // ALL, RECRUITERS, TECHNICAL, MANAGEMENT
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "attachment_path")
    private String attachmentPath;
    
    @Column(name = "attachment_name")
    private String attachmentName;
    
    @Column(name = "read_count")
    private Integer readCount = 0;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructeurs
    public InternalAnnouncement() {
        this.createdAt = LocalDateTime.now();
        this.priority = "MEDIUM";
        this.category = "GENERAL";
        this.targetAudience = "ALL";
    }
    
    public InternalAnnouncement(Recruiter author, Company company, String title, String content) {
        this();
        this.author = author;
        this.company = company;
        this.title = title;
        this.content = content;
    }
    
    // Getters & Setters
    public UUID getAnnouncementId() {
        return announcementId;
    }
    
    public void setAnnouncementId(UUID announcementId) {
        this.announcementId = announcementId;
    }
    
    public Recruiter getAuthor() {
        return author;
    }
    
    public void setAuthor(Recruiter author) {
        this.author = author;
    }
    
    public Company getCompany() {
        return company;
    }
    
    public void setCompany(Company company) {
        this.company = company;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public String getTargetAudience() {
        return targetAudience;
    }
    
    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public String getAttachmentPath() {
        return attachmentPath;
    }
    
    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }
    
    public String getAttachmentName() {
        return attachmentName;
    }
    
    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }
    
    public Integer getReadCount() {
        return readCount;
    }
    
    public void setReadCount(Integer readCount) {
        this.readCount = readCount;
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
