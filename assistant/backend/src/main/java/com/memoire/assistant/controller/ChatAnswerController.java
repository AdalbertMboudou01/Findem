package com.memoire.assistant.controller;

import com.memoire.assistant.dto.ChatAnswerAnalysisDTO;
import com.memoire.assistant.dto.ChatAnswerDTO;
import com.memoire.assistant.service.ChatAnswerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat-answers")
@Tag(name = "Chat Answers", description = "API pour la gestion et l'analyse des réponses du chatbot")
public class ChatAnswerController {
    
    @Autowired
    private ChatAnswerService chatAnswerService;
    
    @PostMapping("/submit")
    @Operation(summary = "Soumettre une réponse du chatbot", description = "Enregistre une réponse du candidat à une question du chatbot")
    public ResponseEntity<Map<String, String>> submitAnswer(@Valid @RequestBody ChatAnswerDTO chatAnswerDTO) {
        try {
            // TODO: Implémenter la sauvegarde de la réponse
            return ResponseEntity.ok(Map.of(
                "message", "Réponse enregistrée avec succès",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Erreur lors de l'enregistrement: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
    
    @PostMapping("/submit-batch")
    @Operation(summary = "Soumettre plusieurs réponses", description = "Enregistre un lot de réponses du candidat")
    public ResponseEntity<Map<String, String>> submitAnswers(@Valid @RequestBody List<ChatAnswerDTO> chatAnswers) {
        try {
            // TODO: Implémenter la sauvegarde en lot
            return ResponseEntity.ok(Map.of(
                "message", chatAnswers.size() + " réponses enregistrées avec succès",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Erreur lors de l'enregistrement: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
    
    @GetMapping("/analyze/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Analyser les réponses d'une candidature", description = "Analyse complète des réponses du chatbot pour une candidature donnée")
    public ResponseEntity<ChatAnswerAnalysisDTO> analyzeAnswers(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            ChatAnswerAnalysisDTO analysis = chatAnswerService.analyzeChatAnswers(applicationId);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @GetMapping("/extract/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Extraire les réponses structurées", description = "Extrait et structure les réponses du chatbot par catégorie")
    public ResponseEntity<Map<String, String>> extractStructuredAnswers(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            Map<String, String> structuredAnswers = chatAnswerService.extractStructuredAnswers(applicationId);
            return ResponseEntity.ok(structuredAnswers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @GetMapping("/validate/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Valider la complétude des réponses", description = "Vérifie si les réponses sont complètes et exploitables")
    public ResponseEntity<Map<String, Object>> validateCompleteness(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            boolean isComplete = chatAnswerService.validateAnswerCompleteness(applicationId);
            ChatAnswerAnalysisDTO analysis = chatAnswerService.analyzeChatAnswers(applicationId);
            
            return ResponseEntity.ok(Map.of(
                "isComplete", isComplete,
                "completenessScore", analysis.getCompletenessScore(),
                "missingInformation", analysis.getMissingInformation(),
                "recommendedAction", analysis.getRecommendedAction()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @GetMapping("/summary/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Obtenir un résumé des réponses", description = "Génère un résumé textuel des réponses du candidat")
    public ResponseEntity<Map<String, Object>> getAnswersSummary(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            ChatAnswerAnalysisDTO analysis = chatAnswerService.analyzeChatAnswers(applicationId);
            
            return ResponseEntity.ok(
                Map.ofEntries(
                    Map.entry("applicationId", applicationId.toString()),
                    Map.entry("motivationLevel", analysis.getMotivationLevel()),
                    Map.entry("technicalLevel", analysis.getTechnicalLevel()),
                    Map.entry("hasProjectDetails", analysis.isHasProjectDetails()),
                    Map.entry("hasClearAvailability", analysis.isHasClearAvailability()),
                    Map.entry("locationMatch", analysis.getLocationMatch()),
                    Map.entry("completenessScore", analysis.getCompletenessScore()),
                    Map.entry("recommendedAction", analysis.getRecommendedAction()),
                    Map.entry("motivationSummary", analysis.getMotivationSummary()),
                    Map.entry("mentionedProjects", analysis.getMentionedProjects()),
                    Map.entry("technicalSkills", analysis.getTechnicalSkills()),
                    Map.entry("missingInformation", analysis.getMissingInformation()),
                    Map.entry("inconsistencies", analysis.getInconsistencies())
                )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
