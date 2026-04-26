package com.memoire.assistant.repository;

import com.memoire.assistant.model.CompanyInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyInvitationRepository extends JpaRepository<CompanyInvitation, UUID> {
    Optional<CompanyInvitation> findByTokenHashAndStatus(String tokenHash, String status);
    List<CompanyInvitation> findByCompany_CompanyIdOrderByCreatedAtDesc(UUID companyId);
    Optional<CompanyInvitation> findByCompany_CompanyIdAndEmailIgnoreCaseAndStatus(UUID companyId, String email, String status);
}
