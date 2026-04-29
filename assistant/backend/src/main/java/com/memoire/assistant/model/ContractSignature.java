package com.memoire.assistant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contract_signatures")
public class ContractSignature {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID signatureId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;
    
    @Column(name = "contract_url", columnDefinition = "TEXT")
    private String contractUrl;
    
    @Column(name = "signed_at", nullable = false)
    private LocalDateTime signedAt;
    
    @Column(name = "signature_ip")
    private String signatureIp;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "status", nullable = false)
    private String status; // PENDING, SIGNED, EXPIRED
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    // Constructors
    public ContractSignature() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
        this.expiresAt = LocalDateTime.now().plusDays(7); // Expire après 7 jours
    }
    
    // Getters & Setters
    public UUID getSignatureId() {
        return signatureId;
    }
    
    public void setSignatureId(UUID signatureId) {
        this.signatureId = signatureId;
    }
    
    public Application getApplication() {
        return application;
    }
    
    public void setApplication(Application application) {
        this.application = application;
    }
    
    public Candidate getCandidate() {
        return candidate;
    }
    
    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }
    
    public Recruiter getRecruiter() {
        return recruiter;
    }
    
    public void setRecruiter(Recruiter recruiter) {
        this.recruiter = recruiter;
    }
    
    public String getContractUrl() {
        return contractUrl;
    }
    
    public void setContractUrl(String contractUrl) {
        this.contractUrl = contractUrl;
    }
    
    public LocalDateTime getSignedAt() {
        return signedAt;
    }
    
    public void setSignedAt(LocalDateTime signedAt) {
        this.signedAt = signedAt;
    }
    
    public String getSignatureIp() {
        return signatureIp;
    }
    
    public void setSignatureIp(String signatureIp) {
        this.signatureIp = signatureIp;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
