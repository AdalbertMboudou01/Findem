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
@Table(name = "internal_chats")
public class InternalChat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID chatId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Recruiter sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = true)
    private Recruiter recipient;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "channel_type", nullable = false)
    private String channelType = "GENERAL";
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "channel")
    private String channel; // GENERAL, RECRUITMENT, TECHNICAL, etc.
    
    @Column(name = "message_type", nullable = false)
    private String messageType; // TEXT, FILE, SYSTEM
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @Column(name = "reply_to_id")
    private UUID replyToId;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructeurs
    public InternalChat() {
        this.createdAt = LocalDateTime.now();
        this.messageType = "TEXT";
    }
    
    public InternalChat(Recruiter sender, Recruiter recipient, Company company, String message) {
        this();
        this.sender = sender;
        this.recipient = recipient;
        this.company = company;
        this.message = message;
    }
    
    // Getters & Setters
    public UUID getChatId() {
        return chatId;
    }
    
    public void setChatId(UUID chatId) {
        this.chatId = chatId;
    }
    
    public Recruiter getSender() {
        return sender;
    }
    
    public void setSender(Recruiter sender) {
        this.sender = sender;
    }
    
    public Recruiter getRecipient() {
        return recipient;
    }
    
    public void setRecipient(Recruiter recipient) {
        this.recipient = recipient;
    }
    
    public Company getCompany() {
        return company;
    }
    
    public void setCompany(Company company) {
        this.company = company;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getChannel() {
        return channel;
    }
    
    public void setChannel(String channel) {
        this.channel = channel;
    }
    
    public String getMessageType() {
        return messageType;
    }
    
    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public Boolean getIsRead() {
        return isRead;
    }
    
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
    
    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
    }

    public String getChannelType() {
        return channelType;
    }

    public void setChannelType(String channelType) {
        this.channelType = channelType;
    }

    public UUID getReplyToId() {
        return replyToId;
    }
    
    public void setReplyToId(UUID replyToId) {
        this.replyToId = replyToId;
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
