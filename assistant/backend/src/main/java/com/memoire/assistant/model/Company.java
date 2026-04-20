package com.memoire.assistant.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID companyId;

    private String name;
    private String sector;
    private String size;
    private String website;
    private String plan;
    private Date createdAt;

    @Column(columnDefinition = "jsonb")
    private String config;

    // Getters & Setters
    public UUID getCompanyId() {
        return companyId;
    }
    
    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getSector() {
        return sector;
    }
    
    public void setSector(String sector) {
        this.sector = sector;
    }
    
    public String getSize() {
        return size;
    }
    
    public void setSize(String size) {
        this.size = size;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public String getPlan() {
        return plan;
    }
    
    public void setPlan(String plan) {
        this.plan = plan;
    }
    
    public String getConfig() {
        return config;
    }
    
    public void setConfig(String config) {
        this.config = config;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
