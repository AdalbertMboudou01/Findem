package com.memoire.assistant.controller;

import com.memoire.assistant.dto.ContractSignatureRequest;
import com.memoire.assistant.model.ContractSignature;
import com.memoire.assistant.security.TenantContext;
import com.memoire.assistant.service.ContractSignatureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/contract-signatures")
@Tag(name = "Contract Signatures", description = "API pour la gestion des signatures de contrat")
public class ContractSignatureController {
    
    @Autowired
    private ContractSignatureService contractSignatureService;
    
    @PostMapping("/prepare")
    @Operation(summary = "Préparer une signature de contrat", description = "Crée une demande de signature pour une candidature")
    public ResponseEntity<ContractSignature> prepareSignature(@Valid @RequestBody ContractSignatureRequest request) {
        try {
            UUID companyId = TenantContext.getCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            ContractSignature signature = contractSignatureService.createSignature(
                request.getApplicationId(),
                request.getCandidateId(),
                TenantContext.getUserId(), // ID du recruteur connecté
                request.getContractUrl(),
                "127.0.0.1", // IP par défaut
                "API", // User agent par défaut
                request.getNotes()
            );
            
            return ResponseEntity.ok(signature);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Erreur lors de la préparation: " + e.getMessage());
        }
    }
    
    @PostMapping("/{signatureId}/sign")
    @Operation(summary = "Signer un contrat", description = "Confirme la signature du contrat")
    public ResponseEntity<ContractSignature> signContract(
            @Parameter(description = "ID de la signature") @PathVariable UUID signatureId,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        try {
            String signatureIp = forwardedFor != null ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
            
            ContractSignature signedContract = contractSignatureService.signContract(
                signatureId,
                TenantContext.getUserId(),
                signatureIp,
                userAgent != null ? userAgent : "API"
            );
            
            return ResponseEntity.ok(signedContract);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Erreur lors de la signature: " + e.getMessage());
        }
    }
    
    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Lister les signatures d'une candidature", description = "Retourne toutes les signatures pour une candidature donnée")
    public ResponseEntity<List<ContractSignature>> getSignaturesByApplication(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            List<ContractSignature> signatures = contractSignatureService.getSignaturesByApplication(applicationId);
            return ResponseEntity.ok(signatures);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la récupération: " + e.getMessage());
        }
    }
    
    @GetMapping("/application/{applicationId}/latest")
    @Operation(summary = "Dernière signature d'une candidature", description = "Retourne la dernière signature pour une candidature")
    public ResponseEntity<ContractSignature> getLatestSignature(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            Optional<ContractSignature> signature = contractSignatureService.getLatestSignatureByApplication(applicationId);
            return signature.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la récupération: " + e.getMessage());
        }
    }
    
    @GetMapping("/application/{applicationId}/has-valid")
    @Operation(summary = "Vérifier si une candidature a une signature valide", description = "Retourne true si une signature valide existe")
    public ResponseEntity<Boolean> hasValidSignature(
            @Parameter(description = "ID de la candidature") @PathVariable UUID applicationId) {
        try {
            boolean hasValid = contractSignatureService.hasValidSignature(applicationId);
            return ResponseEntity.ok(hasValid);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la vérification: " + e.getMessage());
        }
    }
    
    @PostMapping("/cleanup-expired")
    @Operation(summary = "Nettoyer les signatures expirées", description = "Marque les signatures expirées comme EXPIRED")
    public ResponseEntity<String> cleanupExpiredSignatures() {
        try {
            contractSignatureService.cleanupExpiredSignatures();
            return ResponseEntity.ok("Signatures expirées nettoyées avec succès");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors du nettoyage: " + e.getMessage());
        }
    }
}
