package com.memoire.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ContractSignatureRequest {
    
    @NotNull(message = "L'ID de la candidature est obligatoire")
    private UUID applicationId;
    
    @NotNull(message = "L'ID du candidat est obligatoire")
    private UUID candidateId;
    
    @NotBlank(message = "L'URL du contrat est obligatoire")
    private String contractUrl;
    
    private String notes; // Notes internes optionnelles
    
    // Constructors
    public ContractSignatureRequest() {}
    
    // Getters & Setters
    public UUID getApplicationId() {
        return applicationId;
    }
    
    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }
    
    public UUID getCandidateId() {
        return candidateId;
    }
    
    public void setCandidateId(UUID candidateId) {
        this.candidateId = candidateId;
    }
    
    public String getContractUrl() {
        return contractUrl;
    }
    
    public void setContractUrl(String contractUrl) {
        this.contractUrl = contractUrl;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
