
package com.memoire.assistant.service;

import com.memoire.assistant.model.Candidate;
import com.memoire.assistant.repository.CandidateRepository;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.repository.ApplicationRepository;
import com.memoire.assistant.dto.CandidateSummaryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Objects;

@Service
public class CandidateService {
    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Optional<Candidate> getCandidateById(UUID id) {
        return candidateRepository.findById(id);
    }

    public Candidate saveCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    public void deleteCandidate(UUID id) {
        candidateRepository.deleteById(id);
    }

    public List<Candidate> getPoolCandidates() {
        return candidateRepository.findByInPoolTrue();
    }

    public Optional<CandidateSummaryDTO> getCandidateSummary(UUID id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) return Optional.empty();
        Candidate candidate = candidateOpt.get();
        List<Application> applications = applicationRepository.findByCandidate_CandidateId(id);
        return Optional.of(createCandidateSummary(candidate, applications));
    }

    private CandidateSummaryDTO createCandidateSummary(Candidate candidate, List<Application> applications) {
        CandidateSummaryDTO dto = new CandidateSummaryDTO();
        dto.setCandidateId(candidate.getCandidateId());
        dto.setFirstName(candidate.getFirstName());
        dto.setLastName(candidate.getLastName());
        dto.setEmail(candidate.getEmail());
        dto.setInPool(candidate.getInPool());
        dto.setApplicationsCount(applications.size());
        String lastStatus = applications.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(a -> a.getStatus() != null ? a.getStatus().getLabel() : null)
                .filter(Objects::nonNull)
                .findFirst().orElse(null);
        dto.setLastStatus(lastStatus);
        return dto;
    }
}
