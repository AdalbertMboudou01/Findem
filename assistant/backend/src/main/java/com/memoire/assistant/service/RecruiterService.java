package com.memoire.assistant.service;

import com.memoire.assistant.model.Recruiter;
import com.memoire.assistant.repository.RecruiterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecruiterService {
    @Autowired
    private RecruiterRepository recruiterRepository;

    public List<Recruiter> getAllRecruiters() {
        return recruiterRepository.findAll();
    }

    public Optional<Recruiter> getRecruiterById(UUID id) {
        return recruiterRepository.findById(id);
    }

    public Recruiter saveRecruiter(Recruiter recruiter) {
        return recruiterRepository.save(recruiter);
    }

    public void deleteRecruiter(UUID id) {
        recruiterRepository.deleteById(id);
    }
}
