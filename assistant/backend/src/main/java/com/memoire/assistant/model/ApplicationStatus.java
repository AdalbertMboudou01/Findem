package com.memoire.assistant.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "application_statuses")
public class ApplicationStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID statusId;

    @Column(unique = true)
    private String code;
    private String label;

    // Getters & Setters
    public UUID getStatusId() {
        return statusId;
    }
    
    public void setStatusId(UUID statusId) {
        this.statusId = statusId;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }
}
