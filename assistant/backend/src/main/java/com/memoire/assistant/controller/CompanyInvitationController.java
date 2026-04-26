package com.memoire.assistant.controller;

import com.memoire.assistant.dto.AcceptInvitationRequest;
import com.memoire.assistant.dto.AuthResponse;
import com.memoire.assistant.dto.InvitationResponse;
import com.memoire.assistant.dto.InviteRecruiterRequest;
import com.memoire.assistant.security.TenantContext;
import com.memoire.assistant.service.CompanyInvitationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/company-members")
public class CompanyInvitationController {
    private final CompanyInvitationService companyInvitationService;

    public CompanyInvitationController(CompanyInvitationService companyInvitationService) {
        this.companyInvitationService = companyInvitationService;
    }

    @PostMapping("/invitations")
    public ResponseEntity<InvitationResponse> inviteRecruiter(@Valid @RequestBody InviteRecruiterRequest request) {
        UUID companyId = TenantContext.getCompanyId();
        UUID recruiterId = TenantContext.getRecruiterId();
        String role = TenantContext.getRole();

        if (companyId == null || recruiterId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contexte entreprise introuvable");
        }

        InvitationResponse response = companyInvitationService.inviteRecruiter(companyId, recruiterId, role, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/invitations")
    public ResponseEntity<List<InvitationResponse>> listInvitations() {
        UUID companyId = TenantContext.getCompanyId();
        String role = TenantContext.getRole();
        return ResponseEntity.ok(companyInvitationService.listInvitations(companyId, role));
    }

    @PostMapping("/accept-invitation")
    public AuthResponse acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        return companyInvitationService.acceptInvitation(request);
    }
}
