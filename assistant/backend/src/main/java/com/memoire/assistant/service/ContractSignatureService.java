package com.memoire.assistant.service;

import com.memoire.assistant.model.ContractSignature;
import com.memoire.assistant.repository.ContractSignatureRepository;
import com.memoire.assistant.repository.ApplicationRepository;
import com.memoire.assistant.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ContractSignatureService {
    
    @Autowired
    private ContractSignatureRepository contractSignatureRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    /**
     * Créer une nouvelle signature de contrat
     */
    public ContractSignature createSignature(UUID applicationId, UUID candidateId, UUID recruiterId, String contractUrl, String signatureIp, String userAgent, String notes) {
        // Valider que la candidature existe
        if (!applicationRepository.existsById(applicationId)) {
            throw new IllegalArgumentException("Candidature non trouvée: " + applicationId);
        }
        
        // Valider que le candidat existe
        if (!candidateRepository.existsById(candidateId)) {
            throw new IllegalArgumentException("Candidat non trouvé: " + candidateId);
        }
        
        ContractSignature signature = new ContractSignature();
        signature.setApplication(applicationRepository.findById(applicationId).orElseThrow());
        signature.setCandidate(candidateRepository.findById(candidateId).orElseThrow());
        signature.setRecruiter(null); // Sera mis à jour par le contrôleur
        
        signature.setContractUrl(contractUrl);
        signature.setSignatureIp(signatureIp);
        signature.setUserAgent(userAgent);
        signature.setNotes(notes);
        
        return contractSignatureRepository.save(signature);
    }
    
    /**
     * Signer un contrat
     */
    public ContractSignature signContract(UUID signatureId, UUID recruiterId, String signatureIp, String userAgent) {
        ContractSignature signature = contractSignatureRepository.findById(signatureId)
            .orElseThrow(() -> new IllegalArgumentException("Signature non trouvée: " + signatureId));
        
        signature.setStatus("SIGNED");
        signature.setSignedAt(LocalDateTime.now());
        signature.setSignatureIp(signatureIp);
        signature.setUserAgent(userAgent);
        
        return contractSignatureRepository.save(signature);
    }
    
    /**
     * Obtenir toutes les signatures pour une candidature
     */
    public List<ContractSignature> getSignaturesByApplication(UUID applicationId) {
        return contractSignatureRepository.findByApplication_ApplicationId(applicationId);
    }
    
    /**
     * Obtenir la dernière signature pour une candidature
     */
    public Optional<ContractSignature> getLatestSignatureByApplication(UUID applicationId) {
        return contractSignatureRepository.findFirstByApplication_ApplicationIdOrderBySignedAtDesc(applicationId);
    }
    
    /**
     * Nettoyer les signatures expirées
     */
    public void cleanupExpiredSignatures() {
        List<ContractSignature> expiredSignatures = contractSignatureRepository.findExpiredSignatures(LocalDateTime.now());
        for (ContractSignature signature : expiredSignatures) {
            signature.setStatus("EXPIRED");
            contractSignatureRepository.save(signature);
        }
    }
    
    /**
     * Vérifier si une candidature a une signature valide
     */
    public boolean hasValidSignature(UUID applicationId) {
        Optional<ContractSignature> latest = getLatestSignatureByApplication(applicationId);
        return latest.isPresent() && 
               "SIGNED".equals(latest.get().getStatus()) &&
               latest.get().getExpiresAt().isAfter(LocalDateTime.now());
    }
    
    /**
     * Compter les signatures par statut pour une candidature
     */
    public long countSignaturesByApplicationAndStatus(UUID applicationId, String status) {
        return contractSignatureRepository.countByApplicationIdAndStatus(applicationId, status);
    }
}
