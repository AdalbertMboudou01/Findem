package com.memoire.assistant.service;

import com.memoire.assistant.dto.AcceptInvitationRequest;
import com.memoire.assistant.dto.AuthResponse;
import com.memoire.assistant.dto.InvitationResponse;
import com.memoire.assistant.dto.InviteRecruiterRequest;
import com.memoire.assistant.model.CompanyInvitation;
import com.memoire.assistant.model.Recruiter;
import com.memoire.assistant.model.User;
import com.memoire.assistant.repository.CompanyInvitationRepository;
import com.memoire.assistant.repository.RecruiterRepository;
import com.memoire.assistant.repository.UserRepository;
import com.memoire.assistant.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class CompanyInvitationService {
    private final CompanyInvitationRepository invitationRepository;
    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public CompanyInvitationService(
        CompanyInvitationRepository invitationRepository,
        RecruiterRepository recruiterRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtUtil jwtUtil
    ) {
        this.invitationRepository = invitationRepository;
        this.recruiterRepository = recruiterRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public InvitationResponse inviteRecruiter(UUID companyId, UUID inviterRecruiterId, String inviterRole, InviteRecruiterRequest request) {
        if (companyId == null || inviterRecruiterId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contexte entreprise introuvable");
        }
        if (!"ADMIN".equalsIgnoreCase(inviterRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul un admin peut inviter des recruteurs");
        }

        Recruiter inviter = recruiterRepository.findByRecruiterIdAndCompany_CompanyId(inviterRecruiterId, companyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Inviteur invalide"));

        String targetEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(targetEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un utilisateur avec cet email existe deja");
        }

        String role = normalizeRole(request.getRole());
        String rawToken = UUID.randomUUID().toString() + "." + UUID.randomUUID();
        String tokenHash = sha256(rawToken);

        CompanyInvitation invitation = new CompanyInvitation();
        invitation.setCompany(inviter.getCompany());
        invitation.setInvitedByRecruiter(inviter);
        invitation.setEmail(targetEmail);
        invitation.setRole(role);
        invitation.setStatus("PENDING");
        invitation.setTokenHash(tokenHash);
        invitation.setCreatedAt(new Date());
        invitation.setExpiresAt(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000));
        invitation = invitationRepository.save(invitation);

        InvitationResponse response = toResponse(invitation);
        response.setInvitationToken(rawToken);
        return response;
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> listInvitations(UUID companyId, String requesterRole) {
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contexte entreprise introuvable");
        }
        if (!"ADMIN".equalsIgnoreCase(requesterRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul un admin peut lister les invitations");
        }
        return invitationRepository.findByCompany_CompanyIdOrderByCreatedAtDesc(companyId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public AuthResponse acceptInvitation(AcceptInvitationRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les mots de passe ne correspondent pas");
        }

        String tokenHash = sha256(request.getToken());
        CompanyInvitation invitation = invitationRepository.findByTokenHashAndStatus(tokenHash, "PENDING")
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation invalide"));

        if (invitation.getExpiresAt() == null || invitation.getExpiresAt().before(new Date())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation expiree");
        }

        if (userRepository.findByEmail(invitation.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un compte existe deja pour cet email");
        }

        User user = new User();
        user.setEmail(invitation.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(invitation.getRole());
        user = userRepository.save(user);

        Recruiter recruiter = new Recruiter();
        recruiter.setCompany(invitation.getCompany());
        recruiter.setEmail(invitation.getEmail());
        recruiter.setName(request.getFullName());
        recruiter.setRole(invitation.getRole());
        recruiter.setStatus("active");
        recruiter.setAuthUserId(user.getId());
        recruiter = recruiterRepository.save(recruiter);

        invitation.setStatus("ACCEPTED");
        invitation.setAcceptedAt(new Date());
        invitationRepository.save(invitation);

        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole(),
            user.getId(),
            recruiter.getRecruiterId(),
            invitation.getCompany().getCompanyId()
        );

        return new AuthResponse(
            token,
            user.getRole(),
            user.getId(),
            recruiter.getRecruiterId(),
            invitation.getCompany().getCompanyId(),
            true
        );
    }

    private InvitationResponse toResponse(CompanyInvitation invitation) {
        InvitationResponse response = new InvitationResponse();
        response.setInvitationId(invitation.getInvitationId());
        response.setCompanyId(invitation.getCompany().getCompanyId());
        response.setEmail(invitation.getEmail());
        response.setRole(invitation.getRole());
        response.setStatus(invitation.getStatus());
        response.setCreatedAt(invitation.getCreatedAt());
        response.setExpiresAt(invitation.getExpiresAt());
        return response;
    }

    private String normalizeRole(String role) {
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role manquant");
        }
        String normalized = role.trim().toUpperCase();
        if (!"RECRUITER".equals(normalized) && !"ADMIN".equals(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role invalide. Roles autorises: RECRUITER, ADMIN");
        }
        return normalized;
    }

    private String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e);
        }
    }
}
