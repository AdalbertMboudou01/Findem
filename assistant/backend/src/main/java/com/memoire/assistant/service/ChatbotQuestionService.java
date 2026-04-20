package com.memoire.assistant.service;

import com.memoire.assistant.dto.ChatbotQuestionDTO;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChatbotQuestionService {
    @Autowired
    private JobRepository jobRepository;

    public List<ChatbotQuestionDTO> getQuestionsForJob(UUID jobId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isPresent()) {
            Job job = jobOpt.get();
            // Pour le prototype, on retourne des questions codées en dur selon le titre du poste
            if (job.getTitle() != null && job.getTitle().toLowerCase().contains("backend")) {
                return Arrays.asList(
                        new ChatbotQuestionDTO("motivation", "Pourquoi souhaitez-vous ce poste de développeur backend ?", "textarea"),
                        new ChatbotQuestionDTO("techno", "Quelles technologies backend maîtrisez-vous ?", "text"),
                        new ChatbotQuestionDTO("projet", "Décrivez un projet technique dont vous êtes fier.", "textarea")
                );
            } else if (job.getTitle() != null && job.getTitle().toLowerCase().contains("frontend")) {
                return Arrays.asList(
                        new ChatbotQuestionDTO("motivation", "Pourquoi souhaitez-vous ce poste de développeur frontend ?", "textarea"),
                        new ChatbotQuestionDTO("framework", "Quel framework JS préférez-vous ?", "text"),
                        new ChatbotQuestionDTO("projet", "Décrivez un projet web que vous avez réalisé.", "textarea")
                );
            } else {
                // Questions génériques
                return Arrays.asList(
                        new ChatbotQuestionDTO("motivation", "Pourquoi postuler à cette alternance ?", "textarea"),
                        new ChatbotQuestionDTO("disponibilite", "Quelle est votre disponibilité ?", "text")
                );
            }
        }
        // Si l'offre n'existe pas, retourner une liste vide
        return Collections.emptyList();
    }
}
