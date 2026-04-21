package com.memoire.assistant.service;

import com.memoire.assistant.dto.ChatbotQuestionDTO;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatbotQuestionServiceTest {
    
    @Mock
    private JobRepository jobRepository;
    
    @InjectMocks
    private ChatbotQuestionService chatbotQuestionService;
    
    @Test
    @DisplayName("Devrait générer des questions pour un poste backend")
    void testGetQuestionsForJob_Backend() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, "Développeur Backend Java");
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        ChatbotQuestionDTO q1 = result.get(0);
        assertEquals("motivation", q1.getId());
        assertEquals("Pourquoi souhaitez-vous ce poste de développeur backend ?", q1.getLabel());
        assertEquals("textarea", q1.getType());
        
        ChatbotQuestionDTO q2 = result.get(1);
        assertEquals("techno", q2.getId());
        assertEquals("Quelles technologies backend maîtrisez-vous ?", q2.getLabel());
        assertEquals("text", q2.getType());
        
        ChatbotQuestionDTO q3 = result.get(2);
        assertEquals("projet", q3.getId());
        assertEquals("Décrivez un projet technique dont vous êtes fier.", q3.getLabel());
        assertEquals("textarea", q3.getType());
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait générer des questions pour un poste frontend")
    void testGetQuestionsForJob_Frontend() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, "Développeur Frontend React");
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        ChatbotQuestionDTO q1 = result.get(0);
        assertEquals("motivation", q1.getId());
        assertEquals("Pourquoi souhaitez-vous ce poste de développeur frontend ?", q1.getLabel());
        assertEquals("textarea", q1.getType());
        
        ChatbotQuestionDTO q2 = result.get(1);
        assertEquals("framework", q2.getId());
        assertEquals("Quel framework JS préférez-vous ?", q2.getLabel());
        assertEquals("text", q2.getType());
        
        ChatbotQuestionDTO q3 = result.get(2);
        assertEquals("projet", q3.getId());
        assertEquals("Décrivez un projet web que vous avez réalisé.", q3.getLabel());
        assertEquals("textarea", q3.getType());
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait générer des questions génériques pour un poste non spécifique")
    void testGetQuestionsForJob_Generic() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, "Développeur Full Stack");
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        ChatbotQuestionDTO q1 = result.get(0);
        assertEquals("motivation", q1.getId());
        assertEquals("Pourquoi postuler à cette alternance ?", q1.getLabel());
        assertEquals("textarea", q1.getType());
        
        ChatbotQuestionDTO q2 = result.get(1);
        assertEquals("disponibilite", q2.getId());
        assertEquals("Quelle est votre disponibilité ?", q2.getLabel());
        assertEquals("text", q2.getType());
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait gérer le titre de job null")
    void testGetQuestionsForJob_NullTitle() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, null);
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size()); // Questions génériques
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait gérer le titre de job vide")
    void testGetQuestionsForJob_EmptyTitle() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, "");
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size()); // Questions génériques
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait retourner une liste vide si job non trouvé")
    void testGetQuestionsForJob_JobNotFound() {
        // Given
        UUID jobId = UUID.randomUUID();
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.empty());
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
        assertTrue(result.isEmpty());
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait être insensible à la casse pour la détection backend")
    void testGetQuestionsForJob_BackendCaseInsensitive() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, "Développeur BACKEND Java");
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(3, result.size()); // Questions backend
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait être insensible à la casse pour la détection frontend")
    void testGetQuestionsForJob_FrontendCaseInsensitive() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, "Développeur FRONTEND React");
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(3, result.size()); // Questions frontend
        
        verify(jobRepository).findById(jobId);
    }
    
    @Test
    @DisplayName("Devrait gérer les différents types d'input")
    void testGetQuestionsForJob_InputTypes() {
        // Given
        UUID jobId = UUID.randomUUID();
        Job job = createMockJob(jobId, "Développeur Backend Java");
        
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        
        // When
        List<ChatbotQuestionDTO> result = chatbotQuestionService.getQuestionsForJob(jobId);
        
        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        // Vérifier les types d'input
        assertEquals("textarea", result.get(0).getType()); // motivation
        assertEquals("text", result.get(1).getType());     // techno
        assertEquals("textarea", result.get(2).getType()); // projet
        
        verify(jobRepository).findById(jobId);
    }
    
    // Méthodes utilitaires pour les tests
    private Job createMockJob(UUID jobId, String title) {
        Job job = new Job();
        job.setJobId(jobId);
        job.setTitle(title);
        job.setDescription("Description du poste");
        job.setLocation("Paris");
        return job;
    }
}
