package com.memoire.assistant.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {
    private final String jwtSecret = "ChangeThisSecretKeyToAStrongOneForProduction1234567890";
    private final long jwtExpirationMs = 86400000; // 24h

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String username, String role) {
        return generateToken(username, role, null, null, null);
    }

    public String generateToken(String username, String role, UUID userId, UUID recruiterId, UUID companyId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("userId", userId != null ? userId.toString() : null)
                .claim("recruiterId", recruiterId != null ? recruiterId.toString() : null)
                .claim("companyId", companyId != null ? companyId.toString() : null)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public String getRoleFromToken(String token) {
        return (String) getAllClaims(token).get("role");
    }

    public UUID getUserIdFromToken(String token) {
        return parseUuidClaim(token, "userId");
    }

    public UUID getRecruiterIdFromToken(String token) {
        return parseUuidClaim(token, "recruiterId");
    }

    public UUID getCompanyIdFromToken(String token) {
        return parseUuidClaim(token, "companyId");
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody();
    }

    private UUID parseUuidClaim(String token, String claimName) {
        Object raw = getAllClaims(token).get(claimName);
        if (raw == null) {
            return null;
        }
        try {
            return UUID.fromString(String.valueOf(raw));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
