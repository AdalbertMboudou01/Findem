package com.memoire.assistant.repository;

import com.memoire.assistant.model.CVAnalysis;
import com.memoire.assistant.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CVAnalysisRepository extends JpaRepository<CVAnalysis, UUID> {
    
    /**
     * Trouve l'analyse CV par application
     */
    Optional<CVAnalysis> findByApplication_ApplicationId(UUID applicationId);
    
    /**
     * Trouve toutes les analyses avec un score technique supérieur à un seuil
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE cv.technicalScore > :minScore")
    List<CVAnalysis> findByTechnicalScoreGreaterThan(@Param("minScore") Double minScore);
    
    /**
     * Trouve toutes les analyses avec une expérience supérieure à un seuil
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE cv.experienceScore > :minScore")
    List<CVAnalysis> findByExperienceScoreGreaterThan(@Param("minScore") Double minScore);
    
    /**
     * Trouve toutes les analyses avec un score global supérieur à un seuil
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE cv.overallScore > :minScore")
    List<CVAnalysis> findByOverallScoreGreaterThan(@Param("minScore") Double minScore);
    
    /**
     * Trouve les analyses par niveau d'expérience
     */
    List<CVAnalysis> findByExperienceLevel(String experienceLevel);
    
    /**
     * Trouve les analyses contenant une compétence spécifique
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE :skill MEMBER OF cv.technicalSkills")
    List<CVAnalysis> findByTechnicalSkillContaining(@Param("skill") String skill);
    
    /**
     * Trouve les analyses contenant un langage de programmation spécifique
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE :language MEMBER OF cv.programmingLanguages")
    List<CVAnalysis> findByProgrammingLanguageContaining(@Param("language") String language);
    
    /**
     * Trouve les analyses contenant un framework spécifique
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE :framework MEMBER OF cv.frameworks")
    List<CVAnalysis> findByFrameworkContaining(@Param("framework") String framework);
    
    /**
     * Trouve les analyses avec une correspondance poste supérieure à un seuil
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE cv.overallJobMatch > :minMatch")
    List<CVAnalysis> findByJobMatchGreaterThan(@Param("minMatch") Double minMatch);
    
    /**
     * Compte le nombre d'analyses par niveau d'expérience
     */
    @Query("SELECT cv.experienceLevel, COUNT(cv) FROM CVAnalysis cv GROUP BY cv.experienceLevel")
    List<Object[]> countByExperienceLevel();
    
    /**
     * Trouve les analyses avec parsing réussi
     */
    List<CVAnalysis> findByParsingSuccessfulTrue();
    
    /**
     * Trouve les analyses avec parsing échoué
     */
    List<CVAnalysis> findByParsingSuccessfulFalse();
    
    /**
     * Recherche plein texte sur les compétences techniques
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE " +
           "LOWER(cv.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(cv.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           ":skill MEMBER OF cv.technicalSkills")
    List<CVAnalysis> searchByQuery(@Param("query") String query, @Param("skill") String skill);
    
    /**
     * Trouve les meilleures analyses selon le score global
     */
    @Query("SELECT cv FROM CVAnalysis cv ORDER BY cv.overallScore DESC")
    List<CVAnalysis> findTopByOverallScore();
    
    /**
     * Trouve les analyses par score de complétude
     */
    @Query("SELECT cv FROM CVAnalysis cv WHERE cv.completenessScore > :minCompleteness")
    List<CVAnalysis> findByCompletenessScoreGreaterThan(@Param("minCompleteness") Double minCompleteness);
    
    // Suppression de la méthode incompatible avec JPQL et la structure List<String> de technicalSkills.
    // Pour obtenir les compétences les plus fréquentes, il faut utiliser une requête native SQL ou traiter côté Java.
}
