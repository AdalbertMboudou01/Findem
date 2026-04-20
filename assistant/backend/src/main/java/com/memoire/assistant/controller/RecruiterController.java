package com.memoire.assistant.controller;

import com.memoire.assistant.model.Recruiter;
import com.memoire.assistant.service.RecruiterService;
import com.memoire.assistant.dto.RecruiterCreateRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruiters")
public class RecruiterController {
    @Autowired
    private RecruiterService recruiterService;

    @GetMapping
    public List<Recruiter> getAllRecruiters() {
        return recruiterService.getAllRecruiters();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recruiter> getRecruiterById(@PathVariable UUID id) {
        Optional<Recruiter> recruiter = recruiterService.getRecruiterById(id);
        return recruiter.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Recruiter createRecruiter(@Valid @RequestBody RecruiterCreateRequest request) {
        // Conversion manuelle du DTO vers l'entité (à adapter selon ta logique)
        Recruiter recruiter = new Recruiter();
        recruiter.setName(request.getName());
        recruiter.setEmail(request.getEmail());
        recruiter.setRole(request.getRole());
        // Ici, il faudrait hasher le mot de passe et gérer l'association User/Recruiter si besoin
        return recruiterService.saveRecruiter(recruiter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recruiter> updateRecruiter(@PathVariable UUID id, @RequestBody Recruiter recruiter) {
        if (!recruiterService.getRecruiterById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        recruiter.setRecruiterId(id);
        return ResponseEntity.ok(recruiterService.saveRecruiter(recruiter));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecruiter(@PathVariable UUID id) {
        if (!recruiterService.getRecruiterById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        recruiterService.deleteRecruiter(id);
        return ResponseEntity.noContent().build();
    }
}
