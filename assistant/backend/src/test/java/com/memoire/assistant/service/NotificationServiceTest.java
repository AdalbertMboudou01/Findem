package com.memoire.assistant.service;

import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.model.Company;
import com.memoire.assistant.repository.ApplicationRepository;
import com.memoire.assistant.repository.CandidateRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = {
    com.memoire.assistant.AssistantPrequalificationBackendApplication.class,
    TestNotificationService.class
})
@TestPropertySource(properties = {
    "app.email.host=smtp.test.com",
    "app.email.port=587",
    "app.email.username=test@example.com",
    "app.email.password=test",
    "app.email.from=test@example.com",
    "app.frontend.url=http://localhost:3100"
})
public class NotificationServiceTest {
    
    @MockBean
    private ApplicationRepository applicationRepository;
    
    @MockBean
    private CandidateRepository candidateRepository;
    
    @Autowired
    private TestNotificationService notificationService;
    
    @Test
    @DisplayName("Devrait envoyer une notification de mise à jour de statut")
    void testSendApplicationStatusUpdate_Success() {
        // Given
        UUID applicationId = UUID.randomUUID();
        String newStatus = "ENTRETIEN";
        
        // Créer un mock d'application qui retourne des valeurs non nulles
        Application application = mock(Application.class);
        when(application.getApplicationId()).thenReturn(applicationId);
        when(application.getCandidate()).thenReturn(createMockCandidate());
        when(application.getJob()).thenReturn(mock(Job.class));
        when(application.getJob().getTitle()).thenReturn("Développeur Java");
        when(application.getJob().getCompany()).thenReturn(mock(com.memoire.assistant.model.Company.class));
        when(application.getJob().getCompany().getName()).thenReturn("Tech Corp");
        when(application.getCreatedAt()).thenReturn(new java.util.Date());
        
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        
        // When & Then
        assertDoesNotThrow(() -> notificationService.sendApplicationStatusUpdate(applicationId, newStatus));
        
        verify(applicationRepository).findById(applicationId);
    }
    
    @Test
    @DisplayName("Devrait lancer une exception si application non trouvée")
    void testSendApplicationStatusUpdate_ApplicationNotFound() {
        // Given
        UUID applicationId = UUID.randomUUID();
        String newStatus = "ENTRETIEN";
        
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> notificationService.sendApplicationStatusUpdate(applicationId, newStatus));
        
        assertEquals("Application non trouvée", exception.getMessage());
        verify(applicationRepository).findById(applicationId);
    }
    
    @Test
    @DisplayName("Devrait envoyer une notification d'invitation entretien")
    void testSendInterviewInvitation_Success() {
        // Given
        UUID applicationId = UUID.randomUUID();
        String interviewDetails = "2024-12-15 à 10h00";
        
        // Mock d'application complète
        Application application = mock(Application.class);
        when(application.getApplicationId()).thenReturn(applicationId);
        when(application.getCandidate()).thenReturn(createMockCandidate());
        when(application.getJob()).thenReturn(mock(Job.class));
        when(application.getJob().getTitle()).thenReturn("Développeur Java");
        when(application.getJob().getCompany()).thenReturn(mock(com.memoire.assistant.model.Company.class));
        when(application.getJob().getCompany().getName()).thenReturn("Tech Corp");
        
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        
        // When & Then
        assertDoesNotThrow(() -> notificationService.sendInterviewInvitation(applicationId, interviewDetails));
        
        verify(applicationRepository).findById(applicationId);
    }
    
    @Test
    @DisplayName("Devrait envoyer une notification de rejet")
    void testSendRejectionNotification_Success() {
        // Given
        UUID applicationId = UUID.randomUUID();
        
        // Mock d'application complète
        Application application = mock(Application.class);
        when(application.getApplicationId()).thenReturn(applicationId);
        when(application.getCandidate()).thenReturn(createMockCandidate());
        when(application.getJob()).thenReturn(mock(Job.class));
        when(application.getJob().getTitle()).thenReturn("Développeur Java");
        when(application.getJob().getCompany()).thenReturn(mock(com.memoire.assistant.model.Company.class));
        when(application.getJob().getCompany().getName()).thenReturn("Tech Corp");
        
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        
        // When & Then
        assertDoesNotThrow(() -> notificationService.sendRejectionNotification(applicationId));
        
        verify(applicationRepository).findById(applicationId);
    }
    
    @Test
    @DisplayName("Devrait envoyer une notification au vivier")
    void testSendPoolNotification_Success() {
        // Given
        UUID candidateId = UUID.randomUUID();
        String jobTitle = "Développeur Java";
        Candidate candidate = createMockCandidate();
        
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        
        // When & Then
        assertDoesNotThrow(() -> notificationService.sendPoolNotification(candidateId, jobTitle));
        
        verify(candidateRepository).findById(candidateId);
    }
    
    @Test
    @DisplayName("Devrait lancer une exception si candidat non trouvé")
    void testSendPoolNotification_CandidateNotFound() {
        // Given
        UUID candidateId = UUID.randomUUID();
        String jobTitle = "Développeur Java";
        
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.empty());
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> notificationService.sendPoolNotification(candidateId, jobTitle));
        
        assertEquals("Candidat non trouvé", exception.getMessage());
        verify(candidateRepository).findById(candidateId);
    }
    
    private Candidate createMockCandidate() {
        Candidate candidate = new Candidate();
        candidate.setCandidateId(UUID.randomUUID());
        candidate.setFirstName("John");
        candidate.setLastName("Doe");
        candidate.setEmail("john.doe@example.com");
        return candidate;
    }
}
