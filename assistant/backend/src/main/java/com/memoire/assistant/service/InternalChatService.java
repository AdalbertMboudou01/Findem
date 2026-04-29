package com.memoire.assistant.service;

import com.memoire.assistant.model.InternalChat;
import com.memoire.assistant.model.Recruiter;
import com.memoire.assistant.model.Company;
import com.memoire.assistant.repository.InternalChatRepository;
import com.memoire.assistant.repository.RecruiterRepository;
import com.memoire.assistant.repository.CompanyRepository;
import com.memoire.assistant.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InternalChatService {

    @Autowired private InternalChatRepository internalChatRepository;
    @Autowired private RecruiterRepository recruiterRepository;
    @Autowired private CompanyRepository companyRepository;

    public List<InternalChat> getGeneralMessages(UUID companyId) {
        return internalChatRepository.findGeneralMessages(companyId);
    }

    public List<InternalChat> getDepartmentMessages(UUID departmentId) {
        return internalChatRepository.findDepartmentMessages(departmentId);
    }

    public InternalChat sendGeneralMessage(String message) {
        UUID recruiterId = TenantContext.getRecruiterId();
        UUID companyId = TenantContext.getCompanyId();

        Recruiter sender = recruiterRepository.findById(recruiterId)
            .orElseThrow(() -> new RuntimeException("Recruteur non trouvé"));
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        InternalChat chat = new InternalChat();
        chat.setSender(sender);
        chat.setCompany(company);
        chat.setMessage(message);
        chat.setChannelType("GENERAL");
        chat.setMessageType("TEXT");
        chat.setIsRead(false);
        return internalChatRepository.save(chat);
    }

    public InternalChat sendDepartmentMessage(UUID departmentId, String message) {
        UUID recruiterId = TenantContext.getRecruiterId();
        UUID companyId = TenantContext.getCompanyId();

        Recruiter sender = recruiterRepository.findById(recruiterId)
            .orElseThrow(() -> new RuntimeException("Recruteur non trouvé"));
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        InternalChat chat = new InternalChat();
        chat.setSender(sender);
        chat.setCompany(company);
        chat.setDepartmentId(departmentId);
        chat.setMessage(message);
        chat.setChannelType("DEPARTMENT");
        chat.setMessageType("TEXT");
        chat.setIsRead(false);
        return internalChatRepository.save(chat);
    }
}
