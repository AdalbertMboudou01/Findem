package com.memoire.assistant.controller;

import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.service.CandidateService;
import com.memoire.assistant.dto.CandidateCreateRequest;
import com.memoire.assistant.dto.CandidateSummaryDTO;
import com.memoire.assistant.dto.GithubAnalysisDTO;
import com.memoire.assistant.dto.GithubSkillsAnalysisDTO;
import com.memoire.assistant.dto.PortfolioAnalysisDTO;
import jakarta.validation.Valid;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {
    @Autowired
    private CandidateService candidateService;

    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateService.getAllCandidates();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable UUID id) {
        Optional<Candidate> candidate = candidateService.getCandidateById(id);
        return candidate.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Candidate createCandidate(@Valid @RequestBody CandidateCreateRequest request) {
        Candidate candidate = new Candidate();
        candidate.setFirstName(request.getFirstName());
        candidate.setLastName(request.getLastName());
        candidate.setEmail(request.getEmail());
        candidate.setPhone(request.getPhone());
        candidate.setLocation(request.getLocation());
        candidate.setSchool(request.getSchool());
        candidate.setConsent(request.getConsent());
        candidate.setGithubUrl(request.getGithubUrl());
        candidate.setPortfolioUrl(request.getPortfolioUrl());
        return candidateService.saveCandidate(candidate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable UUID id, @RequestBody Candidate candidate) {
        if (!candidateService.getCandidateById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        candidate.setCandidateId(id);
        Optional<Candidate> existingOpt = candidateService.getCandidateById(id);
        if (existingOpt.isPresent()) {
            Candidate existing = existingOpt.get();
            if (candidate.getGithubUrl() == null) candidate.setGithubUrl(existing.getGithubUrl());
            if (candidate.getPortfolioUrl() == null) candidate.setPortfolioUrl(existing.getPortfolioUrl());
        }
        return ResponseEntity.ok(candidateService.saveCandidate(candidate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable UUID id) {
        if (!candidateService.getCandidateById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        candidateService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }

    // --- Gestion du vivier ---
    @PostMapping("/{id}/pool")
    public ResponseEntity<Candidate> addToPool(@PathVariable UUID id) {
        Optional<Candidate> candidateOpt = candidateService.getCandidateById(id);
        if (candidateOpt.isEmpty()) return ResponseEntity.notFound().build();
        Candidate candidate = candidateOpt.get();
        candidate.setInPool(true);
        return ResponseEntity.ok(candidateService.saveCandidate(candidate));
    }

    @DeleteMapping("/{id}/pool")
    public ResponseEntity<Candidate> removeFromPool(@PathVariable UUID id) {
        Optional<Candidate> candidateOpt = candidateService.getCandidateById(id);
        if (candidateOpt.isEmpty()) return ResponseEntity.notFound().build();
        Candidate candidate = candidateOpt.get();
        candidate.setInPool(false);
        return ResponseEntity.ok(candidateService.saveCandidate(candidate));
    }

    @GetMapping("/pool")
    public List<Candidate> getPoolCandidates() {
        return candidateService.getPoolCandidates();
    }

    // --- Synthèse candidat ---
    @GetMapping("/{id}/summary")
    public ResponseEntity<CandidateSummaryDTO> getCandidateSummary(@PathVariable UUID id) {
        Optional<CandidateSummaryDTO> summary = candidateService.getCandidateSummary(id);
        return summary.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- Analyse GitHub simple ---
    @GetMapping("/{id}/github-analysis")
    public ResponseEntity<GithubAnalysisDTO> analyzeGithub(@PathVariable UUID id) {
        Optional<Candidate> candidateOpt = candidateService.getCandidateById(id);
        if (candidateOpt.isEmpty()) return ResponseEntity.notFound().build();
        Candidate candidate = candidateOpt.get();
        String githubUrl = candidate.getGithubUrl();
        if (githubUrl == null || githubUrl.isBlank()) return ResponseEntity.badRequest().build();
        String username = githubUrl.replaceAll("https?://(www\\.)?github.com/", "").replaceAll("/.*$", "");
        RestTemplate restTemplate = new RestTemplate();
        String apiUrl = "https://api.github.com/users/" + username;
        try {
            var response = restTemplate.getForObject(apiUrl, java.util.Map.class);
            if (response == null) return ResponseEntity.notFound().build();
            GithubAnalysisDTO dto = new GithubAnalysisDTO();
            dto.setUsername(username);
            dto.setPublicRepos((Integer) response.getOrDefault("public_repos", 0));
            dto.setFollowers((Integer) response.getOrDefault("followers", 0));
            dto.setFollowing((Integer) response.getOrDefault("following", 0));
            dto.setProfileUrl((String) response.getOrDefault("html_url", githubUrl));
            dto.setAvatarUrl((String) response.getOrDefault("avatar_url", null));
            dto.setLastActivity((String) response.getOrDefault("updated_at", null));
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }

    // --- Analyse avancée des compétences GitHub ---
    @PostMapping("/{id}/github-skills-analysis")
    public ResponseEntity<GithubSkillsAnalysisDTO> analyzeGithubSkills(@PathVariable UUID id, @RequestBody List<String> skills) {
        Optional<Candidate> candidateOpt = candidateService.getCandidateById(id);
        if (candidateOpt.isEmpty()) return ResponseEntity.notFound().build();
        Candidate candidate = candidateOpt.get();
        String githubUrl = candidate.getGithubUrl();
        if (githubUrl == null || githubUrl.isBlank()) return ResponseEntity.badRequest().build();
        String username = githubUrl.replaceAll("https?://(www\\.)?github.com/", "").replaceAll("/.*$", "");
        try {
            RestTemplate restTemplate = new RestTemplate();
            String reposUrl = "https://api.github.com/users/" + username + "/repos";
            var repos = restTemplate.getForObject(reposUrl, java.util.List.class);
            java.util.Set<String> found = new java.util.HashSet<>();
            if (repos != null) {
                for (Object repoObj : repos) {
                    if (!(repoObj instanceof java.util.Map)) continue;
                    java.util.Map repo = (java.util.Map) repoObj;
                    String desc = repo.getOrDefault("description", "").toString().toLowerCase();
                    String lang = repo.getOrDefault("language", "").toString().toLowerCase();
                    for (String skill : skills) {
                        String skillLc = skill.toLowerCase();
                        if (desc.contains(skillLc) || lang.contains(skillLc)) found.add(skill);
                    }
                }
            }
            java.util.List<String> foundList = new java.util.ArrayList<>(found);
            java.util.List<String> missing = new java.util.ArrayList<>();
            for (String skill : skills) if (!found.contains(skill)) missing.add(skill);
            GithubSkillsAnalysisDTO dto = new GithubSkillsAnalysisDTO();
            dto.setUsername(username);
            dto.setFoundSkills(foundList);
            dto.setMissingSkills(missing);
            dto.setRepoCount(repos != null ? repos.size() : 0);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }

    // --- Analyse avancée du portfolio ---
    @PostMapping("/{id}/portfolio-analysis")
    public ResponseEntity<PortfolioAnalysisDTO> analyzePortfolio(@PathVariable UUID id, @RequestBody List<String> skills) {
        Optional<Candidate> candidateOpt = candidateService.getCandidateById(id);
        if (candidateOpt.isEmpty()) return ResponseEntity.notFound().build();
        Candidate candidate = candidateOpt.get();
        String portfolioUrl = candidate.getPortfolioUrl();
        if (portfolioUrl == null || portfolioUrl.isBlank()) return ResponseEntity.badRequest().build();
        PortfolioAnalysisDTO dto = new PortfolioAnalysisDTO();
        try {
            var doc = Jsoup.connect(portfolioUrl).timeout(5000).get();
            dto.setAccessible(true);
            dto.setPageTitle(doc.title());
            String text = doc.text().toLowerCase();
            List<String> found = new java.util.ArrayList<>();
            List<String> missing = new java.util.ArrayList<>();
            for (String skill : skills) {
                if (text.contains(skill.toLowerCase())) found.add(skill);
                else missing.add(skill);
            }
            dto.setFoundSkills(found);
            dto.setMissingSkills(missing);
        } catch (Exception e) {
            dto.setAccessible(false);
            dto.setPageTitle(null);
            dto.setFoundSkills(java.util.Collections.emptyList());
            dto.setMissingSkills(skills);
        }
        return ResponseEntity.ok(dto);
    }

}
