package com.memoire.assistant.controller;

import com.memoire.assistant.dto.AuthRequest;
import com.memoire.assistant.dto.AuthResponse;
import com.memoire.assistant.dto.RegisterRequest;
import com.memoire.assistant.model.User;
import com.memoire.assistant.repository.UserRepository;
import com.memoire.assistant.security.JwtUtil;
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

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getRole());
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

        // Générer le token JWT
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole());

        return new AuthResponse(token, savedUser.getRole());
    }

    private boolean isValidRole(String role) {
        return "RECRUITER".equals(role) || "ADMIN".equals(role) || "CANDIDATE".equals(role);
    }
}
