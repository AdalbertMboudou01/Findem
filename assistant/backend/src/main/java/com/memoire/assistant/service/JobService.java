package com.memoire.assistant.service;

import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class JobService {
    @Autowired
    private JobRepository jobRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(UUID id) {
        return jobRepository.findById(id);
    }

    public Job saveJob(Job job) {
        return jobRepository.save(job);
    }

    public void deleteJob(UUID id) {
        jobRepository.deleteById(id);
    }
}
