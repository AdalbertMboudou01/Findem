package com.memoire.assistant.security;

import java.util.UUID;

public final class TenantContext {
    private static final ThreadLocal<UUID> userIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<UUID> recruiterIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<UUID> companyIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> roleHolder = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void set(UUID userId, UUID recruiterId, UUID companyId, String role) {
        userIdHolder.set(userId);
        recruiterIdHolder.set(recruiterId);
        companyIdHolder.set(companyId);
        roleHolder.set(role);
    }

    public static UUID getUserId() {
        return userIdHolder.get();
    }

    public static UUID getRecruiterId() {
        return recruiterIdHolder.get();
    }

    public static UUID getCompanyId() {
        return companyIdHolder.get();
    }

    public static String getRole() {
        return roleHolder.get();
    }

    public static boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(roleHolder.get());
    }

    public static void clear() {
        userIdHolder.remove();
        recruiterIdHolder.remove();
        companyIdHolder.remove();
        roleHolder.remove();
    }
}