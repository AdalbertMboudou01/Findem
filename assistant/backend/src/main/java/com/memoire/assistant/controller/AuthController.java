package com.memoire.assistant.controller;

import com.memoire.assistant.dto.AuthRequest;
import com.memoire.assistant.dto.AuthResponse;
import com.memoire.assistant.dto.RegisterRequest;
import com.memoire.assistant.dto.RegisterCompanyOwnerRequest;
import com.memoire.assistant.model.Recruiter;
import com.memoire.assistant.model.User;
import com.memoire.assistant.repository.RecruiterRepository;
import com.memoire.assistant.repository.UserRepository;
import com.memoire.assistant.security.JwtUtil;
import com.memoire.assistant.service.AuthOnboardingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RecruiterRepository recruiterRepository;
    @Autowired
    private AuthOnboardingService authOnboardingService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }
        return userRepository.findByEmail(request.getEmail())
            .map(this::buildAuthResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        // Validation des mots de passe
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les mots de passe ne correspondent pas");
        }

        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet email est déjà utilisé");
        }

        // Validation du rôle
        if (!isValidRole(request.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle invalide. Rôles autorisés: RECRUITER, ADMIN, CANDIDATE");
        }

        // Créer le nouvel utilisateur
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(request.getRole());

        // Sauvegarder l'utilisateur
        User savedUser = userRepository.save(newUser);

        return buildAuthResponse(savedUser);
    }

    @PostMapping("/register-company-owner")
    public AuthResponse registerCompanyOwner(@Valid @RequestBody RegisterCompanyOwnerRequest request) {
        return authOnboardingService.registerCompanyOwner(request);
    }

    private boolean isValidRole(String role) {
        return "RECRUITER".equals(role) || "ADMIN".equals(role) || "CANDIDATE".equals(role);
    }

    private AuthResponse buildAuthResponse(User user) {
        Optional<Recruiter> recruiterOpt = recruiterRepository.findByAuthUserId(user.getId());
        Recruiter recruiter = recruiterOpt.orElse(null);

        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole(),
            user.getId(),
            recruiter != null ? recruiter.getRecruiterId() : null,
            recruiter != null && recruiter.getCompany() != null ? recruiter.getCompany().getCompanyId() : null
        );

        return new AuthResponse(
            token,
            user.getRole(),
            user.getId(),
            recruiter != null ? recruiter.getRecruiterId() : null,
            recruiter != null && recruiter.getCompany() != null ? recruiter.getCompany().getCompanyId() : null,
            recruiter != null
        );
    }
}
