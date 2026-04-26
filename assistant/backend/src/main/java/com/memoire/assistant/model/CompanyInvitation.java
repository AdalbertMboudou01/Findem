package com.memoire.assistant.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "company_invitations")
public class CompanyInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID invitationId;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, unique = true)
    private String tokenHash;

    private Date expiresAt;
    private Date acceptedAt;
    private Date createdAt;

    @ManyToOne
    @JoinColumn(name = "invited_by_recruiter_id")
    private Recruiter invitedByRecruiter;

    public UUID getInvitationId() {
        return invitationId;
    }

    public void setInvitationId(UUID invitationId) {
        this.invitationId = invitationId;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Date getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Date acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Recruiter getInvitedByRecruiter() {
        return invitedByRecruiter;
    }

    public void setInvitedByRecruiter(Recruiter invitedByRecruiter) {
        this.invitedByRecruiter = invitedByRecruiter;
    }
}
