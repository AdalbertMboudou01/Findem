package com.memoire.assistant.repository;

import com.memoire.assistant.model.ContractSignature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractSignatureRepository extends JpaRepository<ContractSignature, UUID> {
    
    /**
     * Trouve toutes les signatures pour une candidature
     */
    List<ContractSignature> findByApplication_ApplicationId(UUID applicationId);
    
    /**
     * Trouve une signature par son ID
     */
    Optional<ContractSignature> findBySignatureId(UUID signatureId);
    
    /**
     * Trouve la dernière signature pour une candidature
     */
    Optional<ContractSignature> findFirstByApplication_ApplicationIdOrderBySignedAtDesc(UUID applicationId);
    
    /**
     * Trouve les signatures expirées
     */
    @Query("SELECT cs FROM ContractSignature cs WHERE cs.status = 'EXPIRED' AND cs.expiresAt < :now")
    List<ContractSignature> findExpiredSignatures(@Param("now") java.time.LocalDateTime now);
    
    /**
     * Compte les signatures par statut
     */
    @Query("SELECT COUNT(cs) FROM ContractSignature cs WHERE cs.application.applicationId = :applicationId AND cs.status = :status")
    long countByApplicationIdAndStatus(@Param("applicationId") UUID applicationId, @Param("status") String status);
}
