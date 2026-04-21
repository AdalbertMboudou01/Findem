package com.memoire.assistant.service;

import com.memoire.assistant.dto.ChatAnswerAnalysisDTO;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.ChatAnswer;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.ChatAnswerRepository;
import com.memoire.assistant.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.stream.Collectors;

@Service
public class ChatAnswerService {
    
    @Autowired
    private ChatAnswerRepository chatAnswerRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    // Mots-clés pour l'analyse de motivation
    private static final Set<String> MOTIVATION_KEYWORDS_HIGH = Set.of(
        "passionné", "passion", "passionnée", "motivé", "motivée", "enthousiaste",
        "déterminé", "déterminée", "ambitieux", "ambitieuse", "curieux", "curieuse",
        "apprentissage", "apprendre", "découvrir", "défis", "challenge", "innovant"
    );
    
    private static final Set<String> MOTIVATION_KEYWORDS_MEDIUM = Set.of(
        "intéressé", "intéressée", "attiré", "attirée", "opportunité", "expérience",
        "développer", "compétences", "carrière", "professionnel", "professionnelle"
    );
    
    // Mots-clés techniques
    private static final Set<String> TECHNICAL_KEYWORDS = Set.of(
        "java", "javascript", "python", "react", "vue", "angular", "spring", "node",
        "docker", "kubernetes", "aws", "azure", "git", "github", "sql", "mongodb",
        "api", "rest", "microservices", "frontend", "backend", "fullstack", "devops"
    );
    
    // Mots-clés de disponibilité
    private static final Set<String> AVAILABILITY_IMMEDIATE = Set.of(
        "immédiat", "immédiate", "tout de suite", "maintenant", "disponible", "sans délai"
    );
    
    private static final Set<String> AVAILABILITY_FUTURE = Set.of(
        "mois", "semaines", "année", "bientôt", "prochainement", "fin", "après"
    );
    
    // Mots-clés de rythme d'alternance
    private static final Set<String> RHYTHM_FULL_TIME = Set.of(
        "3 jours", "4 jours", "semaine", "plein temps", "temps plein", "classique"
    );
    
    private static final Set<String> RHYTHM_PART_TIME = Set.of(
        "2 jours", "1 jour", "mi-temps", "partiel", "réduit"
    );
    
