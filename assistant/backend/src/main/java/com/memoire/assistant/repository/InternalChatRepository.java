package com.memoire.assistant.repository;

import com.memoire.assistant.model.InternalChat;
import com.memoire.assistant.model.Recruiter;
import com.memoire.assistant.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface InternalChatRepository extends JpaRepository<InternalChat, UUID> {
    
    List<InternalChat> findByCompany_CompanyId(UUID companyId);
    
    @Query("SELECT c FROM InternalChat c WHERE (c.sender.recruiterId = :recruiterId OR c.recipient.recruiterId = :recruiterId) AND c.company.companyId = :companyId ORDER BY c.createdAt DESC")
    List<InternalChat> findChatsByRecruiterAndCompany(@Param("recruiterId") UUID recruiterId, @Param("companyId") UUID companyId);
    
    @Query("SELECT c FROM InternalChat c WHERE c.recipient.recruiterId = :recruiterId AND c.isRead = false ORDER BY c.createdAt DESC")
    List<InternalChat> findUnreadChatsByRecipient(@Param("recruiterId") UUID recruiterId);
    
    List<InternalChat> findByChannel(String channel);
    
    @Query("SELECT c FROM InternalChat c WHERE c.channel = :channel AND c.company.companyId = :companyId ORDER BY c.createdAt DESC")
    List<InternalChat> findChatsByChannelAndCompany(@Param("channel") String channel, @Param("companyId") UUID companyId);
    
    @Query("SELECT c FROM InternalChat c WHERE c.createdAt BETWEEN :start AND :end AND c.company.companyId = :companyId")
    List<InternalChat> findChatsByDateRangeAndCompany(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("companyId") UUID companyId);
    
    @Query("SELECT COUNT(c) FROM InternalChat c WHERE c.recipient.recruiterId = :recruiterId AND c.isRead = false")
    Long countUnreadChatsByRecipient(@Param("recruiterId") UUID recruiterId);

    @Query("SELECT c FROM InternalChat c WHERE c.company.companyId = :companyId AND c.channelType = 'GENERAL' ORDER BY c.createdAt ASC")
    List<InternalChat> findGeneralMessages(@Param("companyId") UUID companyId);

    @Query("SELECT c FROM InternalChat c WHERE c.departmentId = :departmentId AND c.channelType = 'DEPARTMENT' ORDER BY c.createdAt ASC")
    List<InternalChat> findDepartmentMessages(@Param("departmentId") UUID departmentId);
}
