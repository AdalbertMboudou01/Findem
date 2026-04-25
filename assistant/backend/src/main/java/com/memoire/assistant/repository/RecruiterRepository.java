package com.memoire.assistant.repository;

import com.memoire.assistant.model.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;

public interface RecruiterRepository extends JpaRepository<Recruiter, UUID> {
    java.util.List<Recruiter> findByCompany_CompanyId(UUID companyId);
    Optional<Recruiter> findByAuthUserId(UUID authUserId);
}
