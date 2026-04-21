package com.memoire.assistant.controller;

import com.memoire.assistant.dto.GithubAnalysisDTO;
import com.memoire.assistant.service.GitHubAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/github")
@Tag(name = "GitHub Analysis", description = "Analyse des profils GitHub et portfolios")
public class GitHubAnalysisController {
    
    @Autowired
    private GitHubAnalysisService gitHubAnalysisService;
    
    @Operation(summary = "Analyser un profil GitHub")
    @PostMapping("/analyze")
    public ResponseEntity<GithubAnalysisDTO> analyzeGitHub(@RequestParam String githubUrl) {
        if (githubUrl == null || githubUrl.trim().isEmpty()) {
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(false);
            result.setError("URL GitHub requise");
            return ResponseEntity.badRequest().body(result);
        }
        
        GithubAnalysisDTO result = gitHubAnalysisService.analyzeGitHubProfile(githubUrl);
        
        if (result.getSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @Operation(summary = "Analyser un portfolio")
    @PostMapping("/analyze-portfolio")
    public ResponseEntity<GithubAnalysisDTO> analyzePortfolio(@RequestParam String portfolioUrl) {
        if (portfolioUrl == null || portfolioUrl.trim().isEmpty()) {
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(false);
            result.setError("URL portfolio requise");
            return ResponseEntity.badRequest().body(result);
        }
        
        GithubAnalysisDTO result = gitHubAnalysisService.analyzePortfolio(portfolioUrl);
        
        if (result.getSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @Operation(summary = "Analyser GitHub et portfolio")
    @PostMapping("/analyze-both")
    public ResponseEntity<GithubAnalysisDTO> analyzeBoth(
            @RequestParam(required = false) String githubUrl,
            @RequestParam(required = false) String portfolioUrl) {
        
        // Analyser GitHub si fourni
        GithubAnalysisDTO githubResult = null;
        if (githubUrl != null && !githubUrl.trim().isEmpty()) {
            githubResult = gitHubAnalysisService.analyzeGitHubProfile(githubUrl);
        }
        
        // Analyser portfolio si fourni
        GithubAnalysisDTO portfolioResult = null;
        if (portfolioUrl != null && !portfolioUrl.trim().isEmpty()) {
            portfolioResult = gitHubAnalysisService.analyzePortfolio(portfolioUrl);
        }
        
        // Combiner les résultats
        if (githubResult != null && githubResult.getSuccess() && 
            portfolioResult != null && portfolioResult.getSuccess()) {
            
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(true);
            result.setUsername(githubResult.getUsername());
            result.setPortfolioUrl(portfolioResult.getPortfolioUrl());
            result.setProfileInfo(githubResult.getProfileInfo());
            result.setPortfolioInfo(portfolioResult.getPortfolioInfo());
            result.setPublicRepositories(githubResult.getPublicRepositories());
            result.setTotalStars(githubResult.getTotalStars());
            result.setTotalForks(githubResult.getTotalForks());
            result.setLanguages(githubResult.getLanguages());
            result.setTechnologies(githubResult.getTechnologies());
            result.setProjectHighlights(githubResult.getProjectHighlights());
            result.setActivityScore(githubResult.getActivityScore());
            result.setProfileCompleteness(githubResult.getProfileCompleteness());
            result.setHasPortfolio(true);
            
            return ResponseEntity.ok(result);
        } else if (githubResult != null && githubResult.getSuccess()) {
            return ResponseEntity.ok(githubResult);
        } else if (portfolioResult != null && portfolioResult.getSuccess()) {
            return ResponseEntity.ok(portfolioResult);
        } else {
            GithubAnalysisDTO result = new GithubAnalysisDTO();
            result.setSuccess(false);
            result.setError("Échec de l'analyse");
            return ResponseEntity.badRequest().body(result);
        }
    }
}
