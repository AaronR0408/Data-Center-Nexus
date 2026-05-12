package com.dcim.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers("/api/healthz").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // Current user identity — all authenticated
                .requestMatchers("/api/auth/me").authenticated()

                // User management — ADMIN only
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // Incident reads — ADMIN and ENGINEER (VIEWER excluded)
                .requestMatchers(HttpMethod.GET, "/api/incidents/**").hasAnyRole("ADMIN", "ENGINEER")
                // Incident writes — ADMIN and ENGINEER
                .requestMatchers(HttpMethod.POST, "/api/incidents/**").hasAnyRole("ADMIN", "ENGINEER")
                .requestMatchers(HttpMethod.PUT, "/api/incidents/**").hasAnyRole("ADMIN", "ENGINEER")
                // Incident delete — ADMIN only
                .requestMatchers(HttpMethod.DELETE, "/api/incidents/**").hasRole("ADMIN")

                // Asset reads — all authenticated roles
                .requestMatchers(HttpMethod.GET, "/api/assets/**").hasAnyRole("ADMIN", "ENGINEER", "VIEWER")
                // Asset writes — ADMIN only
                .requestMatchers(HttpMethod.POST, "/api/assets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/assets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/assets/**").hasRole("ADMIN")

                // Infrastructure reads — all roles
                .requestMatchers(HttpMethod.GET, "/api/sites/**", "/api/rooms/**", "/api/racks/**",
                                 "/api/dashboard/**", "/api/warranty/**").hasAnyRole("ADMIN", "ENGINEER", "VIEWER")
                // Infrastructure writes — ADMIN only
                .requestMatchers(HttpMethod.POST, "/api/sites/**", "/api/rooms/**", "/api/racks/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/sites/**", "/api/rooms/**", "/api/racks/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/sites/**", "/api/rooms/**", "/api/racks/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .httpBasic(basic -> {});

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
