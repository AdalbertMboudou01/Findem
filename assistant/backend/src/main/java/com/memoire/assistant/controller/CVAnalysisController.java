package com.memoire.assistant.controller;

import com.memoire.assistant.dto.CVAnalysisDTO;
import com.memoire.assistant.service.CVAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cv-analysis")
@Tag(name = "CV Analysis", description = "API pour l'analyse et le parsing des CV")
public class CVAnalysisController {
    
    @Autowired
    private CVAnalysisService cvAnalysisService;
    
    @PostMapping("/upload/{applicationId}")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Uploader et analyser un CV", description = "Upload un fichier CV et lance l'analyse automatique")
    public ResponseEntity<Map<String, Object>> uploadAndAnalyzeCV(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId,
            @Parameter(description = "Fichier CV") @RequestParam("file") MultipartFile file) {
        try {
            CVAnalysisDTO analysis = cvAnalysisService.analyzeCV(applicationId, file);
            
            return ResponseEntity.ok(Map.of(
                "success", analysis.isParsingSuccessful(),
                "message", analysis.isParsingSuccessful() ? "CV analysé avec succès" : "Erreur lors de l'analyse",
                "analysis", analysis,
                "overallScore", analysis.getOverallScore(),
                "technicalScore", analysis.getTechnicalScore(),
                "experienceScore", analysis.getExperienceScore(),
                "completenessScore", analysis.getCompletenessScore(),
                "jobMatch", analysis.getOverallJobMatch()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Erreur lors de l'upload: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/analysis/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Obtenir l'analyse CV", description = "Récupère l'analyse complète du CV pour une candidature")
    public ResponseEntity<Map<String, Object>> getCVAnalysis(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            // Pour l'instant, simulation - en production, récupérer depuis la base de données
            CVAnalysisDTO analysis = new CVAnalysisDTO(applicationId.toString(), "Candidat Test");
            analysis.setParsingSuccessful(true);
            analysis.setOverallScore(0.8);
            analysis.setTechnicalScore(0.9);
            analysis.setExperienceScore(0.7);
            analysis.setCompletenessScore(0.85);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "analysis", analysis,
                "summary", Map.of(
                    "totalSkills", analysis.getTechnicalSkills() != null ? analysis.getTechnicalSkills().size() : 0,
                    "totalExperience", analysis.getTotalExperienceYears(),
                    "experienceLevel", analysis.getExperienceLevel(),
                    "jobMatch", analysis.getOverallJobMatch()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Analyse non trouvée: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/skills/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Obtenir les compétences techniques", description = "Extrait et retourne uniquement les compétences techniques du CV")
    public ResponseEntity<Map<String, Object>> getTechnicalSkills(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            // Simulation - en production, récupérer depuis la base de données
            Map<String, Object> skills = Map.of(
                "programmingLanguages", java.util.List.of("JAVA", "PYTHON", "JAVASCRIPT"),
                "frameworks", java.util.List.of("SPRING BOOT", "REACT", "HIBERNATE"),
                "databases", java.util.List.of("POSTGRESQL", "MYSQL", "REDIS"),
                "tools", java.util.List.of("GIT", "DOCKER", "JENKINS", "AWS"),
                "allSkills", java.util.List.of("JAVA", "PYTHON", "JAVASCRIPT", "SPRING BOOT", "REACT", "HIBERNATE", "POSTGRESQL", "MYSQL", "REDIS", "GIT", "DOCKER", "JENKINS", "AWS"),
                "technicalScore", 0.9
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "skills", skills,
                "totalSkills", ((java.util.List<?>) skills.get("allSkills")).size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Compétences non trouvées: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/experience/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Obtenir l'expérience", description = "Retourne le détail de l'expérience professionnelle")
    public ResponseEntity<Map<String, Object>> getExperience(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            // Simulation - en production, récupérer depuis la base de données
            Map<String, Object> experienceData = Map.of(
                "totalYears", 3,
                "experienceLevel", "INTERMEDIATE",
                "experienceScore", 0.7,
                "companies", java.util.List.of("Société A", "Entreprise B"),
                "positions", java.util.List.of("Développeur Java", "Stagiaire Développement"),
                "currentPosition", "Développeur Java",
                "careerProgression", "Progression normale avec augmentation de responsabilités"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "experience", experienceData
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Expérience non trouvée: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/projects/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Obtenir les projets", description = "Retourne la liste des projets réalisés")
    public ResponseEntity<Map<String, Object>> getProjects(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            // Simulation - en production, récupérer depuis la base de données
            java.util.List<Map<String, Object>> projects = java.util.List.of(
                Map.of(
                    "name", "Application de gestion de tâches",
                    "description", "Application web pour la gestion de tâches personnelles",
                    "technologies", java.util.List.of("SPRING BOOT", "REACT", "POSTGRESQL", "DOCKER"),
                    "role", "Développeur full-stack",
                    "duration", "6 mois",
                    "achievements", java.util.List.of("API RESTful avec Swagger", "Déploiement AWS")
                ),
                Map.of(
                    "name", "API de microservices",
                    "description", "API RESTful pour la gestion des utilisateurs",
                    "technologies", java.util.List.of("JAVA", "SPRING CLOUD", "MONGODB"),
                    "role", "Développeur backend",
                    "duration", "3 mois",
                    "achievements", java.util.List.of("Tests unitaires", "Documentation")
                )
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "projects", projects,
                "totalProjects", projects.size(),
                "technologiesUsed", java.util.List.of("SPRING BOOT", "REACT", "POSTGRESQL", "DOCKER", "JAVA", "SPRING CLOUD", "MONGODB")
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Projets non trouvés: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/match/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Obtenir la correspondance avec le poste", description = "Calcule et retourne le score de correspondance avec le poste")
    public ResponseEntity<Map<String, Object>> getJobMatch(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            // Simulation - en production, récupérer depuis la base de données
            Map<String, Object> matchData = Map.of(
                "overallMatch", 0.85,
                "matchLevel", "HIGH",
                "skillMatches", Map.of(
                    "JAVA", 1.0,
                    "SPRING BOOT", 1.0,
                    "REACT", 0.8,
                    "POSTGRESQL", 0.9,
                    "DOCKER", 0.7
                ),
                "experienceMatch", 0.8,
                "educationMatch", 0.9,
                "recommendations", java.util.List.of(
                    "Profil technique très pertinent",
                    "Expérience adéquate pour le poste",
                    "Bonnes bases théoriques"
                ),
                "missingSkills", java.util.List.of("KUBERNETES", "AWS ADVANCED"),
                "strengths", java.util.List.of("Java expert", "Spring Boot", "React")
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "match", matchData
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Correspondance non trouvée: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/summary/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Obtenir un résumé de l'analyse CV", description = "Retourne un résumé concis de l'analyse CV")
    public ResponseEntity<Map<String, Object>> getCVSummary(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            // Simulation - en production, récupérer depuis la base de données
            Map<String, Object> summary = java.util.Map.ofEntries(
                java.util.Map.entry("candidateName", "Jean Dupont"),
                java.util.Map.entry("overallScore", 0.82),
                java.util.Map.entry("grade", "A"),
                java.util.Map.entry("keyHighlights", java.util.List.of(
                    "3 ans d'expérience en développement Java",
                    "Compétences solides en Spring Boot et React",
                    "Expérience avec PostgreSQL et Docker",
                    "Projets pertinents et bien documentés"
                )),
                java.util.Map.entry("topSkills", java.util.List.of("JAVA", "SPRING BOOT", "REACT", "POSTGRESQL")),
                java.util.Map.entry("experienceLevel", "INTERMEDIATE"),
                java.util.Map.entry("jobMatch", 0.85),
                java.util.Map.entry("recommendation", "ENTRETIEN_RECOMMANDÉ"),
                java.util.Map.entry("missingInfo", java.util.List.of("Certifications formelles")),
                java.util.Map.entry("strengths", java.util.List.of("Profil technique complet", "Bonne expérience", "Projets variés")),
                java.util.Map.entry("areasForImprovement", java.util.List.of("Certifications cloud", "Expérience senior"))
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "summary", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Résumé non trouvé: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/validate/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Valider l'analyse CV", description = "Valide manuellement l'analyse et corrige si nécessaire")
    public ResponseEntity<Map<String, Object>> validateCVAnalysis(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId,
            @Parameter(description = "Données corrigées") @RequestBody CVAnalysisDTO correctedAnalysis) {
        try {
            // En production, sauvegarder les corrections en base de données
            correctedAnalysis.setApplicationId(applicationId.toString());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Analyse CV validée et sauvegardée",
                "validatedAt", java.time.LocalDateTime.now(),
                "overallScore", correctedAnalysis.getOverallScore()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Erreur lors de la validation: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/download/{applicationId}")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Télécharger le CV original", description = "Permet de télécharger le fichier CV original")
    public ResponseEntity<Map<String, Object>> downloadCV(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            // En production, récupérer le fichier depuis le stockage
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "CV disponible pour téléchargement",
                "downloadUrl", "/api/files/cv/" + applicationId.toString(),
                "fileName", "cv_" + applicationId.toString() + ".pdf",
                "fileSize", "2.5MB"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "CV non trouvé: " + e.getMessage()
            ));
        }
    }
}
