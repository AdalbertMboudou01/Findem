package com.memoire.assistant.service;

import com.memoire.assistant.dto.GithubAnalysisDTO;
import com.memoire.assistant.dto.GithubSkillsAnalysisDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class GitHubAnalysisService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    // Configuration pour le rate limiting et retry
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000; // 1 seconde entre les tentatives
    
    private static final String GITHUB_API_URL = "https://api.github.com";
    
    // Mapping simple des technologies
    private static final Map<String, String> TECHNOLOGY_MAPPING = new HashMap<>();
    
    static {
        TECHNOLOGY_MAPPING.put("javascript", "javascript,typescript,react,vue,angular,node.js,npm");
        TECHNOLOGY_MAPPING.put("python", "python,django,flask,fastapi,pip,sql");
        TECHNOLOGY_MAPPING.put("java", "java,spring,maven,gradle,jvm");
        TECHNOLOGY_MAPPING.put("typescript", "typescript,javascript,react,vue,angular,node.js,npm");
        TECHNOLOGY_MAPPING.put("react", "react,javascript,typescript,redux,jsx");
        TECHNOLOGY_MAPPING.put("vue", "vue,javascript,typescript,vuex");
        TECHNOLOGY_MAPPING.put("angular", "angular,typescript,rxjs,html,css");
        TECHNOLOGY_MAPPING.put("node", "node.js,npm,express,javascript");
        TECHNOLOGY_MAPPING.put("spring", "spring,java,maven,gradle");
        TECHNOLOGY_MAPPING.put("django", "django,python,sql");
        TECHNOLOGY_MAPPING.put("flask", "flask,python,sql");
        TECHNOLOGY_MAPPING.put("express", "express,node.js,npm,javascript");
        TECHNOLOGY_MAPPING.put("sql", "sql,mysql,postgresql,oracle");
        TECHNOLOGY_MAPPING.put("mongodb", "mongodb,nosql,database");
        TECHNOLOGY_MAPPING.put("redis", "redis,cache,database");
        TECHNOLOGY_MAPPING.put("docker", "docker,kubernetes,devops");
        TECHNOLOGY_MAPPING.put("kubernetes", "kubernetes,docker,devops");
        TECHNOLOGY_MAPPING.put("aws", "aws,cloud,ec2,s3");
        TECHNOLOGY_MAPPING.put("azure", "azure,microsoft,cloud");
        TECHNOLOGY_MAPPING.put("android", "android,java,kotlin,mobile");
        TECHNOLOGY_MAPPING.put("ios", "ios,swift,mobile,xcode");
        TECHNOLOGY_MAPPING.put("git", "git,github,gitlab");
    }
    
    public GithubAnalysisDTO analyzeGitHubProfile(String githubUrl) {
        if (githubUrl == null || githubUrl.trim().isEmpty()) {
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(false);
            result.setError("URL GitHub non fournie");
            return result;
        }
        
        try {
            String username = extractGitHubUsername(githubUrl);
            if (username == null) {
                GithubAnalysisDTO result = new GithubAnalysisDTO();
                result.setSuccess(false);
                result.setError("URL GitHub invalide");
                return result;
            }
            
            // Récupérer les informations du profil
            Map<String, Object> profileInfo = getGitHubUserProfile(username);
            if (profileInfo == null) {
                GithubAnalysisDTO result = new GithubAnalysisDTO();
                result.setSuccess(false);
                result.setError("Profil GitHub introuvable");
                return result;
            }
            
            // Récupérer les repositories publics
            List<Map<String, Object>> repositories = getUserRepositories(username);
            
            // Analyser les repositories
            GithubSkillsAnalysisDTO skillsAnalysis = analyzeRepositories(repositories);
            
            // Créer le résultat
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(true);
            result.setUsername(username);
            result.setProfileInfo(profileInfo);
            result.setPublicRepositories(repositories.size());
            result.setTotalStars(calculateTotalStars(repositories));
            result.setTotalForks(calculateTotalForks(repositories));
            result.setLanguages(skillsAnalysis.getLanguages());
            result.setTechnologies(skillsAnalysis.getTechnologies());
            result.setProjectHighlights(skillsAnalysis.getProjectHighlights());
            result.setActivityScore(calculateActivityScore(repositories));
            result.setProfileCompleteness(calculateProfileCompleteness(profileInfo));
            
            return result;
            
        } catch (Exception e) {
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(false);
            result.setError("Erreur lors de l'analyse GitHub: " + e.getMessage());
            return result;
        }
    }
    
    public GithubAnalysisDTO analyzePortfolio(String portfolioUrl) {
        if (portfolioUrl == null || portfolioUrl.trim().isEmpty()) {
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(false);
            result.setError("URL portfolio non fournie");
            return result;
        }
        
        try {
            Map<String, Object> portfolioInfo = analyzePortfolioContent(portfolioUrl);
            
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(true);
            result.setPortfolioUrl(portfolioUrl);
            result.setPortfolioInfo(portfolioInfo);
            result.setHasPortfolio(true);
            
            return result;
            
        } catch (Exception e) {
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(false);
            result.setError("Erreur lors de l'analyse portfolio: " + e.getMessage());
            return result;
        }
    }
    
    public String extractGitHubUsername(String githubUrl) {
        Pattern pattern = Pattern.compile("github\\.com/([^/?]+)");
        Matcher matcher = pattern.matcher(githubUrl);
        if (matcher.find()) {
            String username = matcher.group(1);
            return username.replaceAll("/.*$", "");
        }
        return null;
    }
    
    public Map<String, Object> getGitHubUserProfile(String username) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                String url = GITHUB_API_URL + "/users/" + username;
                
                // Utiliser le RestTemplate par défaut (configuré globalement)
                // Note: Pour une configuration avancée, utiliser RestTemplateBuilder dans une @Bean séparée
                
                // Ajouter un header User-Agent pour éviter les erreurs 403
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Memoire-Assistant/1.0");
                headers.set("Accept", "application/vnd.github.v3+json");
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                try {
                    ResponseEntity<Map> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity, Map.class);
                    
                    if (response.getStatusCode().is2xxSuccessful()) {
                        return response.getBody();
                    } else {
                        // Loguer l'erreur
                        System.err.println("Erreur API GitHub: " + response.getStatusCode() + " - " + username);
                    }
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'appel API GitHub: " + e.getMessage());
                }
            } catch (Exception e) {
                // Gérer l'exception
            } finally {
                // Nettoyage des ressources si nécessaire
                // Note: Le finally s'exécute même en cas d'exception
            }
        }
        return null; // Retourner null si toutes les tentatives échouent
    }
    
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getUserRepositories(String username) {
        try {
            String url = GITHUB_API_URL + "/users/" + username + "/repos";
            
            // Ajouter un header User-Agent pour éviter les erreurs 403
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Memoire-Assistant/1.0");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map[]> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map[].class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return Arrays.asList(response.getBody());
            } else {
                return new ArrayList<>();
            }
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private GithubSkillsAnalysisDTO analyzeRepositories(List<Map<String, Object>> repositories) {
        Set<String> languages = new HashSet<>();
        Set<String> technologies = new HashSet<>();
        List<String> projectHighlights = new ArrayList<>();
        
        for (Map<String, Object> repo : repositories) {
            String language = (String) repo.get("language");
            String description = (String) repo.get("description");
            Integer stars = (Integer) repo.get("stargazers_count");
            
            // Extraire les langages
            if (language != null && !language.trim().isEmpty()) {
                languages.add(language);
            }
            
            // Extraire les technologies via mapping
            if (language != null) {
                String mappedTechs = TECHNOLOGY_MAPPING.get(language.toLowerCase());
                if (mappedTechs != null) {
                    technologies.addAll(Arrays.asList(mappedTechs.split(",")));
                }
            }
            
            // Générer les highlights des projets
            if (isMajorProject(repo)) {
                String name = (String) repo.get("name");
                String highlight = "🔥 " + name;
                if (language != null) {
                    highlight += " (" + language + ")";
                }
                if (stars != null && stars > 0) {
                    highlight += " - " + stars + " ⭐";
                }
                if (description != null && !description.trim().isEmpty()) {
                    String desc = description.length() > 100 ? 
                        description.substring(0, 100) + "..." : description;
                    highlight += ": " + desc;
                }
                projectHighlights.add(highlight);
            }
        }
        
        GithubSkillsAnalysisDTO result = new GithubSkillsAnalysisDTO();
        result.setLanguages(new ArrayList<>(languages));
        result.setTechnologies(new ArrayList<>(technologies));
        result.setProjectHighlights(projectHighlights);
        
        return result;
    }
    
    public boolean isMajorProject(Map<String, Object> repo) {
        String name = (String) repo.get("name");
        String description = (String) repo.get("description");
        Integer stars = (Integer) repo.get("stargazers_count");
        Integer size = (Integer) repo.get("size");
        
        // Critères pour identifier un projet majeur
        if (stars != null && stars >= 50) return true;  // Projet populaire
        if (size != null && size > 1000) return true;  // Projet substantiel
        if (description != null && description.length() > 200) return true;  // Description détaillée
        
        // Technologies de projet majeur
        if (name != null) {
            String lowerName = name.toLowerCase();
            return lowerName.contains("api") || lowerName.contains("server") || 
                   lowerName.contains("platform") || lowerName.contains("framework") ||
                   lowerName.contains("engine") || lowerName.contains("system") ||
                   lowerName.contains("microservice") || lowerName.contains("architecture");
        }
        
        return false;
    }
    
    private int calculateTotalStars(List<Map<String, Object>> repositories) {
        return repositories.stream()
                .mapToInt(repo -> (Integer) repo.getOrDefault("stargazers_count", 0))
                .sum();
    }
    
    private int calculateTotalForks(List<Map<String, Object>> repositories) {
        return repositories.stream()
                .mapToInt(repo -> (Integer) repo.getOrDefault("forks_count", 0))
                .sum();
    }
    
    private int calculateActivityScore(List<Map<String, Object>> repositories) {
        int score = 0;
        long now = System.currentTimeMillis();
        long oneYearAgo = now - (365L * 24 * 60 * 60 * 1000);
        long sixMonthsAgo = now - (180L * 24 * 60 * 60 * 1000);
        
        int majorProjects = 0;
        int recentProjects = 0;
        
        for (Map<String, Object> repo : repositories) {
            String updatedAt = (String) repo.get("updated_at");
            if (updatedAt != null) {
                try {
                    long updateTime = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z").parse(updatedAt).getTime();
                    
                    if (updateTime > sixMonthsAgo) {
                        recentProjects++;
                        if (isMajorProject(repo)) {
                            score += 20; // Projet majeur récent
                        } else {
                            score += 10; // Projet normal récent
                        }
                    } else if (updateTime > oneYearAgo) {
                        if (isMajorProject(repo)) {
                            score += 10; // Projet majeur de l'année dernière
                        } else {
                            score += 5; // Projet normal de l'année dernière
                        }
                    } else {
                        if (isMajorProject(repo)) {
                            score += 5; // Projet majeur ancien
                        } else {
                            score += 1; // Projet normal ancien
                        }
                    }
                } catch (Exception e) {
                    // Ignorer les erreurs de parsing
                }
            }
            
            if (isMajorProject(repo)) majorProjects++;
        }
        
        // Bonus pour les projets majeurs
        if (majorProjects > 0) {
            score += majorProjects * 5; // Bonus pour avoir des projets majeurs
        }
        
        // Bonus pour l'activité récente
        if (recentProjects > 2) {
            score += 10; // Très actif
        } else if (recentProjects > 0) {
            score += 5; // Actif
        }
        
        return Math.min(score, 100);
    }
    
    private double calculateProfileCompleteness(Map<String, Object> profileInfo) {
        if (profileInfo == null) return 0.0;
        
        double score = 0.0;
        
        // Bio (25%)
        String bio = (String) profileInfo.get("bio");
        if (bio != null && !bio.trim().isEmpty()) {
            score += 25;
        }
        
        // Localisation (15%)
        String location = (String) profileInfo.get("location");
        if (location != null && !location.trim().isEmpty()) {
            score += 15;
        }
        
        // Email (15%)
        String email = (String) profileInfo.get("email");
        if (email != null && !email.trim().isEmpty()) {
            score += 15;
        }
        
        // Company (20%)
        String company = (String) profileInfo.get("company");
        if (company != null && !company.trim().isEmpty()) {
            score += 20;
        }
        
        // Public repos (15%)
        Integer publicRepos = (Integer) profileInfo.get("public_repos");
        if (publicRepos != null && publicRepos > 0) {
            score += 15;
        }
        
        // Followers (10%)
        Integer followers = (Integer) profileInfo.get("followers");
        if (followers != null && followers > 0) {
            score += Math.min(10, followers / 10.0);
        }
        
        return Math.min(score, 100.0);
    }
    
    private Map<String, Object> analyzePortfolioContent(String portfolioUrl) {
        Map<String, Object> info = new HashMap<>();
        
        try {
            // Simulation d'analyse de portfolio
            info.put("accessible", true);
            info.put("technologies", Arrays.asList("HTML", "CSS", "JavaScript"));
            info.put("frameworks", Arrays.asList("React", "Vue", "Angular"));
            info.put("tools", Arrays.asList("Git", "Docker", "Webpack"));
            
            return info;
        } catch (Exception e) {
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("accessible", false);
            errorInfo.put("error", e.getMessage());
            return errorInfo;
        }
    }
}
