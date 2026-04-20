package com.memoire.assistant.repository;

import com.memoire.assistant.model.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RecruiterRepository extends JpaRepository<Recruiter, UUID> {
}
