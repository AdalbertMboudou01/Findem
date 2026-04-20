package com.memoire.assistant.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "candidates")
public class Candidate {
        public UUID getCandidateId() {
            return candidateId;
        }
        public String getFirstName() {
            return firstName;
        }
        public String getLastName() {
            return lastName;
        }
        public String getEmail() {
            return email;
        }
        public String getPhone() {
            return phone;
        }
        public String getLocation() {
            return location;
        }
        public String getSchool() {
            return school;
        }
        public Boolean getConsent() {
            return consent;
        }
        public Date getCreatedAt() {
            return createdAt;
        }
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID candidateId;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String location;

    private String school;
    private Boolean consent;
    private Boolean inPool = false; // Vivier
    private String githubUrl;
    private String portfolioUrl;
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
    private Date createdAt;

    // Getters & Setters
    public void setCandidateId(UUID candidateId) {
        this.candidateId = candidateId;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public void setSchool(String school) {
        this.school = school;
    }
    public void setConsent(Boolean consent) {
        this.consent = consent;
    }

    public Boolean getInPool() {
        return inPool;
    }

    public void setInPool(Boolean inPool) {
        this.inPool = inPool;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
