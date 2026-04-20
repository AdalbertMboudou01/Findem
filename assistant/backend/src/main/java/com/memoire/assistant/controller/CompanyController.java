package com.memoire.assistant.controller;

import com.memoire.assistant.model.Company;
import com.memoire.assistant.service.CompanyService;
import com.memoire.assistant.dto.CompanyCreateRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    @Autowired
    private CompanyService companyService;

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable UUID id) {
        Optional<Company> company = companyService.getCompanyById(id);
        return company.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Company createCompany(@Valid @RequestBody CompanyCreateRequest request) {
        Company company = new Company();
        company.setName(request.getName());
        company.setSector(request.getSector());
        company.setSize(request.getSize());
        company.setWebsite(request.getWebsite());
        company.setPlan(request.getPlan());
        company.setConfig(request.getConfig());
        return companyService.saveCompany(company);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable UUID id, @RequestBody Company company) {
        if (!companyService.getCompanyById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        company.setCompanyId(id);
        return ResponseEntity.ok(companyService.saveCompany(company));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable UUID id) {
        if (!companyService.getCompanyById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
