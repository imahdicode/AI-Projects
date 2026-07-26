package com.mediscript.clinic.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String doctorId = null;
        String role = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                doctorId = jwtUtils.getUserIdFromToken(token);
                role = jwtUtils.getUserRoleFromToken(token);
            }
        }

        // Fallback to identity headers if JWT not present
        if (doctorId == null) {
            doctorId = request.getHeader("X-Doctor-Id");
            role = request.getHeader("X-Doctor-Role");
        }

        if (doctorId != null && !doctorId.isBlank()) {
            String authority = "ROLE_" + (role != null ? role.toUpperCase() : "DOCTOR");
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    doctorId,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority(authority)));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
