package com.memoire.assistant.service;

import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {
    @Mock
    private JobRepository repository;
    @InjectMocks
    private JobService service;

    @Test
    void getAllJobs_returnsList() {
        when(repository.findAll()).thenReturn(List.of(new Job()));
        assertEquals(1, service.getAllJobs().size());
    }

    @Test
    void getJobById_returnsOptional() {
        UUID id = UUID.randomUUID();
        Job job = new Job();
        when(repository.findById(id)).thenReturn(Optional.of(job));
        assertTrue(service.getJobById(id).isPresent());
    }

    @Test
    void saveJob_returnsSaved() {
        Job job = new Job();
        when(repository.save(job)).thenReturn(job);
        assertEquals(job, service.saveJob(job));
    }

    @Test
    void deleteJob_callsRepository() {
        UUID id = UUID.randomUUID();
        service.deleteJob(id);
        verify(repository).deleteById(id);
    }
}
