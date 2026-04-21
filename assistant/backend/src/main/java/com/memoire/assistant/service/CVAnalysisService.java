package com.memoire.assistant.service;

import com.memoire.assistant.dto.CVAnalysisDTO;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class CVAnalysisService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Value("${app.cv.upload.dir:uploads/cv}")
    private String uploadDirectory;
    
    @Value("${app.cv.max.size:10485760}") // 10MB
    private long maxFileSize;
    
    // Patterns pour l'extraction d'informations
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "\\b(?:\\+?33|0)[1-9](?:[\\s.-]?\\d{2}){4}\\b"
    );
    
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile(
        "linkedin\\.com/in/[a-zA-Z0-9-]+"
    );
    
    private static final Pattern GITHUB_PATTERN = Pattern.compile(
        "github\\.com/[a-zA-Z0-9-]+"
    );
    
    // Compétences techniques à rechercher
    private static final Set<String> PROGRAMMING_LANGUAGES = Set.of(
        "java", "python", "javascript", "typescript", "c++", "c#", "php", "ruby",
        "go", "rust", "swift", "kotlin", "scala", "perl", "r", "matlab"
    );
    
    private static final Set<String> FRAMEWORKS = Set.of(
        "spring", "react", "vue", "angular", "django", "flask", "express", "laravel",
        "rails", "symfony", "hibernate", "jpa", "entity", "mybatis", "node", "next"
    );
    
    private static final Set<String> DATABASES = Set.of(
        "mysql", "postgresql", "mongodb", "redis", "oracle", "sql server", "sqlite",
        "cassandra", "elasticsearch", "neo4j", "firebase", "supabase"
    );
    
    private static final Set<String> TOOLS = Set.of(
        "git", "docker", "kubernetes", "jenkins", "aws", "azure", "gcp", "terraform",
        "ansible", "jira", "confluence", "slack", "vs code", "intellij", "eclipse"
    );
    
    /**
     * Analyse un fichier CV uploadé
     */
    public CVAnalysisDTO analyzeCV(UUID applicationId, MultipartFile file) throws IOException {
        // Valider le fichier
        validateFile(file);
        
        // Sauvegarder le fichier
        String fileName = saveFile(file, applicationId);
        
        // Extraire le texte du fichier
        String cvText = extractTextFromFile(file);
        
        // Analyser le contenu
        CVAnalysisDTO analysis = analyzeCVText(cvText, applicationId, fileName);
        
        // Enrichir avec les informations de la candidature
        enrichWithApplicationData(analysis, applicationId);
        
        return analysis;
    }
    
    /**
     * Valide le fichier uploadé
     */
    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("Le fichier dépasse la taille maximale de " + (maxFileSize / 1024 / 1024) + "MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
            !contentType.equals("application/msword") && 
            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new IllegalArgumentException("Seuls les fichiers PDF et Word sont acceptés");
        }
    }
    
    /**
     * Sauvegarde le fichier sur le disque
     */
    private String saveFile(MultipartFile file, UUID applicationId) throws IOException {
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = applicationId.toString() + "_" + System.currentTimeMillis() + fileExtension;
        
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        return fileName;
    }
    
    /**
     * Extrait le texte du fichier CV
     */
    private String extractTextFromFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        
        if (contentType.equals("application/pdf")) {
            return extractPDFText(file);
        } else if (contentType.equals("application/msword") || 
                   contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            return extractWordText(file);
        }
        
        throw new IllegalArgumentException("Type de fichier non supporté");
    }
    
    /**
     * Extrait le texte d'un fichier PDF (simulation)
     */
    private String extractPDFText(MultipartFile file) throws IOException {
        // Simulation d'extraction PDF
        // En production, utiliser Apache PDFBox ou iText
        return "SIMULATION_PDF_TEXT\n" +
               "Jean Dupont\n" +
               "jean.dupont@email.com\n" +
               "06 12 34 56 78\n" +
               "Paris, France\n" +
               "linkedin.com/in/jeandupont\n" +
               "github.com/jeandupont\n\n" +
               "EXPÉRIENCE\n" +
               "Développeur Java - Société A (2020-2023)\n" +
               "Développement d'applications web avec Spring Boot et React\n" +
               "Maintenance de bases de données PostgreSQL\n" +
               "Collaboration avec l'équipe agile\n\n" +
               "Stagiaire Développement - Entreprise B (2019-2020)\n" +
               "Développement de fonctionnalités en Java et JavaScript\n" +
               "Tests unitaires et intégration continue\n\n" +
               "FORMATION\n" +
               "Licence Informatique - Université X (2017-2020)\n" +
               "Baccalauréat Scientifique - Lycée Y (2015-2017)\n\n" +
               "COMPÉTENCES\n" +
               "Langages: Java, Python, JavaScript, SQL\n" +
               "Frameworks: Spring Boot, React, Hibernate\n" +
               "Bases de données: PostgreSQL, MySQL, Redis\n" +
               "Outils: Git, Docker, Jenkins, AWS\n\n" +
               "PROJETS\n" +
               "Application de gestion de tâches (Spring Boot + React)\n" +
               "API RESTful avec documentation Swagger\n" +
               "Déploiement sur AWS avec Docker\n\n" +
               "LANGUES\n" +
               "Français: Natif\n" +
               "Anglais: Professionnel";
    }
    
    /**
     * Extrait le texte d'un fichier Word (simulation)
     */
    private String extractWordText(MultipartFile file) throws IOException {
        // Simulation d'extraction Word
        // En production, utiliser Apache POI
        return extractPDFText(file); // Même simulation pour l'instant
    }
    
    /**
     * Analyse le texte extrait du CV
     */
    private CVAnalysisDTO analyzeCVText(String cvText, UUID applicationId, String fileName) {
        CVAnalysisDTO analysis = new CVAnalysisDTO(applicationId.toString(), "");
        analysis.setFileName(fileName);
        analysis.setParsingMethod("TEXT_PARSER");
        
        // Extraire les informations de base
        extractBasicInformation(cvText, analysis);
        
        // Extraire l'expérience
        extractExperience(cvText, analysis);
        
        // Extraire l'éducation
        extractEducation(cvText, analysis);
        
        // Extraire les compétences techniques
        extractTechnicalSkills(cvText, analysis);
        
        // Extraire les projets
        extractProjects(cvText, analysis);
        
        // Extraire les langues
        extractLanguages(cvText, analysis);
        
        // Calculer les scores
        calculateScores(analysis);
        
        // Valider la complétude
        validateCompleteness(analysis);
        
        analysis.setParsingSuccessful(true);
        
        return analysis;
    }
    
    /**
     * Extrait les informations de base
     */
    private void extractBasicInformation(String cvText, CVAnalysisDTO analysis) {
        String[] lines = cvText.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            
            // Email
            Matcher emailMatcher = EMAIL_PATTERN.matcher(line);
            if (emailMatcher.find() && analysis.getEmail() == null) {
                analysis.setEmail(emailMatcher.group());
            }
            
            // Téléphone
            Matcher phoneMatcher = PHONE_PATTERN.matcher(line);
            if (phoneMatcher.find() && analysis.getPhone() == null) {
                analysis.setPhone(phoneMatcher.group());
            }
            
            // LinkedIn
            Matcher linkedinMatcher = LINKEDIN_PATTERN.matcher(line.toLowerCase());
            if (linkedinMatcher.find() && analysis.getLinkedinUrl() == null) {
                analysis.setLinkedinUrl("https://" + linkedinMatcher.group());
            }
            
            // GitHub
            Matcher githubMatcher = GITHUB_PATTERN.matcher(line.toLowerCase());
            if (githubMatcher.find() && analysis.getGithubUrl() == null) {
                analysis.setGithubUrl("https://" + githubMatcher.group());
            }
            
            // Nom (première ligne non vide)
            if (analysis.getFullName() == null && line.length() > 2 && 
                !line.contains("@") && !line.contains("http") && 
                !line.toUpperCase().equals(line)) {
                analysis.setFullName(line);
            }
        }
    }
    
    /**
     * Extrait l'expérience professionnelle
     */
    private void extractExperience(String cvText, CVAnalysisDTO analysis) {
        List<CVAnalysisDTO.ExperienceDTO> experiences = new ArrayList<>();
        
        // Simulation d'extraction d'expérience
        CVAnalysisDTO.ExperienceDTO exp1 = new CVAnalysisDTO.ExperienceDTO();
        exp1.setCompany("Société A");
        exp1.setPosition("Développeur Java");
        exp1.setLocation("Paris, France");
        exp1.setStartDate(LocalDateTime.of(2020, 9, 1, 0, 0));
        exp1.setEndDate(LocalDateTime.of(2023, 8, 31, 0, 0));
        exp1.setCurrent(false);
        exp1.setDescription("Développement d'applications web avec Spring Boot et React");
        exp1.setAchievements(Arrays.asList(
            "Maintenance de bases de données PostgreSQL",
            "Collaboration avec l'équipe agile"
        ));
        exp1.setDuration("3 ans");
        
        CVAnalysisDTO.ExperienceDTO exp2 = new CVAnalysisDTO.ExperienceDTO();
        exp2.setCompany("Entreprise B");
        exp2.setPosition("Stagiaire Développement");
        exp2.setLocation("Lyon, France");
        exp2.setStartDate(LocalDateTime.of(2019, 6, 1, 0, 0));
        exp2.setEndDate(LocalDateTime.of(2020, 8, 31, 0, 0));
        exp2.setCurrent(false);
        exp2.setDescription("Développement de fonctionnalités en Java et JavaScript");
        exp2.setAchievements(Arrays.asList(
            "Tests unitaires et intégration continue"
        ));
        exp2.setDuration("1 an 3 mois");
        
        experiences.add(exp1);
        experiences.add(exp2);
        
        analysis.setExperiences(experiences);
        analysis.setTotalExperienceYears(calculateTotalExperience(experiences));
        analysis.setExperienceLevel(determineExperienceLevel(analysis.getTotalExperienceYears()));
    }
    
    /**
     * Extrait la formation
     */
    private void extractEducation(String cvText, CVAnalysisDTO analysis) {
        List<CVAnalysisDTO.EducationDTO> education = new ArrayList<>();
        
        // Simulation d'extraction de formation
        CVAnalysisDTO.EducationDTO edu1 = new CVAnalysisDTO.EducationDTO();
        edu1.setInstitution("Université X");
        edu1.setDegree("Licence Informatique");
        edu1.setFieldOfStudy("Informatique");
        edu1.setStartDate(LocalDateTime.of(2017, 9, 1, 0, 0));
        edu1.setEndDate(LocalDateTime.of(2020, 6, 30, 0, 0));
        edu1.setDescription("Formation en développement logiciel et bases de données");
        
        CVAnalysisDTO.EducationDTO edu2 = new CVAnalysisDTO.EducationDTO();
        edu2.setInstitution("Lycée Y");
        edu2.setDegree("Baccalauréat Scientifique");
        edu2.setFieldOfStudy("Sciences");
        edu2.setStartDate(LocalDateTime.of(2015, 9, 1, 0, 0));
        edu2.setEndDate(LocalDateTime.of(2017, 6, 30, 0, 0));
        
        education.add(edu1);
        education.add(edu2);
        
        analysis.setEducation(education);
        analysis.setHighestDegree("Licence");
        analysis.setFieldOfStudy("Informatique");
    }
    
    /**
     * Extrait les compétences techniques
     */
    private void extractTechnicalSkills(String cvText, CVAnalysisDTO analysis) {
        String lowerText = cvText.toLowerCase();
        
        List<String> programmingLanguages = new ArrayList<>();
        List<String> frameworks = new ArrayList<>();
        List<String> databases = new ArrayList<>();
        List<String> tools = new ArrayList<>();
        List<String> allSkills = new ArrayList<>();
        
        // Langages de programmation
        for (String lang : PROGRAMMING_LANGUAGES) {
            if (lowerText.contains(lang)) {
                programmingLanguages.add(lang.toUpperCase());
                allSkills.add(lang.toUpperCase());
            }
        }
        
        // Frameworks
        for (String framework : FRAMEWORKS) {
            if (lowerText.contains(framework)) {
                frameworks.add(framework.toUpperCase());
                allSkills.add(framework.toUpperCase());
            }
        }
        
        // Bases de données
        for (String db : DATABASES) {
            if (lowerText.contains(db)) {
                databases.add(db.toUpperCase());
                allSkills.add(db.toUpperCase());
            }
        }
        
        // Outils
        for (String tool : TOOLS) {
            if (lowerText.contains(tool)) {
                tools.add(tool.toUpperCase());
                allSkills.add(tool.toUpperCase());
            }
        }
        
        analysis.setProgrammingLanguages(programmingLanguages);
        analysis.setFrameworks(frameworks);
        analysis.setDatabases(databases);
        analysis.setTools(tools);
        analysis.setTechnicalSkills(allSkills);
    }
    
    /**
     * Extrait les projets
     */
    private void extractProjects(String cvText, CVAnalysisDTO analysis) {
        List<CVAnalysisDTO.ProjectDTO> projects = new ArrayList<>();
        
        // Simulation d'extraction de projets
        CVAnalysisDTO.ProjectDTO project = new CVAnalysisDTO.ProjectDTO();
        project.setName("Application de gestion de tâches");
        project.setDescription("Application web pour la gestion de tâches personnelles");
        project.setTechnologies(Arrays.asList("SPRING BOOT", "REACT", "POSTGRESQL", "DOCKER"));
        project.setRole("Développeur full-stack");
        project.setStartDate(LocalDateTime.of(2022, 1, 1, 0, 0));
        project.setEndDate(LocalDateTime.of(2022, 6, 30, 0, 0));
        project.setAchievements(Arrays.asList(
            "API RESTful avec documentation Swagger",
            "Déploiement sur AWS avec Docker"
        ));
        
        projects.add(project);
        analysis.setProjects(projects);
    }
    
    /**
     * Extrait les langues
     */
    private void extractLanguages(String cvText, CVAnalysisDTO analysis) {
        Map<String, String> languages = new HashMap<>();
        
        // Simulation d'extraction de langues
        languages.put("Français", "Natif");
        languages.put("Anglais", "Professionnel");
        
        analysis.setLanguages(languages);
    }
    
    /**
     * Calcule les différents scores
     */
    private void calculateScores(CVAnalysisDTO analysis) {
        // Score de complétude (0-1)
        double completenessScore = 0.0;
        int totalFields = 10;
        int filledFields = 0;
        
        if (analysis.getFullName() != null) filledFields++;
        if (analysis.getEmail() != null) filledFields++;
        if (analysis.getPhone() != null) filledFields++;
        if (analysis.getExperiences() != null && !analysis.getExperiences().isEmpty()) filledFields++;
        if (analysis.getEducation() != null && !analysis.getEducation().isEmpty()) filledFields++;
        if (analysis.getTechnicalSkills() != null && !analysis.getTechnicalSkills().isEmpty()) filledFields++;
        if (analysis.getProjects() != null && !analysis.getProjects().isEmpty()) filledFields++;
        if (analysis.getLanguages() != null && !analysis.getLanguages().isEmpty()) filledFields++;
        if (analysis.getGithubUrl() != null) filledFields++;
        if (analysis.getLinkedinUrl() != null) filledFields++;
        
        completenessScore = (double) filledFields / totalFields;
        analysis.setCompletenessScore(completenessScore);
        
        // Score technique (0-1)
        double technicalScore = 0.0;
        if (analysis.getTechnicalSkills() != null) {
            int skillCount = analysis.getTechnicalSkills().size();
            technicalScore = Math.min(1.0, skillCount / 10.0); // 10+ compétences = score parfait
        }
        analysis.setTechnicalScore(technicalScore);
        
        // Score d'expérience (0-1)
        double experienceScore = Math.min(1.0, analysis.getTotalExperienceYears() / 5.0); // 5+ ans = score parfait
        analysis.setExperienceScore(experienceScore);
        
        // Score global
        analysis.setOverallScore((completenessScore + technicalScore + experienceScore) / 3.0);
    }
    
    /**
     * Valide la complétude et identifie les informations manquantes
     */
    private void validateCompleteness(CVAnalysisDTO analysis) {
        List<String> missingInfo = new ArrayList<>();
        
        if (analysis.getFullName() == null) missingInfo.add("Nom complet");
        if (analysis.getEmail() == null) missingInfo.add("Email");
        if (analysis.getPhone() == null) missingInfo.add("Téléphone");
        if (analysis.getExperiences() == null || analysis.getExperiences().isEmpty()) {
            missingInfo.add("Expérience professionnelle");
        }
        if (analysis.getEducation() == null || analysis.getEducation().isEmpty()) {
            missingInfo.add("Formation");
        }
        if (analysis.getTechnicalSkills() == null || analysis.getTechnicalSkills().isEmpty()) {
            missingInfo.add("Compétences techniques");
        }
        
        analysis.setMissingInformation(missingInfo);
    }
    
    /**
     * Calcule le total d'années d'expérience
     */
    private int calculateTotalExperience(List<CVAnalysisDTO.ExperienceDTO> experiences) {
        int totalMonths = 0;
        
        for (CVAnalysisDTO.ExperienceDTO exp : experiences) {
            if (exp.getStartDate() != null && exp.getEndDate() != null) {
                long months = java.time.temporal.ChronoUnit.MONTHS.between(
                    exp.getStartDate(), exp.getEndDate());
                totalMonths += months;
            }
        }
        
        return totalMonths / 12; // Convertir en années
    }
    
    /**
     * Détermine le niveau d'expérience
     */
    private String determineExperienceLevel(int years) {
        if (years < 1) return "JUNIOR";
        if (years < 3) return "INTERMEDIATE";
        return "SENIOR";
    }
    
    /**
     * Enrichit l'analyse avec les données de la candidature
     */
    private void enrichWithApplicationData(CVAnalysisDTO analysis, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application != null) {
            analysis.setCandidateName(application.getCandidate().getFirstName() + " " + 
                                     application.getCandidate().getLastName());
            
            // Calculer la correspondance avec le poste
            if (application.getJob() != null) {
                calculateJobMatch(analysis, application.getJob());
            }
        }
    }
    
    /**
     * Calcule la correspondance avec le poste
     */
    private void calculateJobMatch(CVAnalysisDTO analysis, Job job) {
        Map<String, Double> matchScores = new HashMap<>();
        double totalScore = 0.0;
        int criteriaCount = 0;
        
        String jobTitle = job.getTitle().toLowerCase();
        String jobDescription = job.getDescription().toLowerCase();
        
        // Correspondance des compétences techniques
        if (analysis.getTechnicalSkills() != null) {
            for (String skill : analysis.getTechnicalSkills()) {
                double skillScore = 0.0;
                if (jobTitle.contains(skill.toLowerCase()) || jobDescription.contains(skill.toLowerCase())) {
                    skillScore = 1.0;
                } else if (isRelatedSkill(skill, jobTitle)) {
                    skillScore = 0.7;
                } else {
                    skillScore = 0.3;
                }
                matchScores.put(skill, skillScore);
                totalScore += skillScore;
                criteriaCount++;
            }
        }
        
        // Correspondance du niveau d'expérience
        if (jobTitle.contains("junior") && "JUNIOR".equals(analysis.getExperienceLevel())) {
            matchScores.put("experience_level", 1.0);
            totalScore += 1.0;
            criteriaCount++;
        } else if (jobTitle.contains("senior") && "SENIOR".equals(analysis.getExperienceLevel())) {
            matchScores.put("experience_level", 1.0);
            totalScore += 1.0;
            criteriaCount++;
        } else {
            matchScores.put("experience_level", 0.5);
            totalScore += 0.5;
            criteriaCount++;
        }
        
        double overallMatch = criteriaCount > 0 ? totalScore / criteriaCount : 0.0;
        analysis.setJobMatchScores(matchScores);
        analysis.setOverallJobMatch(overallMatch);
    }
    
    /**
     * Vérifie si une compétence est liée au poste
     */
    private boolean isRelatedSkill(String skill, String jobTitle) {
        // Logique simple pour déterminer si une compétence est pertinente
        if (jobTitle.contains("java") && skill.equals("JAVA")) return true;
        if (jobTitle.contains("web") && (skill.equals("REACT") || skill.equals("JAVASCRIPT"))) return true;
        if (jobTitle.contains("backend") && (skill.equals("SPRING") || skill.equals("DATABASES"))) return true;
        if (jobTitle.contains("frontend") && (skill.equals("REACT") || skill.equals("VUE"))) return true;
        
        return false;
    }
}
