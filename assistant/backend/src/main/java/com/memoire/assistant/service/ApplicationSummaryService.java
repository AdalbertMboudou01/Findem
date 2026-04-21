package com.memoire.assistant.service;

import com.memoire.assistant.dto.ApplicationSummaryDTO;
import com.memoire.assistant.dto.GithubAnalysisDTO;
import com.memoire.assistant.dto.ChatAnswerAnalysisDTO;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.ApplicationSummary;
import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.model.ChatMessage;
import com.memoire.assistant.model.ChatAnswer;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.ApplicationRepository;
import com.memoire.assistant.repository.ApplicationSummaryRepository;
import com.memoire.assistant.repository.CandidateRepository;
import com.memoire.assistant.repository.ChatMessageRepository;
import com.memoire.assistant.repository.ChatAnswerRepository;
import com.memoire.assistant.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationSummaryService {
    
    @Autowired
    private ApplicationSummaryRepository applicationSummaryRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private GitHubAnalysisService gitHubAnalysisService;
    
    @Autowired
    private ChatAnswerService chatAnswerService;
    
    @Autowired
    private ChatAnswerRepository chatAnswerRepository;
    
    public ApplicationSummary generateSummary(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application non trouvée"));
        
        // Récupérer les réponses du chatbot
        List<ChatMessage> answers = chatMessageRepository.findByApplication_ApplicationIdAndMessageType(applicationId, "ANSWER");
        
        // Créer la synthèse
        ApplicationSummary summary = new ApplicationSummary(application);
        
        // Analyser les réponses et générer la synthèse
        analyzeAnswersAndGenerateSummary(summary, answers, application);
        
        return applicationSummaryRepository.save(summary);
    }
    
    public void analyzeAnswersAndGenerateSummary(ApplicationSummary summary, List<ChatMessage> answers, Application application) {
        Candidate candidate = application.getCandidate();
        Job job = application.getJob();
        
        // Extraire les informations des réponses
        String motivationAnswer = getAnswerByKey(answers, "motivation");
        String technoAnswer = getAnswerByKey(answers, "techno");
        String projetAnswer = getAnswerByKey(answers, "projet");
        String disponibiliteAnswer = getAnswerByKey(answers, "disponibilite");
        String frameworkAnswer = getAnswerByKey(answers, "framework");
        
        // Analyser la motivation
        summary.setMotivationLevel(analyzeMotivationLevel(motivationAnswer));
        
        // Analyser le profil technique
        summary.setTechnicalProfile(analyzeTechnicalProfile(technoAnswer, frameworkAnswer, projetAnswer, job.getTitle()));
        
        // Analyser le niveau d'expérience
        summary.setExperienceLevel(analyzeExperienceLevel(projetAnswer, technoAnswer));
        
        // Extraire les compétences clés
        summary.setKeySkills(extractKeySkills(technoAnswer, frameworkAnswer, projetAnswer));
        
        // Mettre en évidence les projets
        summary.setProjectHighlights(extractProjectHighlights(projetAnswer));
        
        // Analyser la disponibilité
        summary.setAvailabilityStatus(analyzeAvailability(disponibiliteAnswer));
        
        // Analyser la correspondance de localisation
        summary.setLocationMatch(analyzeLocationMatch(candidate.getLocation(), job.getLocation()));
        
        // Générer les points positifs
        summary.setPositivePoints(generatePositivePoints(motivationAnswer, technoAnswer, projetAnswer));
        
        // Identifier les critères bloquants
        summary.setBlockingCriteria(identifyBlockingCriteria(candidate, job, disponibiliteAnswer));
        
        // Identifier les points de vigilance
        summary.setConcerns(generateConcerns(motivationAnswer, technoAnswer, disponibiliteAnswer));
        
        // Recommander une action
        summary.setRecommendedAction(recommendAction(summary));
        
        // Enrichir avec l'analyse GitHub si disponible
        enrichSummaryWithGitHubAnalysis(summary, candidate);
        
        // Générer le texte de synthèse
        summary.setSummaryText(generateSummaryText(summary, candidate, job));
    }
    
    public String getAnswerByKey(List<ChatMessage> answers, String key) {
        return answers.stream()
            .filter(answer -> key.equals(answer.getQuestionKey()))
            .map(ChatMessage::getAnswer)
            .findFirst()
            .orElse("");
    }
    
    public void enrichSummaryWithGitHubAnalysis(ApplicationSummary summary, Candidate candidate) {
        try {
            // Analyser le profil GitHub si disponible
            if (candidate.getGithubUrl() != null && !candidate.getGithubUrl().trim().isEmpty()) {
                GithubAnalysisDTO githubAnalysis = gitHubAnalysisService.analyzeGitHubProfile(candidate.getGithubUrl());
                
                if (githubAnalysis.getSuccess()) {
                    // Enrichir la synthèse avec les données GitHub
                    enrichWithGitHubData(summary, githubAnalysis);
                }
            }
            
            // Analyser le portfolio si disponible
            if (candidate.getPortfolioUrl() != null && !candidate.getPortfolioUrl().trim().isEmpty()) {
                GithubAnalysisDTO portfolioAnalysis = gitHubAnalysisService.analyzePortfolio(candidate.getPortfolioUrl());
                
                if (portfolioAnalysis.getSuccess()) {
                    // Enrichir la synthèse avec les données du portfolio
                    enrichWithPortfolioData(summary, portfolioAnalysis);
                }
            }
        } catch (Exception e) {
            // L'analyse GitHub échoue ne doit pas bloquer la génération de synthèse
            System.err.println("Erreur lors de l'enrichissement GitHub: " + e.getMessage());
        }
    }
    
    private void enrichWithGitHubData(ApplicationSummary summary, GithubAnalysisDTO githubAnalysis) {
        // Améliorer le profil technique basé sur les données GitHub
        String currentTechnical = summary.getTechnicalProfile();
        if (githubAnalysis.getTechnologies() != null && !githubAnalysis.getTechnologies().isEmpty()) {
            // Si le candidat a des projets GitHub avec des technologies pertinentes
            if (githubAnalysis.getActivityScore() > 50) {
                summary.setTechnicalProfile("STRONG");
            } else if (githubAnalysis.getActivityScore() > 25) {
                summary.setTechnicalProfile("MEDIUM");
            }
            
            // Ajouter les technologies détectées
            String enhancedKeySkills = summary.getKeySkills() + ", " + String.join(", ", githubAnalysis.getTechnologies());
            summary.setKeySkills(enhancedKeySkills);
        }
        
        // Améliorer les points positifs avec les projets GitHub
        String currentPositive = summary.getPositivePoints();
        if (githubAnalysis.getProjectHighlights() != null && !githubAnalysis.getProjectHighlights().isEmpty()) {
            String enhancedPositive = currentPositive + "\n\nProjets GitHub remarquables:\n" + 
                String.join("\n", githubAnalysis.getProjectHighlights());
            summary.setPositivePoints(enhancedPositive);
        }
        
        // Ajouter les statistiques GitHub dans les préoccupations si nécessaire
        if (githubAnalysis.getPublicRepositories() != null && githubAnalysis.getPublicRepositories() < 3) {
            String currentConcerns = summary.getConcerns();
            String enhancedConcerns = currentConcerns + 
                "\n\nNote: Profil GitHub avec peu de projets publics (" + 
                githubAnalysis.getPublicRepositories() + " repositories)";
            summary.setConcerns(enhancedConcerns);
        }
    }
    
    private void enrichWithPortfolioData(ApplicationSummary summary, GithubAnalysisDTO portfolioAnalysis) {
        // Ajouter les informations du portfolio dans les points positifs
        String currentPositive = summary.getPositivePoints();
        if (portfolioAnalysis.getHasPortfolio() != null && portfolioAnalysis.getHasPortfolio()) {
            String enhancedPositive = currentPositive + 
                "\n\nPortfolio accessible: " + portfolioAnalysis.getPortfolioUrl();
            summary.setPositivePoints(enhancedPositive);
        }
    }
    
    public String analyzeMotivationLevel(String motivationAnswer) {
        if (motivationAnswer == null || motivationAnswer.trim().isEmpty()) {
            return "LOW";
        }
        
        String lowerAnswer = motivationAnswer.toLowerCase();
        int score = 0;
        
        // Mots positifs
        if (lowerAnswer.contains("passion") || lowerAnswer.contains("passionné")) score += 3;
        if (lowerAnswer.contains("apprendre") || lowerAnswer.contains("apprentissage")) score += 2;
        if (lowerAnswer.contains("développer") || lowerAnswer.contains("développement")) score += 2;
        if (lowerAnswer.contains("intéressé") || lowerAnswer.contains("intérêt")) score += 1;
        if (lowerAnswer.contains("curieux") || lowerAnswer.contains("curiosité")) score += 1;
        
        // Longueur de la réponse
        if (motivationAnswer.length() > 200) score += 1;
        if (motivationAnswer.length() > 500) score += 1;
        
        if (score >= 5) return "HIGH";
        if (score >= 3) return "MEDIUM";
        return "LOW";
    }
    
    public String analyzeTechnicalProfile(String technoAnswer, String frameworkAnswer, String projetAnswer, String jobTitle) {
        if (technoAnswer == null && frameworkAnswer == null && projetAnswer == null) {
            return "WEAK";
        }
        
        String allTechAnswers = (technoAnswer + " " + frameworkAnswer + " " + projetAnswer).toLowerCase();
        int score = 0;
        
        // Technologies backend
        if (jobTitle.toLowerCase().contains("backend")) {
            if (allTechAnswers.contains("java") || allTechAnswers.contains("spring")) score += 3;
            if (allTechAnswers.contains("python") || allTechAnswers.contains("django") || allTechAnswers.contains("flask")) score += 3;
            if (allTechAnswers.contains("node") || allTechAnswers.contains("express")) score += 2;
            if (allTechAnswers.contains("api") || allTechAnswers.contains("rest")) score += 2;
            if (allTechAnswers.contains("sql") || allTechAnswers.contains("base de données")) score += 2;
        }
        
        // Technologies frontend
        if (jobTitle.toLowerCase().contains("frontend")) {
            if (allTechAnswers.contains("react") || allTechAnswers.contains("vue") || allTechAnswers.contains("angular")) score += 3;
            if (allTechAnswers.contains("javascript") || allTechAnswers.contains("typescript")) score += 2;
            if (allTechAnswers.contains("html") || allTechAnswers.contains("css")) score += 1;
            if (allTechAnswers.contains("responsive") || allTechAnswers.contains("mobile")) score += 1;
        }
        
        // Projets concrets
        if (projetAnswer != null && projetAnswer.length() > 100) score += 2;
        if (projetAnswer != null && (projetAnswer.toLowerCase().contains("github") || projetAnswer.toLowerCase().contains("lien"))) score += 1;
        
        if (score >= 6) return "STRONG";
        if (score >= 3) return "MEDIUM";
        return "WEAK";
    }
    
    public String analyzeExperienceLevel(String projetAnswer, String technoAnswer) {
        String combined = (projetAnswer + " " + technoAnswer).toLowerCase();
        int score = 0;
        
        // Indicateurs d'expérience
        if (combined.contains("stage") || combined.contains("alternance")) score += 2;
        if (combined.contains("projet") || combined.contains("réalisé")) score += 1;
        if (combined.contains("équipe") || combined.contains("collaboration")) score += 1;
        if (combined.contains("déploiement") || combined.contains("production")) score += 2;
        if (combined.contains("client") || combined.contains("utilisateur")) score += 1;
        
        // Complexité technique
        if (combined.contains("base de données") || combined.contains("api")) score += 1;
        if (combined.contains("framework") || combined.contains("librairie")) score += 1;
        
        if (score >= 5) return "INTERMEDIATE";
        if (score >= 2) return "JUNIOR";
        return "JUNIOR";
    }
    
    public String extractKeySkills(String technoAnswer, String frameworkAnswer, String projetAnswer) {
        StringBuilder skills = new StringBuilder();
        
        if (technoAnswer != null && !technoAnswer.trim().isEmpty()) {
            skills.append("Technologies: ").append(technoAnswer).append(". ");
        }
        
        if (frameworkAnswer != null && !frameworkAnswer.trim().isEmpty()) {
            skills.append("Frameworks: ").append(frameworkAnswer).append(". ");
        }
        
        return skills.toString().trim();
    }
    
    private String extractProjectHighlights(String projetAnswer) {
        if (projetAnswer == null || projetAnswer.trim().isEmpty()) {
            return "Aucun projet détaillé";
        }
        
        // Limiter la longueur et extraire les points clés
        if (projetAnswer.length() > 300) {
            return projetAnswer.substring(0, 297) + "...";
        }
        
        return projetAnswer;
    }
    
    public String analyzeAvailability(String disponibiliteAnswer) {
        if (disponibiliteAnswer == null || disponibiliteAnswer.trim().isEmpty()) {
            return "NON_SPECIFIE";
        }
        
        String lower = disponibiliteAnswer.toLowerCase();
        if (lower.contains("immédiat") || lower.contains("tout de suite")) {
            return "IMMEDIATE";
        } else if (lower.contains("mois")) {
            return "WITHIN_MONTHS";
        } else {
            return "SPECIFIED";
        }
    }
    
    public String analyzeLocationMatch(String candidateLocation, String jobLocation) {
        if (candidateLocation == null || jobLocation == null) {
            return "UNKNOWN";
        }
        
        String candLoc = candidateLocation.toLowerCase();
        String jobLoc = jobLocation.toLowerCase();
        
        if (candLoc.contains(jobLoc) || jobLoc.contains(candLoc)) {
            return "PERFECT";
        } else if (candLoc.contains("télétravail") || jobLoc.contains("télétravail") || 
                   candLoc.contains("remote") || jobLoc.contains("remote")) {
            return "REMOTE_COMPATIBLE";
        } else {
            return "POSSIBLE_RELOCATION";
        }
    }
    
    private String generatePositivePoints(String motivationAnswer, String technoAnswer, String projetAnswer) {
        StringBuilder points = new StringBuilder();
        
        if (motivationAnswer != null && motivationAnswer.length() > 100) {
            points.append("Motivation bien exprimée. ");
        }
        
        if (technoAnswer != null && !technoAnswer.trim().isEmpty()) {
            points.append("Compétences techniques claires. ");
        }
        
        if (projetAnswer != null && projetAnswer.length() > 50) {
            points.append("Expérience projet concrète. ");
        }
        
        return points.toString().trim();
    }
    
    private String identifyBlockingCriteria(Candidate candidate, Job job, String disponibiliteAnswer) {
        StringBuilder criteria = new StringBuilder();
        
        // Vérifier la disponibilité
        if (disponibiliteAnswer == null || disponibiliteAnswer.trim().isEmpty()) {
            criteria.append("Disponibilité non spécifiée. ");
        }
        
        // Vérifier la localisation
        if (candidate.getLocation() != null && job.getLocation() != null) {
            String candLoc = candidate.getLocation().toLowerCase();
            String jobLoc = job.getLocation().toLowerCase();
            
            if (!candLoc.contains(jobLoc) && !jobLoc.contains(candLoc) && 
                !candLoc.contains("télétravail") && !jobLoc.contains("télétravail")) {
                criteria.append("Incompatibilité de localisation possible. ");
            }
        }
        
        return criteria.toString().trim();
    }
    
    private String generateConcerns(String motivationAnswer, String technoAnswer, String disponibiliteAnswer) {
        StringBuilder concerns = new StringBuilder();
        
        if (motivationAnswer != null && motivationAnswer.length() < 50) {
            concerns.append("Motivation peu détaillée. ");
        }
        
        if (technoAnswer != null && technoAnswer.length() < 30) {
            concerns.append("Compétences techniques peu détaillées. ");
        }
        
        if (disponibiliteAnswer == null || disponibiliteAnswer.trim().isEmpty()) {
            concerns.append("Disponibilité à clarifier. ");
        }
        
        return concerns.toString().trim();
    }
    
    public String recommendAction(ApplicationSummary summary) {
        int score = 0;
        
        // Score positif
        if ("HIGH".equals(summary.getMotivationLevel())) score += 3;
        if ("MEDIUM".equals(summary.getMotivationLevel())) score += 1;
        if ("STRONG".equals(summary.getTechnicalProfile())) score += 3;
        if ("MEDIUM".equals(summary.getTechnicalProfile())) score += 1;
        if ("PERFECT".equals(summary.getLocationMatch())) score += 2;
        if ("REMOTE_COMPATIBLE".equals(summary.getLocationMatch())) score += 1;
        
        // Score négatif
        if ("LOW".equals(summary.getMotivationLevel())) score -= 2;
        if ("WEAK".equals(summary.getTechnicalProfile())) score -= 2;
        if (summary.getBlockingCriteria() != null && !summary.getBlockingCriteria().trim().isEmpty()) score -= 1;
        
        if (score >= 5) return "INTERVIEW";
        if (score >= 2) return "REVIEW";
        if (score >= 0) return "POOL";
        return "REJECT";
    }
    
    private String generateSummaryText(ApplicationSummary summary, Candidate candidate, Job job) {
        StringBuilder text = new StringBuilder();
        
        text.append("Candidat: ").append(candidate.getFirstName()).append(" ").append(candidate.getLastName()).append("\n");
        text.append("Poste: ").append(job.getTitle()).append("\n");
        text.append("Entreprise: ").append(job.getCompany().getName()).append("\n\n");
        
        text.append("Évaluation:\n");
        text.append("- Motivation: ").append(summary.getMotivationLevel()).append("\n");
        text.append("- Profil technique: ").append(summary.getTechnicalProfile()).append("\n");
        text.append("- Expérience: ").append(summary.getExperienceLevel()).append("\n");
        text.append("- Localisation: ").append(summary.getLocationMatch()).append("\n\n");
        
        if (summary.getKeySkills() != null && !summary.getKeySkills().trim().isEmpty()) {
            text.append("Compétences clés: ").append(summary.getKeySkills()).append("\n\n");
        }
        
        if (summary.getProjectHighlights() != null && !summary.getProjectHighlights().trim().isEmpty()) {
            text.append("Projets: ").append(summary.getProjectHighlights()).append("\n\n");
        }
        
        if (summary.getPositivePoints() != null && !summary.getPositivePoints().trim().isEmpty()) {
            text.append("Points positifs: ").append(summary.getPositivePoints()).append("\n\n");
        }
        
        if (summary.getConcerns() != null && !summary.getConcerns().trim().isEmpty()) {
            text.append("Points de vigilance: ").append(summary.getConcerns()).append("\n\n");
        }
        
        if (summary.getBlockingCriteria() != null && !summary.getBlockingCriteria().trim().isEmpty()) {
            text.append("Critères bloquants: ").append(summary.getBlockingCriteria()).append("\n\n");
        }
        
        text.append("Recommandation: ").append(summary.getRecommendedAction());
        
        return text.toString();
    }
    
    public ApplicationSummaryDTO getSummaryByApplication(UUID applicationId) {
        ApplicationSummary summary = applicationSummaryRepository.findByApplication_ApplicationId(applicationId)
            .orElse(null);
        
        if (summary == null) {
            return null;
        }
        
        ApplicationSummaryDTO dto = new ApplicationSummaryDTO();
        dto.setSummaryId(summary.getSummaryId());
        dto.setApplicationId(summary.getApplication().getApplicationId());
        dto.setMotivationLevel(summary.getMotivationLevel());
        dto.setTechnicalProfile(summary.getTechnicalProfile());
        dto.setExperienceLevel(summary.getExperienceLevel());
        dto.setKeySkills(summary.getKeySkills());
        dto.setProjectHighlights(summary.getProjectHighlights());
        dto.setAvailabilityStatus(summary.getAvailabilityStatus());
        dto.setLocationMatch(summary.getLocationMatch());
        dto.setRecommendedAction(summary.getRecommendedAction());
        dto.setSummaryText(summary.getSummaryText());
        dto.setBlockingCriteria(summary.getBlockingCriteria());
        dto.setPositivePoints(summary.getPositivePoints());
        dto.setConcerns(summary.getConcerns());
        dto.setGeneratedAt(summary.getGeneratedAt().toString());
        dto.setGeneratedBy(summary.getGeneratedBy());
        
        return dto;
    }
    
    public List<ApplicationSummaryDTO> getSummariesByAction(String recommendedAction) {
        return applicationSummaryRepository.findByRecommendedAction(recommendedAction)
            .stream()
            .map(summary -> {
                ApplicationSummaryDTO dto = new ApplicationSummaryDTO();
                dto.setSummaryId(summary.getSummaryId());
                dto.setApplicationId(summary.getApplication().getApplicationId());
                dto.setRecommendedAction(summary.getRecommendedAction());
                dto.setMotivationLevel(summary.getMotivationLevel());
                dto.setTechnicalProfile(summary.getTechnicalProfile());
                dto.setGeneratedAt(summary.getGeneratedAt().toString());
                return dto;
            })
            .collect(Collectors.toList());
    }
}
