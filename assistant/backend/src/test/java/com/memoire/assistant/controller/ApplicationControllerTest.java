package com.memoire.assistant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.memoire.assistant.model.Application;
import com.memoire.assistant.service.ApplicationService;
import com.memoire.assistant.dto.ApplicationCreateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private ApplicationService applicationService;
    @MockBean
    private com.memoire.assistant.security.JwtUtil jwtUtil;
    @MockBean
    private com.memoire.assistant.security.CustomUserDetailsService customUserDetailsService;

    @Test
    void getAllApplications_shouldReturnList() throws Exception {
        when(applicationService.getAllApplications()).thenReturn(List.of(new Application()));
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk());
    }

    @Test
    void getApplicationById_shouldReturnApplication() throws Exception {
        UUID id = UUID.randomUUID();
        Application application = new Application();
        application.setApplicationId(id);
        when(applicationService.getApplicationById(id)).thenReturn(Optional.of(application));
        mockMvc.perform(get("/api/applications/" + id))
                .andExpect(status().isOk());
    }

    @Test
    void createApplication_shouldReturnCreated() throws Exception {
        ApplicationCreateRequest req = new ApplicationCreateRequest();
        req.setCandidateId(UUID.randomUUID());
        req.setJobId(UUID.randomUUID());
        req.setStatusId(UUID.randomUUID());
        Application application = new Application();
        when(applicationService.saveApplication(any())).thenReturn(application);
        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}