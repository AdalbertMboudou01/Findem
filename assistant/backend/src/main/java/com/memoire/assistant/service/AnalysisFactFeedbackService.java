package com.memoire.assistant.service;

import com.memoire.assistant.dto.AnalysisFactFeedbackRequest;
import com.memoire.assistant.dto.AnalysisFactFeedbackResponse;
import com.memoire.assistant.model.AnalysisFactFeedback;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.repository.AnalysisFactFeedbackRepository;
import com.memoire.assistant.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalysisFactFeedbackService {

    @Autowired
    private AnalysisFactFeedbackRepository feedbackRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public AnalysisFactFeedbackResponse saveFeedback(UUID applicationId, AnalysisFactFeedbackRequest request) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));

        String decision = normalizeDecision(request.getDecision());
        if ("CORRECTED".equals(decision)) {
            String correctedFinding = safe(request.getCorrectedFinding());
            if (correctedFinding.isBlank()) {
                throw new RuntimeException("correctedFinding est obligatoire quand decision=CORRECTED");
            }
        }

        AnalysisFactFeedback feedback = new AnalysisFactFeedback();
        feedback.setApplication(application);
        feedback.setDimension(safeOrDefault(request.getDimension(), "general"));
        feedback.setFinding(safe(request.getFinding()));
        feedback.setEvidence(safe(request.getEvidence()));
        feedback.setDecision(decision);
        feedback.setCorrectedFinding(safe(request.getCorrectedFinding()));
        feedback.setReviewerComment(safe(request.getReviewerComment()));

        if (feedback.getFinding().isBlank()) {
            throw new RuntimeException("finding est obligatoire");
        }

        AnalysisFactFeedback saved = feedbackRepository.save(feedback);
        return toResponse(saved);
    }

    public List<AnalysisFactFeedbackResponse> getFeedbackByApplication(UUID applicationId) {
        return feedbackRepository.findByApplication_ApplicationIdOrderByCreatedAtDesc(applicationId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private AnalysisFactFeedbackResponse toResponse(AnalysisFactFeedback feedback) {
        AnalysisFactFeedbackResponse response = new AnalysisFactFeedbackResponse();
        response.setFeedbackId(feedback.getFeedbackId().toString());
        response.setApplicationId(feedback.getApplication().getApplicationId().toString());
        response.setDimension(feedback.getDimension());
        response.setFinding(feedback.getFinding());
        response.setEvidence(feedback.getEvidence());
        response.setDecision(feedback.getDecision());
        response.setCorrectedFinding(feedback.getCorrectedFinding());
        response.setReviewerComment(feedback.getReviewerComment());
        response.setCreatedAt(feedback.getCreatedAt());
        return response;
    }

    private String normalizeDecision(String value) {
        String normalized = safe(value).toUpperCase(Locale.ROOT);
        if (!normalized.equals("CONFIRMED") && !normalized.equals("CORRECTED") && !normalized.equals("REJECTED")) {
            throw new RuntimeException("decision doit valoir CONFIRMED, CORRECTED ou REJECTED");
        }
        return normalized;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeOrDefault(String value, String fallback) {
        String normalized = safe(value);
        return normalized.isBlank() ? fallback : normalized;
    }
}
