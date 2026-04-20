package com.memoire.assistant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.memoire.assistant.model.ApplicationStatus;
import com.memoire.assistant.service.ApplicationStatusService;
import com.memoire.assistant.dto.ApplicationStatusCreateRequest;
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

@WebMvcTest(ApplicationStatusController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class ApplicationStatusControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private ApplicationStatusService applicationStatusService;
    @MockBean
    private com.memoire.assistant.security.JwtUtil jwtUtil;
    @MockBean
    private com.memoire.assistant.security.CustomUserDetailsService customUserDetailsService;

    @Test
    void getAllStatuses_shouldReturnList() throws Exception {
        when(applicationStatusService.getAllStatuses()).thenReturn(List.of(new ApplicationStatus()));
        mockMvc.perform(get("/api/application-statuses"))
                .andExpect(status().isOk());
    }

    @Test
    void getStatusById_shouldReturnStatus() throws Exception {
        UUID id = UUID.randomUUID();
        ApplicationStatus status = new ApplicationStatus();
        status.setStatusId(id);
        when(applicationStatusService.getStatusById(id)).thenReturn(Optional.of(status));
        mockMvc.perform(get("/api/application-statuses/" + id))
                .andExpect(status().isOk());
    }

    @Test
    void createStatus_shouldReturnCreated() throws Exception {
        ApplicationStatusCreateRequest req = new ApplicationStatusCreateRequest();
        req.setCode("C1");
        req.setLabel("label");
        ApplicationStatus status = new ApplicationStatus();
        status.setCode("C1");
        status.setLabel("label");
        when(applicationStatusService.saveStatus(any())).thenReturn(status);
        mockMvc.perform(post("/api/application-statuses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}