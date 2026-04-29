package com.memoire.assistant.controller;

import com.memoire.assistant.model.InternalChat;
import com.memoire.assistant.security.TenantContext;
import com.memoire.assistant.service.InternalChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/team-chat")
public class InternalChatController {

    @Autowired private InternalChatService internalChatService;

    @GetMapping("/general")
    public ResponseEntity<List<Map<String, Object>>> getGeneralMessages() {
        UUID companyId = TenantContext.getCompanyId();
        if (companyId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(internalChatService.getGeneralMessages(companyId).stream()
            .map(this::toDto).toList());
    }

    @PostMapping("/general")
    public ResponseEntity<Map<String, Object>> sendGeneralMessage(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        if (message == null || message.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(toDto(internalChatService.sendGeneralMessage(message)));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentMessages(@PathVariable UUID departmentId) {
        return ResponseEntity.ok(internalChatService.getDepartmentMessages(departmentId).stream()
            .map(this::toDto).toList());
    }

    @PostMapping("/department/{departmentId}")
    public ResponseEntity<Map<String, Object>> sendDepartmentMessage(
            @PathVariable UUID departmentId,
            @RequestBody Map<String, String> body) {
        String message = body.get("message");
        if (message == null || message.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(toDto(internalChatService.sendDepartmentMessage(departmentId, message)));
    }

    private Map<String, Object> toDto(InternalChat c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("chatId", c.getChatId());
        m.put("message", c.getMessage());
        m.put("channelType", c.getChannelType());
        m.put("departmentId", c.getDepartmentId());
        m.put("createdAt", c.getCreatedAt());
        if (c.getSender() != null) {
            Map<String, Object> sender = new LinkedHashMap<>();
            sender.put("recruiterId", c.getSender().getRecruiterId());
            sender.put("name", c.getSender().getName());
            sender.put("email", c.getSender().getEmail());
            m.put("sender", sender);
        }
        return m;
    }
}
