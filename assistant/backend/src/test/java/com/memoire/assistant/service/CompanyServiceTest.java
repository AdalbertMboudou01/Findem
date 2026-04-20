package com.memoire.assistant.service;

import com.memoire.assistant.model.Company;
import com.memoire.assistant.repository.CompanyRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {
    @Mock
    private CompanyRepository repository;
    @InjectMocks
    private CompanyService service;

    @Test
    void getAllCompanies_returnsList() {
        when(repository.findAll()).thenReturn(List.of(new Company()));
        assertEquals(1, service.getAllCompanies().size());
    }

    @Test
    void getCompanyById_returnsOptional() {
        UUID id = UUID.randomUUID();
        Company company = new Company();
        when(repository.findById(id)).thenReturn(Optional.of(company));
        assertTrue(service.getCompanyById(id).isPresent());
    }

    @Test
    void saveCompany_returnsSaved() {
        Company company = new Company();
        when(repository.save(company)).thenReturn(company);
        assertEquals(company, service.saveCompany(company));
    }

    @Test
    void deleteCompany_callsRepository() {
        UUID id = UUID.randomUUID();
        service.deleteCompany(id);
        verify(repository).deleteById(id);
    }
}
