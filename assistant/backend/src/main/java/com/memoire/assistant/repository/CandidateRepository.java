package com.memoire.assistant.repository;

import com.memoire.assistant.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
	java.util.List<Candidate> findByInPoolTrue();
}
