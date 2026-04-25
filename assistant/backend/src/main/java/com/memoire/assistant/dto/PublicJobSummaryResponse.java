package com.memoire.assistant.dto;

import java.util.UUID;

public class PublicJobSummaryResponse {
    private UUID jobId;
    private String title;

    public PublicJobSummaryResponse(UUID jobId, String title) {
        this.jobId = jobId;
        this.title = title;
    }

    public UUID getJobId() {
        return jobId;
    }

    public String getTitle() {
        return title;
    }
}
