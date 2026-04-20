package com.memoire.assistant.repository;

import com.memoire.assistant.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ApplicationStatusRepository extends JpaRepository<ApplicationStatus, UUID> {
}
