package com.memoire.assistant.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "recruiters")
public class Recruiter {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID recruiterId;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    private String email;
    private String name;
    private String role;
    private String status;
    private UUID authUserId;

    // Getters & Setters
    public void setRecruiterId(UUID recruiterId) {
        this.recruiterId = recruiterId;
    }
    public void setCompany(Company company) {
        this.company = company;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public void setAuthUserId(UUID authUserId) {
        this.authUserId = authUserId;
    }
}
