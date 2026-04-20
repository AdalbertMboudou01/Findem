package com.memoire.assistant.repository;

import com.memoire.assistant.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
	java.util.List<Application> findByCandidate_CandidateId(UUID candidateId);
	java.util.List<Application> findByJob_JobId(UUID jobId);
}
