package com.memoire.assistant.controller;

import com.memoire.assistant.model.Application;
import com.memoire.assistant.service.ApplicationService;
import com.memoire.assistant.dto.ApplicationCreateRequest;
import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.model.ApplicationStatus;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public List<Application> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable UUID id) {
        Optional<Application> application = applicationService.getApplicationById(id);
        return application.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Application createApplication(@Valid @RequestBody ApplicationCreateRequest request) {
        Application application = new Application();
        Candidate candidate = new Candidate();
        candidate.setCandidateId(request.getCandidateId());
        application.setCandidate(candidate);
        Job job = new Job();
        job.setJobId(request.getJobId());
        application.setJob(job);
        ApplicationStatus status = new ApplicationStatus();
        status.setStatusId(request.getStatusId());
        application.setStatus(status);
        return applicationService.saveApplication(application);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable UUID id, @RequestBody Application application) {
        if (!applicationService.getApplicationById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        application.setApplicationId(id);
        return ResponseEntity.ok(applicationService.saveApplication(application));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable UUID id) {
        if (!applicationService.getApplicationById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
