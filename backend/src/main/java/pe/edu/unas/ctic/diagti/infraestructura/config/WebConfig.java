package pe.edu.unas.ctic.diagti.infraestructura.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * El frontend (frontend/pages/infraestructura) es HTML/JS estático servido
 * fuera de este backend (sin build tool), así que se habilita CORS de forma
 * abierta para /api/** mientras no exista un mecanismo de autenticación
 * (RF-01/LDAP pertenece a otra rama del proyecto). Se expone como bean
 * CorsConfigurationSource para que tanto Spring MVC como Spring Security
 * (spring-boot-starter-security, ya presente en el proyecto) lo respeten.
 */
@Configuration
public class WebConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
