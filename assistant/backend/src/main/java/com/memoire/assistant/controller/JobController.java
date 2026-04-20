package com.memoire.assistant.controller;

import com.memoire.assistant.model.Job;
import com.memoire.assistant.service.JobService;
import com.memoire.assistant.dto.JobCreateRequest;
import com.memoire.assistant.model.Company;
import com.memoire.assistant.model.Recruiter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    @Autowired
    private JobService jobService;

    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable UUID id) {
        Optional<Job> job = jobService.getJobById(id);
        return job.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Job createJob(@Valid @RequestBody JobCreateRequest request) {
        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setAlternanceRhythm(request.getAlternanceRhythm());
        job.setBlockingCriteria(request.getBlockingCriteria());
        job.setSlug(request.getSlug());
        // Association avec Company et Recruiter à partir des IDs (à adapter selon ta logique de service)
        Company company = new Company();
        company.setCompanyId(request.getCompanyId());
        job.setCompany(company);
        Recruiter recruiter = new Recruiter();
        recruiter.setRecruiterId(request.getOwnerRecruiterId());
        job.setOwnerRecruiter(recruiter);
        return jobService.saveJob(job);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable UUID id, @RequestBody Job job) {
        if (!jobService.getJobById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        job.setJobId(id);
        return ResponseEntity.ok(jobService.saveJob(job));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable UUID id) {
        if (!jobService.getJobById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
