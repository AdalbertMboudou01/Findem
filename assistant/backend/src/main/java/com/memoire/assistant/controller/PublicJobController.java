package com.memoire.assistant.controller;

import com.memoire.assistant.dto.PublicJobSummaryResponse;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class PublicJobController {

    @Autowired
    private JobRepository jobRepository;

    @GetMapping("/{jobId}/public")
    public ResponseEntity<PublicJobSummaryResponse> getPublicJobSummary(@PathVariable UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        return ResponseEntity.ok(new PublicJobSummaryResponse(job.getJobId(), job.getTitle()));
    }
}
