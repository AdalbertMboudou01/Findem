package com.memoire.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class JobCreateRequest {
    @NotBlank(message = "Le titre est obligatoire")
    private String title;
    @NotBlank(message = "La description est obligatoire")
    private String description;
    @NotBlank(message = "La localisation est obligatoire")
    private String location;
    private String alternanceRhythm;
    private String blockingCriteria;
    private String slug;
    @NotNull(message = "L'identifiant de la société est obligatoire")
    private UUID companyId;
    @NotNull(message = "L'identifiant du recruteur est obligatoire")
    private UUID ownerRecruiterId;
    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAlternanceRhythm() { return alternanceRhythm; }
    public void setAlternanceRhythm(String alternanceRhythm) { this.alternanceRhythm = alternanceRhythm; }
    public String getBlockingCriteria() { return blockingCriteria; }
    public void setBlockingCriteria(String blockingCriteria) { this.blockingCriteria = blockingCriteria; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }
    public UUID getOwnerRecruiterId() { return ownerRecruiterId; }
    public void setOwnerRecruiterId(UUID ownerRecruiterId) { this.ownerRecruiterId = ownerRecruiterId; }
}