    /**
     * Analyse complète des réponses du chatbot pour une candidature
     */
    public ChatAnswerAnalysisDTO analyzeChatAnswers(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));
        
        List<ChatAnswer> answers = chatAnswerRepository.findByApplication_ApplicationId(applicationId);
        
        ChatAnswerAnalysisDTO analysis = new ChatAnswerAnalysisDTO(applicationId.toString());
        
        // Analyser chaque dimension
        analyzeMotivation(answers, analysis);
        analyzeTechnicalProfile(answers, analysis);
        analyzeAvailability(answers, analysis);
        analyzeLocation(answers, analysis, application.getJob());
        
        // Calculer le score de complétude
        calculateCompletenessScore(answers, analysis);
        
        // Détecter les incohérences
        detectInconsistencies(answers, analysis);
        
        // Recommander une action
        recommendAction(analysis);
        
        return analysis;
    }
    
    /**
     * Analyse de la motivation du candidat
     */
    private void analyzeMotivation(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis) {
        List<String> motivationKeywords = new ArrayList<>();
        int highScore = 0;
        int mediumScore = 0;
        StringBuilder motivationText = new StringBuilder();
        
        for (ChatAnswer answer : answers) {
            String text = answer.getAnswerText().toLowerCase();
            motivationText.append(answer.getAnswerText()).append(" ");
            
            // Compter les mots-clés
            for (String keyword : MOTIVATION_KEYWORDS_HIGH) {
                if (text.contains(keyword)) {
                    highScore++;
                    motivationKeywords.add(keyword);
                }
            }
            
            for (String keyword : MOTIVATION_KEYWORDS_MEDIUM) {
                if (text.contains(keyword)) {
                    mediumScore++;
                    motivationKeywords.add(keyword);
                }
            }
        }
        
        // Déterminer le niveau de motivation
        if (highScore >= 3) {
            analysis.setMotivationLevel("HIGH");
        } else if (highScore >= 1 || mediumScore >= 2) {
            analysis.setMotivationLevel("MEDIUM");
        } else {
            analysis.setMotivationLevel("LOW");
        }
        
        // Vérifier si la motivation est spécifique
        analysis.setHasSpecificMotivation(highScore >= 2);
        
        // Générer un résumé
        analysis.setMotivationSummary(generateMotivationSummary(motivationText.toString()));
        analysis.setMotivationKeywords(motivationKeywords.stream().distinct().collect(Collectors.toList()));
    }
    
    /**
     * Analyse du profil technique et des projets
     */
    private void analyzeTechnicalProfile(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis) {
        List<String> technicalSkills = new ArrayList<>();
        List<String> mentionedProjects = new ArrayList<>();
        int technicalScore = 0;
        boolean hasProjectDetails = false;
        boolean hasGitHubOrPortfolio = false;
        
        for (ChatAnswer answer : answers) {
            String text = answer.getAnswerText().toLowerCase();
            
            // Extraire les compétences techniques
            for (String skill : TECHNICAL_KEYWORDS) {
                if (text.contains(skill)) {
                    technicalScore++;
                    technicalSkills.add(skill);
                }
            }
            
            // Détecter les mentions de projets
            if (text.contains("projet") || text.contains("projet") || 
                text.contains("réalisation") || text.contains("application")) {
                mentionedProjects.add(extractProjectName(answer.getAnswerText()));
                hasProjectDetails = true;
            }
            
            // Détecter GitHub/portfolio
            if (text.contains("github.com") || text.contains("portfolio") || 
                text.contains("gitlab") || text.contains("bitbucket")) {
                hasGitHubOrPortfolio = true;
            }
        }
        
        // Déterminer le niveau technique
        if (technicalScore >= 5) {
            analysis.setTechnicalLevel("STRONG");
        } else if (technicalScore >= 2) {
            analysis.setTechnicalLevel("MEDIUM");
        } else {
            analysis.setTechnicalLevel("WEAK");
        }
        
        analysis.setTechnicalSkills(technicalSkills.stream().distinct().collect(Collectors.toList()));
        analysis.setMentionedProjects(mentionedProjects.stream().distinct().collect(Collectors.toList()));
        analysis.setHasProjectDetails(hasProjectDetails);
        analysis.setHasGitHubOrPortfolio(hasGitHubOrPortfolio);
    }
    
    /**
     * Analyse de la disponibilité et du rythme d'alternance
     */
    private void analyzeAvailability(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis) {
        String availabilityText = "";
        boolean hasClearAvailability = false;
        
        for (ChatAnswer answer : answers) {
            String text = answer.getAnswerText().toLowerCase();
            availabilityText += text + " ";
            
            // Détecter la disponibilité
            for (String keyword : AVAILABILITY_IMMEDIATE) {
                if (text.contains(keyword)) {
                    analysis.setAvailabilityStatus("IMMEDIATE");
                    hasClearAvailability = true;
                    break;
                }
            }
            
            for (String keyword : AVAILABILITY_FUTURE) {
                if (text.contains(keyword)) {
                    analysis.setAvailabilityStatus("FUTURE");
                    hasClearAvailability = true;
                    break;
                }
            }
            
            // Détecter le rythme d'alternance
            for (String rhythm : RHYTHM_FULL_TIME) {
                if (text.contains(rhythm)) {
                    analysis.setAlternanceRhythm("FULL_TIME");
                    hasClearAvailability = true;
                    break;
                }
            }
            
            for (String rhythm : RHYTHM_PART_TIME) {
                if (text.contains(rhythm)) {
                    analysis.setAlternanceRhythm("PART_TIME");
                    hasClearAvailability = true;
                    break;
                }
            }
        }
        
        if (analysis.getAvailabilityStatus() == null) {
            analysis.setAvailabilityStatus("UNSPECIFIED");
        }
        
        if (analysis.getAlternanceRhythm() == null) {
            analysis.setAlternanceRhythm("FLEXIBLE");
        }
        
        analysis.setHasClearAvailability(hasClearAvailability);
    }
    
    /**
     * Analyse de la localisation
     */
    private void analyzeLocation(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis, Job job) {
        String jobLocation = job.getLocation().toLowerCase();
        boolean hasMobility = false;
        String locationMatch = "INCOMPATIBLE";
        
        for (ChatAnswer answer : answers) {
            String text = answer.getAnswerText().toLowerCase();
            
            // Vérifier la localisation
            if (text.contains(jobLocation) || text.contains("même ville") || 
                text.contains("local")) {
                locationMatch = "PERFECT";
            }
            
            // Vérifier la mobilité et le télétravail
            if (text.contains("télétravail") || text.contains("remote") || 
                text.contains("déplacement") || text.contains("mobile")) {
                hasMobility = true;
                if (locationMatch.equals("INCOMPATIBLE")) {
                    locationMatch = "REMOTE_COMPATIBLE";
                }
            }
        }
        
        analysis.setLocationMatch(locationMatch);
        analysis.setHasMobility(hasMobility);
    }
    
    /**
     * Calcule le score de complétude (0.0 à 1.0)
     */
    private void calculateCompletenessScore(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis) {
        double score = 0.0;
        List<String> missingInfo = new ArrayList<>();
        
        // Motivation (25%)
        if (analysis.getMotivationLevel() != null && !analysis.getMotivationLevel().equals("LOW")) {
            score += 0.25;
        } else {
            missingInfo.add("Motivation insuffisante");
        }
        
        // Profil technique (25%)
        if (analysis.getTechnicalLevel() != null && !analysis.getTechnicalLevel().equals("WEAK")) {
            score += 0.25;
        } else {
            missingInfo.add("Profil technique faible");
        }
        
        // Projets (20%)
        if (analysis.isHasProjectDetails()) {
            score += 0.20;
        } else {
            missingInfo.add("Détails de projets manquants");
        }
        
        // Disponibilité (20%)
        if (analysis.isHasClearAvailability()) {
            score += 0.20;
        } else {
            missingInfo.add("Disponibilité non spécifiée");
        }
        
        // Localisation (10%)
        if (!analysis.getLocationMatch().equals("INCOMPATIBLE")) {
            score += 0.10;
        } else {
            missingInfo.add("Localisation incompatible");
        }
        
        analysis.setCompletenessScore(score);
        analysis.setMissingInformation(missingInfo);
    }
    
    /**
     * Détecte les incohérences dans les réponses
     */
    private void detectInconsistencies(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis) {
        List<String> inconsistencies = new ArrayList<>();
        
        // Incohérence motivation vs expérience
        if (analysis.getMotivationLevel().equals("HIGH") && 
            analysis.getTechnicalLevel().equals("WEAK")) {
            inconsistencies.add("Motivation élevée mais profil technique faible");
        }
        
        // Incohérence disponibilité
        if (analysis.getAvailabilityStatus().equals("IMMEDIATE") && 
            analysis.getAlternanceRhythm().equals("PART_TIME")) {
            inconsistencies.add("Disponibilité immédiate mais rythme partiel");
        }
        
        // Incohérence localisation
        if (analysis.getLocationMatch().equals("INCOMPATIBLE") && !analysis.isHasMobility()) {
            inconsistencies.add("Localisation incompatible sans mobilité");
        }
        
        analysis.setInconsistencies(inconsistencies);
    }
    
    /**
     * Recommande une action basée sur l'analyse
     */
    private void recommendAction(ChatAnswerAnalysisDTO analysis) {
        double score = analysis.getCompletenessScore();
        
        if (score >= 0.8 && analysis.getInconsistencies().isEmpty()) {
            analysis.setRecommendedAction("PRIORITY");
        } else if (score >= 0.5) {
            analysis.setRecommendedAction("REVIEW");
        } else {
            analysis.setRecommendedAction("REJECT");
        }
    }
    
    /**
     * Génère un résumé de motivation
     */
    private String generateMotivationSummary(String fullText) {
        if (fullText.length() > 200) {
            return fullText.substring(0, 200) + "...";
        }
        return fullText;
    }
    
    /**
     * Extrait le nom d'un projet du texte
     */
    private String extractProjectName(String text) {
        Pattern pattern = Pattern.compile("projet\\s+([A-Za-z0-9\\s]+)");
        Matcher matcher = pattern.matcher(text.toLowerCase());
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "Projet mentionné";
    }
    
    /**
     * Valide la complétude des réponses pour une candidature
     */
    public boolean validateAnswerCompleteness(UUID applicationId) {
        ChatAnswerAnalysisDTO analysis = analyzeChatAnswers(applicationId);
        return analysis.getCompletenessScore() >= 0.5 && 
               analysis.getMissingInformation().size() <= 2;
    }
    
    /**
     * Extrait les réponses du chatbot pour une candidature
     */
    public Map<String, String> extractStructuredAnswers(UUID applicationId) {
        List<ChatAnswer> answers = chatAnswerRepository.findByApplication_ApplicationId(applicationId);
        Map<String, String> structuredAnswers = new HashMap<>();
        
        for (ChatAnswer answer : answers) {
            String question = answer.getQuestionText();
            String response = answer.getAnswerText();
            String qNorm = question.toLowerCase()
                .replace("é", "e")
                .replace("è", "e")
                .replace("ê", "e")
                .replace("à", "a")
                .replace("ç", "c")
                .replace("ô", "o")
                .replace("î", "i")
                .replace("ï", "i")
                .replace("û", "u")
                .replace("ù", "u");

            // Détection plus robuste de motivation
            if (qNorm.contains("motivation") || qNorm.contains("motive") || qNorm.contains("pourquoi postule") || qNorm.contains("envie") || qNorm.contains("interet")) {
                structuredAnswers.put("motivation", response);
            } else if (qNorm.contains("projet") || qNorm.contains("projets") || qNorm.contains("application") || qNorm.contains("realisation")) {
                structuredAnswers.put("projets", response);
            } else if (qNorm.contains("disponibilite") || qNorm.contains("disponible") || qNorm.contains("date de debut")) {
                structuredAnswers.put("disponibilite", response);
            } else if (qNorm.contains("rythme") || qNorm.contains("temps") || qNorm.contains("alternance")) {
                structuredAnswers.put("rythme", response);
            } else if (qNorm.contains("localisation") || qNorm.contains("ville") || qNorm.contains("region") || qNorm.contains("lieu")) {
                structuredAnswers.put("localisation", response);
            } else {
                structuredAnswers.put("general", response);
            }
        }
        return structuredAnswers;
    }
}
