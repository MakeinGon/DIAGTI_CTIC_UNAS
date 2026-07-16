package pe.edu.unas.ctic.diagti.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())   // deshabilitar CSRF para pruebas (API REST)
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // permitir todo

        return http.build();
    }
}
