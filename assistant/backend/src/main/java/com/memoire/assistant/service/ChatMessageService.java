package com.memoire.assistant.service;

import com.memoire.assistant.dto.ChatAnswerDTO;
import com.memoire.assistant.model.ChatMessage;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.repository.ChatMessageRepository;
import com.memoire.assistant.repository.ApplicationRepository;
import com.memoire.assistant.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.UUID;

@Service
public class ChatMessageService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    public ChatMessage saveAnswer(ChatAnswerDTO answerDTO) {
        // Vérifier que l'application et le candidat existent
        Application application = null;
        if (answerDTO.getApplicationId() != null) {
            application = applicationRepository.findById(answerDTO.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application non trouvée"));
        }
        
        Candidate candidate = null;
        if (answerDTO.getCandidateId() != null) {
            candidate = candidateRepository.findById(answerDTO.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidat non trouvé"));
        }
        
        // Créer et sauvegarder le message
        ChatMessage message = new ChatMessage(
            application, 
            candidate, 
            answerDTO.getQuestionKey(), 
            answerDTO.getQuestionText(), 
            answerDTO.getAnswer(), 
            "ANSWER"
        );
        
        return chatMessageRepository.save(message);
    }
    
    public List<ChatMessage> getMessagesByApplication(UUID applicationId) {
        return chatMessageRepository.findByApplication_ApplicationId(applicationId);
    }
    
    public List<ChatMessage> getMessagesByCandidate(UUID candidateId) {
        return chatMessageRepository.findByCandidate_CandidateId(candidateId);
    }
    
    public List<ChatMessage> getAnswersByApplication(UUID applicationId) {
        return chatMessageRepository.findByApplication_ApplicationIdAndMessageType(applicationId, "ANSWER");
    }
    
    public void deleteMessagesByApplication(UUID applicationId) {
        chatMessageRepository.deleteByApplication_ApplicationId(applicationId);
    }
    
    public boolean hasAllRequiredAnswers(UUID applicationId, List<String> requiredQuestionKeys) {
        List<ChatMessage> answers = getAnswersByApplication(applicationId);
        
        return requiredQuestionKeys.stream().allMatch(requiredKey -> 
            answers.stream().anyMatch(answer -> requiredKey.equals(answer.getQuestionKey()))
        );
    }
}
