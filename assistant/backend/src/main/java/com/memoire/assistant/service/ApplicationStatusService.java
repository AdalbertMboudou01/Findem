package com.memoire.assistant.service;

import com.memoire.assistant.model.ApplicationStatus;
import com.memoire.assistant.repository.ApplicationStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApplicationStatusService {
    @Autowired
    private ApplicationStatusRepository applicationStatusRepository;

    public List<ApplicationStatus> getAllStatuses() {
        return applicationStatusRepository.findAll();
    }

    public Optional<ApplicationStatus> getStatusById(UUID id) {
        return applicationStatusRepository.findById(id);
    }

    public ApplicationStatus saveStatus(ApplicationStatus status) {
        return applicationStatusRepository.save(status);
    }

    public void deleteStatus(UUID id) {
        applicationStatusRepository.deleteById(id);
    }
}
