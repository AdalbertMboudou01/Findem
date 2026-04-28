package com.memoire.assistant.controller;

import com.memoire.assistant.model.Application;
import com.memoire.assistant.model.ApplicationActivity.EventType;
import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.service.ApplicationService;
import com.memoire.assistant.service.ApplicationActivityService;
import com.memoire.assistant.service.TeamViewService;
import com.memoire.assistant.dto.ApplicationCreateRequest;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.model.ApplicationStatus;
import com.memoire.assistant.repository.CandidateRepository;
import com.memoire.assistant.repository.JobRepository;
import com.memoire.assistant.security.TenantContext;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationActivityService activityService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private TeamViewService teamViewService;

    @GetMapping
    public ResponseEntity<?> getApplications(
            @RequestParam(required = false) String view,
            @RequestParam(required = false) UUID offerId) {
        if (view == null) {
            return ResponseEntity.ok(applicationService.getAllApplicationsForCurrentCompany());
        }
        return ResponseEntity.ok(teamViewService.getView(view, offerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable UUID id) {
        Optional<Application> application = applicationService.getApplicationByIdForCurrentCompany(id);
        return application.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Application createApplication(@Valid @RequestBody ApplicationCreateRequest request) {
        UUID companyId = requireCompanyId();

        Job persistedJob = jobRepository.findByJobIdAndCompany_CompanyId(request.getJobId(), companyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Offre introuvable pour votre entreprise"));

        Candidate persistedCandidate = candidateRepository.findByCandidateIdAndCompanyId(request.getCandidateId(), companyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidat introuvable pour votre entreprise"));

        Application application = new Application();
        application.setCandidate(persistedCandidate);
        application.setJob(persistedJob);
        ApplicationStatus status = new ApplicationStatus();
        status.setStatusId(request.getStatusId());
        application.setStatus(status);
        Application savedApplication = applicationService.saveApplication(application);

        activityService.logEvent(savedApplication.getApplicationId(), EventType.STATUS_CHANGED,
                Map.of("to", status.getStatusId() != null ? status.getStatusId().toString() : "initial",
                       "label", "Candidature créée"));

        return savedApplication;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable UUID id, @RequestBody Application application) {
        Optional<Application> existing = applicationService.getApplicationByIdForCurrentCompany(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String previousStatusLabel = existing.get().getStatus() != null ? existing.get().getStatus().getLabel() : null;
        application.setApplicationId(id);
        application.setCandidate(existing.get().getCandidate());
        application.setJob(existing.get().getJob());
        application.setCreatedAt(existing.get().getCreatedAt());
        Application updatedApplication = applicationService.saveApplication(application);
        String nextStatusLabel = updatedApplication.getStatus() != null ? updatedApplication.getStatus().getLabel() : null;

        if (previousStatusLabel != null && !previousStatusLabel.equals(nextStatusLabel)) {
            activityService.logEvent(id, EventType.STATUS_CHANGED,
                    Map.of("from", previousStatusLabel != null ? previousStatusLabel : "",
                           "to", nextStatusLabel != null ? nextStatusLabel : ""));
        }

        return ResponseEntity.ok(updatedApplication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable UUID id) {
        Optional<Application> existing = applicationService.getApplicationByIdForCurrentCompany(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    private UUID requireCompanyId() {
        UUID companyId = TenantContext.getCompanyId();
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contexte entreprise manquant");
        }
        return companyId;
    }
}
