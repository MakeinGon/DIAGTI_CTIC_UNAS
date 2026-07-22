package pe.edu.unas.ctic.diagti;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
    "pe.edu.unas.ctic.diagti",
    "pe.edu.unas.ctic.diagti.config",
    "pe.edu.unas.ctic.diagti.common",
    "pe.edu.unas.ctic.diagti.infraestructura",
    "pe.edu.unas.ctic.diagti.desarrollador",
    "pe.edu.unas.ctic.diagti.sistemas",
    "pe.edu.unas.ctic.diagti.Login",
    "pe.edu.unas.ctic.diagti.security",
    "pe.edu.unas.ctic.diagti.validacion",
    "pe.edu.unas.ctic.diagti.observaciones",  // ← AGREGAR ESTE
    "pe.edu.unas.ctic.diagti.administrador",
    "pe.edu.unas.ctic.diagti.auditor",
    "pe.edu.unas.ctic.diagti.director",
    "pe.edu.unas.ctic.diagti.validador"
})
@EnableJpaRepositories(basePackages = {
    "pe.edu.unas.ctic.diagti.infraestructura.repository",
    "pe.edu.unas.ctic.diagti.desarrollador.repository",
    "pe.edu.unas.ctic.diagti.sistemas",
    "pe.edu.unas.ctic.diagti.validacion",
    "pe.edu.unas.ctic.diagti.Login.repository",
    "pe.edu.unas.ctic.diagti.administrador.repository",
    "pe.edu.unas.ctic.diagti.auditor.repository",
    "pe.edu.unas.ctic.diagti.director.repository",
    "pe.edu.unas.ctic.diagti.observaciones",  // ← AGREGAR ESTE
    "pe.edu.unas.ctic.diagti.validador.repository"
})
public class DiagtiApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiagtiApiApplication.class, args);
    }
}