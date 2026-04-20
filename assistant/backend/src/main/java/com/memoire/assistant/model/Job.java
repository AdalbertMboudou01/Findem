package com.memoire.assistant.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID jobId;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "owner_recruiter_id")
    private Recruiter ownerRecruiter;

    private String title;
    private String description;
    private String location;
    private String alternanceRhythm;

    @Column(columnDefinition = "jsonb")
    private String blockingCriteria;

    @ElementCollection
    private List<String> technologies;

    private String slug;
    private Date createdAt;

    // Getters & Setters
    public UUID getJobId() {
        return jobId;
    }
    
    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }
    
    public Company getCompany() {
        return company;
    }
    
    public void setCompany(Company company) {
        this.company = company;
    }
    
    public Recruiter getOwnerRecruiter() {
        return ownerRecruiter;
    }
    
    public void setOwnerRecruiter(Recruiter ownerRecruiter) {
        this.ownerRecruiter = ownerRecruiter;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getAlternanceRhythm() {
        return alternanceRhythm;
    }
    
    public void setAlternanceRhythm(String alternanceRhythm) {
        this.alternanceRhythm = alternanceRhythm;
    }
    
    public String getBlockingCriteria() {
        return blockingCriteria;
    }
    
    public void setBlockingCriteria(String blockingCriteria) {
        this.blockingCriteria = blockingCriteria;
    }
    
    public List<String> getTechnologies() {
        return technologies;
    }
    
    public void setTechnologies(List<String> technologies) {
        this.technologies = technologies;
    }
    
    public String getSlug() {
        return slug;
    }
    
    public void setSlug(String slug) {
        this.slug = slug;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
