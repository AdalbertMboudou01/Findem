package com.memoire.assistant.service;

import com.memoire.assistant.dto.ChatAnswerAnalysisDTO;
import com.memoire.assistant.dto.GithubAnalysisDTO;
import com.memoire.assistant.dto.AnalysisFactDTO;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.ChatAnswer;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.ChatAnswerRepository;
import com.memoire.assistant.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
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

    @Autowired
    private GitHubAnalysisService gitHubAnalysisService;
    
    // Mots-clés pour l'analyse de motivation
    private static final Set<String> MOTIVATION_KEYWORDS_HIGH = Set.of(
        "passionne", "passion", "motive", "motivation", "enthousiaste",
        "determine", "ambitieux", "curieux",
        "apprentissage", "apprendre", "decouvrir", "defis", "challenge", "innovant"
    );
    
    private static final Set<String> MOTIVATION_KEYWORDS_MEDIUM = Set.of(
        "interesse", "attire", "opportunite", "experience",
        "developper", "competences", "carriere", "professionnel"
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
        enrichWithGitHubAndPortfolio(application, analysis);
        analyzeAvailability(answers, analysis);
        analyzeLocation(answers, analysis, application.getJob());
        extractConstrainedSemanticFacts(answers, analysis);
        
        // Calculer le score de complétude
        calculateCompletenessScore(answers, analysis);
        
        // Détecter les incohérences
        detectInconsistencies(answers, analysis);
        
        // Produire une lecture qualitative exploitable par le recruteur
        buildQualitativeSummary(analysis);
        
        return analysis;
    }
    
    /**
     * Analyse de la motivation du candidat
     */
    private void analyzeMotivation(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis) {
        List<ChatAnswer> motivationAnswers = answers.stream()
            .filter(this::isMotivationAnswer)
            .collect(Collectors.toList());

        if (motivationAnswers.isEmpty()) {
            analysis.setMotivationLevel("LOW");
            analysis.setHasSpecificMotivation(false);
            analysis.setMotivationSummary("Motivation non fournie.");
            analysis.setMotivationKeywords(Collections.emptyList());
            return;
        }

        List<String> motivationKeywords = new ArrayList<>();
        int highScore = 0;
        int mediumScore = 0;
        StringBuilder motivationText = new StringBuilder();
        
        for (ChatAnswer answer : motivationAnswers) {
            String text = normalizeForSearch(answer.getAnswerText());
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
        analysis.setMotivationSummary(generateMotivationSummary(motivationText.toString().trim()));
        analysis.setMotivationKeywords(motivationKeywords.stream().distinct().collect(Collectors.toList()));
    }

    private void enrichWithGitHubAndPortfolio(Application application, ChatAnswerAnalysisDTO analysis) {
        if (application == null || application.getCandidate() == null) {
            return;
        }

        Set<String> mergedSkills = new LinkedHashSet<>(
            analysis.getTechnicalSkills() == null ? Collections.emptyList() : analysis.getTechnicalSkills()
        );
        Set<String> mergedProjects = new LinkedHashSet<>(
            analysis.getMentionedProjects() == null ? Collections.emptyList() : analysis.getMentionedProjects()
        );

        boolean hasExternalProfile = false;
        List<String> githubSummaryParts = new ArrayList<>();

        String githubUrl = application.getCandidate().getGithubUrl();
        if (githubUrl != null && !githubUrl.trim().isEmpty()) {
            hasExternalProfile = true;
            GithubAnalysisDTO githubAnalysis = gitHubAnalysisService.analyzeGitHubProfile(githubUrl);
            if (Boolean.TRUE.equals(githubAnalysis.getSuccess())) {
                if (githubAnalysis.getLanguages() != null) {
                    mergedSkills.addAll(githubAnalysis.getLanguages());
                }
                if (githubAnalysis.getTechnologies() != null) {
                    mergedSkills.addAll(githubAnalysis.getTechnologies());
                }
                if (githubAnalysis.getProjectHighlights() != null && !githubAnalysis.getProjectHighlights().isEmpty()) {
                    githubAnalysis.getProjectHighlights().stream()
                        .limit(3)
                        .forEach(highlight -> mergedProjects.add("GitHub: " + highlight));
                    analysis.setHasProjectDetails(true);
                }
                if (githubAnalysis.getPublicRepositories() != null && githubAnalysis.getPublicRepositories() > 0) {
                    analysis.setHasProjectDetails(true);
                }

                String githubPart = "GitHub: " +
                    (githubAnalysis.getPublicRepositories() == null ? 0 : githubAnalysis.getPublicRepositories()) +
                    " depots publics";
                if (githubAnalysis.getTotalStars() != null) {
                    githubPart += ", " + githubAnalysis.getTotalStars() + " etoiles";
                }
                if (githubAnalysis.getActivityScore() != null) {
                    githubPart += ", activite " + githubAnalysis.getActivityScore() + "/100";
                }
                githubSummaryParts.add(githubPart);
            } else {
                githubSummaryParts.add("GitHub: analyse indisponible");
            }
        }

        String portfolioUrl = application.getCandidate().getPortfolioUrl();
        if (portfolioUrl != null && !portfolioUrl.trim().isEmpty()) {
            hasExternalProfile = true;
            GithubAnalysisDTO portfolioAnalysis = gitHubAnalysisService.analyzePortfolio(portfolioUrl);
            if (Boolean.TRUE.equals(portfolioAnalysis.getSuccess())) {
                githubSummaryParts.add("Portfolio: accessible");
                analysis.setHasProjectDetails(true);
            } else {
                githubSummaryParts.add("Portfolio: non accessible");
            }
        }

        if (hasExternalProfile) {
            analysis.setHasGitHubOrPortfolio(true);
        }

        if (!mergedSkills.isEmpty()) {
            analysis.setTechnicalSkills(new ArrayList<>(mergedSkills));
        }
        if (!mergedProjects.isEmpty()) {
            analysis.setMentionedProjects(new ArrayList<>(mergedProjects));
        }
        if (!githubSummaryParts.isEmpty()) {
            analysis.setGithubSummary(String.join(" | ", githubSummaryParts));
        }
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
    
    private void buildQualitativeSummary(ChatAnswerAnalysisDTO analysis) {
        List<String> strengths = new ArrayList<>();
        List<String> pointsToConfirm = new ArrayList<>();

        Optional<AnalysisFactDTO> motivationFact = findFact(analysis, "motivation");
        Optional<AnalysisFactDTO> projectFact = findFact(analysis, "projects");

        if (motivationFact.isPresent()) {
            analysis.setMotivationAssessment(motivationFact.get().getFinding());
            strengths.add("La motivation est formulée de manière claire et engagée.");
        } else if ("HIGH".equals(analysis.getMotivationLevel())) {
            analysis.setMotivationAssessment("Motivation claire, exprimée avec engagement et reliée au poste.");
            strengths.add("La motivation est formulée de manière claire et engagée.");
        } else if ("MEDIUM".equals(analysis.getMotivationLevel())) {
            analysis.setMotivationAssessment("Motivation présente mais encore partiellement générique.");
            pointsToConfirm.add("Préciser ce qui motive spécifiquement le candidat pour ce poste ou cette entreprise.");
        } else {
            analysis.setMotivationAssessment("La motivation reste absente, trop courte ou insuffisamment exploitable.");
            pointsToConfirm.add("Revenir avec le candidat sur les raisons concrètes de sa candidature.");
        }

        if (projectFact.isPresent()) {
            analysis.setProjectAssessment(projectFact.get().getFinding());
            strengths.add("Des projets ou réalisations concrètes sont mentionnés.");
        } else if (analysis.isHasProjectDetails()) {
            analysis.setProjectAssessment("Au moins un projet ou une réalisation est identifiable dans les réponses ou les preuves externes.");
            strengths.add("Des projets ou réalisations concrètes sont mentionnés.");
        } else {
            analysis.setProjectAssessment("Aucun projet suffisamment détaillé n'a été identifié pour apprécier le niveau réel d'exécution.");
            pointsToConfirm.add("Demander un exemple de projet avec rôle, stack et résultat obtenu.");
        }

        if (analysis.getGithubSummary() != null && !analysis.getGithubSummary().isBlank()) {
            analysis.setGithubAssessment("Des éléments externes sont exploitables via GitHub ou le portfolio.");
            strengths.add("Le candidat fournit des preuves externes consultables (GitHub et/ou portfolio).");
        } else if (analysis.isHasGitHubOrPortfolio()) {
            analysis.setGithubAssessment("Un lien externe est fourni mais l'analyse reste partielle ou peu exploitable.");
            pointsToConfirm.add("Vérifier manuellement la qualité du GitHub ou du portfolio fourni.");
        } else {
            analysis.setGithubAssessment("Aucun GitHub ni portfolio exploitable n'est disponible dans cette candidature.");
            pointsToConfirm.add("Aucune preuve externe n'est disponible pour confirmer les projets mentionnés.");
        }

        if (analysis.isHasClearAvailability()) {
            analysis.setAvailabilityAssessment(describeAvailability(analysis));
            strengths.add("La disponibilité ou le rythme d'alternance est précisé.");
        } else {
            analysis.setAvailabilityAssessment("La disponibilité ou le rythme d'alternance n'est pas clairement précisé.");
            pointsToConfirm.add("Confirmer la date de disponibilité et le rythme d'alternance attendu.");
        }

        analysis.setLocationAssessment(describeLocation(analysis));
        if ("PERFECT".equals(analysis.getLocationMatch()) || "REMOTE_COMPATIBLE".equals(analysis.getLocationMatch())) {
            strengths.add("La localisation ne présente pas de blocage évident à ce stade.");
        } else {
            pointsToConfirm.add("Valider la mobilité ou la compatibilité géographique avec le poste.");
        }

        if (analysis.getTechnicalSkills() != null && !analysis.getTechnicalSkills().isEmpty()) {
            strengths.add("Des technologies ou environnements techniques sont explicitement mentionnés.");
        } else {
            pointsToConfirm.add("Le niveau technique reste à confirmer avec des exemples plus précis.");
        }

        if (analysis.isSemanticFallbackUsed()) {
            pointsToConfirm.add("Extraction sémantique partielle: certains constats reposent sur un fallback technique.");
        }

        if (analysis.getInconsistencies() != null && !analysis.getInconsistencies().isEmpty()) {
            pointsToConfirm.addAll(analysis.getInconsistencies());
        }

        analysis.setStrengths(strengths.stream().distinct().collect(Collectors.toList()));
        analysis.setPointsToConfirm(pointsToConfirm.stream().distinct().collect(Collectors.toList()));
        analysis.setRecommendedAction(resolveQualitativeAction(analysis));
        analysis.setRecruiterGuidance(buildRecruiterGuidance(analysis));
    }

    private String resolveQualitativeAction(ChatAnswerAnalysisDTO analysis) {
        return "MANUAL_REVIEW";
    }

    private String buildRecruiterGuidance(ChatAnswerAnalysisDTO analysis) {
        boolean incompleteProfile = (analysis.getMissingInformation() != null && analysis.getMissingInformation().size() >= 3)
            || (analysis.getPointsToConfirm() != null && analysis.getPointsToConfirm().size() >= 4)
            || analysis.isSemanticFallbackUsed();

        if (incompleteProfile) {
            return "La candidature contient des éléments utiles, mais plusieurs informations clés restent à confirmer avant toute décision.";
        }
        return "La candidature est structurée en constats avec preuves textuelles. Une validation humaine reste requise avant décision.";
    }

    private void extractConstrainedSemanticFacts(List<ChatAnswer> answers, ChatAnswerAnalysisDTO analysis) {
        List<AnalysisFactDTO> facts = new ArrayList<>();
        boolean fallbackUsed = false;

        List<ChatAnswer> motivationAnswers = answers.stream()
            .filter(this::isMotivationAnswer)
            .collect(Collectors.toList());
        List<ChatAnswer> projectAnswers = answers.stream()
            .filter(this::isProjectAnswer)
            .collect(Collectors.toList());

        facts.addAll(extractFactsFromAnswers(motivationAnswers, "motivation"));
        facts.addAll(extractFactsFromAnswers(projectAnswers, "projects"));

        if (facts.stream().noneMatch(f -> "motivation".equals(f.getDimension()))) {
            fallbackUsed = true;
            String fallbackEvidence = truncateEvidence(analysis.getMotivationSummary());
            if (!fallbackEvidence.isBlank() && !"Motivation non fournie.".equalsIgnoreCase(fallbackEvidence)) {
                facts.add(new AnalysisFactDTO(
                    "motivation",
                    "Constat motivation produit via fallback heuristique (extraction sémantique incomplète).",
                    fallbackEvidence,
                    0.35,
                    "fallback"
                ));
            }
        }

        if (facts.stream().noneMatch(f -> "projects".equals(f.getDimension()))) {
            fallbackUsed = true;
            String fallbackProjects = analysis.getMentionedProjects() == null
                ? ""
                : String.join(" | ", analysis.getMentionedProjects());
            if (!fallbackProjects.isBlank()) {
                facts.add(new AnalysisFactDTO(
                    "projects",
                    "Constat projets produit via fallback technique (extraction sémantique incomplète).",
                    truncateEvidence(fallbackProjects),
                    0.35,
                    "fallback"
                ));
            }
        }

        List<String> missing = analysis.getMissingInformation() == null
            ? new ArrayList<>()
            : new ArrayList<>(analysis.getMissingInformation());
        if (facts.stream().noneMatch(f -> "motivation".equals(f.getDimension()))) {
            missing.add("Aucune preuve textuelle explicite sur la motivation");
        }
        if (facts.stream().noneMatch(f -> "projects".equals(f.getDimension()))) {
            missing.add("Aucune preuve textuelle explicite sur les projets");
        }

        List<AnalysisFactDTO> sanitizedFacts = sanitizeFacts(facts);

        analysis.setAnalysisSchemaVersion("phase1.v1");
        analysis.setSemanticFacts(sanitizedFacts);
        analysis.setSemanticFallbackUsed(fallbackUsed);
        analysis.setMissingInformation(missing.stream().distinct().collect(Collectors.toList()));
    }

    private List<AnalysisFactDTO> extractFactsFromAnswers(List<ChatAnswer> answers, String dimension) {
        List<AnalysisFactDTO> facts = new ArrayList<>();
        for (ChatAnswer answer : answers) {
            String raw = answer.getAnswerText() == null ? "" : answer.getAnswerText().trim();
            if (raw.isBlank()) {
                continue;
            }

            String normalized = normalizeForSearch(raw);
            double confidence = estimateConfidence(normalized);
            String finding = buildFinding(dimension, normalized, confidence);

            facts.add(new AnalysisFactDTO(
                dimension,
                finding,
                truncateEvidence(raw),
                confidence,
                answer.getQuestionText() == null ? "" : answer.getQuestionText()
            ));
        }
        return facts;
    }

    private String buildFinding(String dimension, String normalizedText, double confidence) {
        if ("motivation".equals(dimension)) {
            if (normalizedText.contains("poste") || normalizedText.contains("entreprise") || normalizedText.contains("mission")) {
                return "Le candidat relie sa motivation au poste ou au contexte de l'entreprise.";
            }
            return confidence >= 0.65
                ? "Le candidat exprime une motivation explicite, avec un niveau de détail modéré."
                : "La motivation est mentionnée, mais reste générale et peu contextualisée.";
        }

        if (normalizedText.contains("role") || normalizedText.contains("resultat") || normalizedText.contains("stack")) {
            return "Le candidat décrit un projet avec des éléments d'exécution (rôle, stack ou résultat).";
        }
        return confidence >= 0.65
            ? "Le candidat mentionne au moins un projet exploitable pour discussion recruteur."
            : "Un projet est mentionné, mais les détails d'exécution restent limités.";
    }

    private double estimateConfidence(String normalizedText) {
        int length = normalizedText.length();
        boolean hasContext = normalizedText.contains("parce") || normalizedText.contains("afin")
            || normalizedText.contains("projet") || normalizedText.contains("developpe")
            || normalizedText.contains("realis") || normalizedText.contains("github");

        if (length >= 120 && hasContext) {
            return 0.85;
        }
        if (length >= 60) {
            return 0.65;
        }
        return 0.45;
    }

    private String truncateEvidence(String text) {
        if (text == null) {
            return "";
        }
        String value = text.trim();
        if (value.length() <= 220) {
            return value;
        }
        return value.substring(0, 220) + "...";
    }

    private Optional<AnalysisFactDTO> findFact(ChatAnswerAnalysisDTO analysis, String dimension) {
        if (analysis.getSemanticFacts() == null) {
            return Optional.empty();
        }
        return analysis.getSemanticFacts().stream()
            .filter(fact -> dimension.equals(fact.getDimension()))
            .findFirst();
    }

    private List<AnalysisFactDTO> sanitizeFacts(List<AnalysisFactDTO> facts) {
        if (facts == null || facts.isEmpty()) {
            return List.of();
        }

        return facts.stream()
            .filter(Objects::nonNull)
            .map(fact -> {
                String dimension = fact.getDimension() == null || fact.getDimension().isBlank()
                    ? "general"
                    : fact.getDimension().trim();
                String finding = fact.getFinding() == null ? "" : fact.getFinding().trim();
                String evidence = fact.getEvidence() == null ? "" : fact.getEvidence().trim();
                String sourceQuestion = fact.getSourceQuestion() == null ? "" : fact.getSourceQuestion().trim();
                double confidence = Math.max(0.0, Math.min(1.0, fact.getConfidence()));
                return new AnalysisFactDTO(dimension, finding, evidence, confidence, sourceQuestion);
            })
            .filter(fact -> !fact.getFinding().isBlank() && !fact.getEvidence().isBlank())
            .collect(Collectors.toList());
    }

    private String describeAvailability(ChatAnswerAnalysisDTO analysis) {
        String availability = analysis.getAvailabilityStatus();
        String rhythm = analysis.getAlternanceRhythm();

        String availabilityLabel;
        if ("IMMEDIATE".equals(availability)) {
            availabilityLabel = "La disponibilité est annoncée comme immédiate";
        } else if ("FUTURE".equals(availability)) {
            availabilityLabel = "Une disponibilité future est mentionnée";
        } else {
            availabilityLabel = "Une disponibilité est mentionnée";
        }

        String rhythmLabel;
        if ("FULL_TIME".equals(rhythm)) {
            rhythmLabel = "avec un rythme d'alternance clairement précisé";
        } else if ("PART_TIME".equals(rhythm)) {
            rhythmLabel = "avec un rythme partiel à confirmer";
        } else {
            rhythmLabel = "avec un rythme encore flexible";
        }

        return availabilityLabel + " " + rhythmLabel + ".";
    }

    private String describeLocation(ChatAnswerAnalysisDTO analysis) {
        if ("PERFECT".equals(analysis.getLocationMatch())) {
            return "La localisation semble compatible avec le poste.";
        }
        if ("REMOTE_COMPATIBLE".equals(analysis.getLocationMatch())) {
            return "La localisation peut rester compatible sous réserve de mobilité ou de télétravail.";
        }
        return "La compatibilité géographique n'est pas démontrée à ce stade.";
    }
    
    /**
     * Génère un résumé de motivation
     */
    private String generateMotivationSummary(String fullText) {
        if (fullText == null || fullText.trim().isEmpty()) {
            return "Motivation non fournie.";
        }
        if (fullText.length() > 200) {
            return fullText.substring(0, 200) + "...";
        }
        return fullText;
    }

    private boolean isMotivationAnswer(ChatAnswer answer) {
        String key = normalizeForSearch(answer.getQuestionKey());
        String question = normalizeForSearch(answer.getQuestionText());

        return key.contains("motivation")
            || key.contains("motive")
            || question.contains("motivation")
            || question.contains("motive")
            || question.contains("pourquoi")
            || question.contains("interet")
            || question.contains("envie");
    }

    private boolean isProjectAnswer(ChatAnswer answer) {
        String key = normalizeForSearch(answer.getQuestionKey());
        String question = normalizeForSearch(answer.getQuestionText());

        return key.contains("projet")
            || key.contains("portfolio")
            || question.contains("projet")
            || question.contains("realisation")
            || question.contains("application")
            || question.contains("github")
            || question.contains("portfolio");
    }

    private String normalizeForSearch(String text) {
        if (text == null) {
            return "";
        }
        return Normalizer.normalize(text, Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "")
            .toLowerCase();
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
