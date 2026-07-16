package pe.edu.unas.ctic.diagti.infraestructura.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * spring-boot-starter-security está en el classpath (lo agregó el equipo
 * pensando en RF-01/LDAP), lo que por defecto bloquea todos los endpoints
 * con un login básico autogenerado. Como se decidió explícitamente NO
 * implementar autenticación en esta rama (el login LDAP es responsabilidad
 * de otro módulo), se abre por completo el acceso a la API mientras tanto.
 *
 * IMPORTANTE: cuando el módulo de autenticación institucional (RF-01) esté
 * listo, esta configuración debe reemplazarse por reglas reales de acceso.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
