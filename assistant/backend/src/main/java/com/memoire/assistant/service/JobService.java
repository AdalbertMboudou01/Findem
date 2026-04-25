package com.memoire.assistant.service;

import com.memoire.assistant.model.Job;
import com.memoire.assistant.model.Company;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.dto.JobCreateRequest;
import com.memoire.assistant.dto.JobStatsDTO;
import com.memoire.assistant.repository.JobRepository;
import com.memoire.assistant.repository.CompanyRepository;
import com.memoire.assistant.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.regex.Pattern;

@Service
@Transactional
public class JobService {
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    public List<Job> getActiveJobs() {
        return jobRepository.findAll().stream()
            .collect(Collectors.toList()); // Simplifié temporairement
    }

    public Optional<Job> getJobById(UUID id) {
        return jobRepository.findById(id);
    }
    
    public Optional<Job> getJobWithStats(UUID id) {
        Optional<Job> job = jobRepository.findById(id);
        if (job.isPresent()) {
            enrichJobWithStats(job.get());
        }
        return job;
    }
    
    public Optional<Job> getJobBySlug(String slug) {
        return jobRepository.findBySlug(slug);
    }

    public Job saveJob(Job job) {
        validateJob(job);
        if (job.getJobId() == null) {
            job.setCreatedAt(new Date());
            if (job.getSlug() == null || job.getSlug().trim().isEmpty()) {
                job.setSlug(generateUniqueSlug(job.getTitle(), job.getCompany().getCompanyId()));
            }
        }
        return jobRepository.save(job);
    }
    
    public Job createJobFromRequest(JobCreateRequest request, UUID companyId) {
        Optional<Company> company = companyRepository.findById(companyId);
        if (!company.isPresent()) {
            throw new IllegalArgumentException("Entreprise non trouvée");
        }
        
        Job job = new Job();
        job.setCompany(company.get());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setAlternanceRhythm(request.getAlternanceRhythm());
        job.setBlockingCriteria(request.getBlockingCriteria());
        // job.setTechnologies(request.getTechnologies()); // Temporairement désactivé
        job.setSlug(generateUniqueSlug(request.getTitle(), companyId));
        
        return saveJob(job);
    }

    public void deleteJob(UUID id) {
        // Vérifier s'il y a des candidatures associées
        List<Application> applications = applicationRepository.findByJob_JobId(id);
        
        if (!applications.isEmpty()) {
            throw new IllegalStateException("Impossible de supprimer l'offre : des candidatures sont associées");
        }
        
        jobRepository.deleteById(id);
    }
    
    public List<Application> getJobApplications(UUID jobId) {
        return applicationRepository.findByJob_JobId(jobId);
    }
    
    public JobStatsDTO getJobStatistics(UUID jobId) {
        Optional<Job> job = jobRepository.findById(jobId);
        if (!job.isPresent()) {
            throw new IllegalArgumentException("Offre non trouvée");
        }
        
        List<Application> applications = applicationRepository.findByJob_JobId(jobId);
        
        JobStatsDTO stats = new JobStatsDTO();
        stats.setJobId(jobId);
        stats.setJobTitle(job.get().getTitle());
        stats.setCompanyName(job.get().getCompany().getName());
        stats.setTotalApplications(applications.size());
        stats.setNewApplications(applications.stream()
                .filter(app -> app.getCreatedAt() != null && 
                    app.getCreatedAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime().isAfter(LocalDateTime.now().minusDays(7)))
            .count());
        stats.setCreatedAt(job.get().getCreatedAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        
        // Statuts des candidatures
        stats.setPendingApplications(applications.stream()
            .filter(app -> app.getStatus() != null && "PENDING".equals(app.getStatus().getCode()))
            .count());
        stats.setReviewedApplications(applications.stream()
            .filter(app -> app.getStatus() != null && "REVIEWED".equals(app.getStatus().getCode()))
            .count());
        stats.setInterviewApplications(applications.stream()
            .filter(app -> app.getStatus() != null && "INTERVIEW".equals(app.getStatus().getCode()))
            .count());
        
        return stats;
    }
    
    public List<Job> searchJobs(String keyword, UUID companyId, String location, List<String> technologies) {
        return jobRepository.findAll().stream()
            .filter(job -> keyword == null || 
                job.getTitle().toLowerCase().contains(keyword.toLowerCase()) ||
                (job.getDescription() != null && job.getDescription().toLowerCase().contains(keyword.toLowerCase())))
            .filter(job -> companyId == null || 
                (job.getCompany() != null && companyId.equals(job.getCompany().getCompanyId())))
            .filter(job -> location == null || 
                (job.getLocation() != null && job.getLocation().toLowerCase().contains(location.toLowerCase())))
            .filter(job -> technologies == null || technologies.isEmpty() ||
                (job.getTechnologies() != null && job.getTechnologies().stream()
                    .anyMatch(tech -> technologies.stream()
                        .anyMatch(searchTech -> tech.toLowerCase().contains(searchTech.toLowerCase())))))
            .collect(Collectors.toList());
    }
    
    public String generateChatbotUrl(UUID jobId) {
        Optional<Job> job = jobRepository.findById(jobId);
        if (!job.isPresent()) {
            throw new IllegalArgumentException("Offre non trouvée");
        }
        
        return "/chatbot/" + job.get().getSlug();
    }
    
    private void validateJob(Job job) {
        if (job.getTitle() == null || job.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre du poste est obligatoire");
        }
        
        if (job.getTitle().length() > 200) {
            throw new IllegalArgumentException("Le titre du poste ne peut pas dépasser 200 caractères");
        }
        
        if (job.getCompany() == null) {
            throw new IllegalArgumentException("L'entreprise est obligatoire");
        }
        
        if (job.getSlug() != null && !isValidSlug(job.getSlug())) {
            throw new IllegalArgumentException("Le slug n'est pas valide");
        }
        
        // Valider la duree du contrat d'alternance
        if (job.getAlternanceRhythm() != null) {
            List<String> validDurations = List.of("6 mois", "12 mois", "24 mois", "36 mois");
            String normalized = job.getAlternanceRhythm().trim().toLowerCase();
            if (!validDurations.contains(normalized)) {
                throw new IllegalArgumentException("La duree du contrat doit etre: 6 mois, 12 mois, 24 mois ou 36 mois");
            }
        }
    }
    
    private String generateUniqueSlug(String title, UUID companyId) {
        String baseSlug = title.toLowerCase()
            .replaceAll("[^a-z0-9\s]", "")
            .replaceAll("\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        
        String slug = baseSlug;
        int counter = 1;
        
        while (jobRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        
        return slug;
    }
    
    private boolean isValidSlug(String slug) {
        Pattern pattern = Pattern.compile("^[a-z0-9-]+$");
        return pattern.matcher(slug).matches() && slug.length() >= 3 && slug.length() <= 100;
    }
    
    private void enrichJobWithStats(Job job) {
        // Enrichir l'objet Job avec des statistiques si nécessaire
        // Cette méthode peut être étendue pour ajouter des données calculées
    }
}
