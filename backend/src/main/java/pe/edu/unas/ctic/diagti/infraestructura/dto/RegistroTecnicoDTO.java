package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO "plano" cuyos nombres de campo son exactamente los atributos
 * name="..." del formulario en infraestructura.html, para que el frontend
 * pueda enviar/recibir el mismo objeto que hoy arma formData() en JS.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroTecnicoDTO {

    // Paso 1: Infraestructura
    private String plataforma;
    private String tipoServidor;
    private String sistemaOperativo;
    private String versionSO;
    private String ipPrivada;
    private String proxmox;
    private String backup;
    private String frecuenciaBackup;
    private String observacionesInfra;

    // Paso 2: Despliegue
    private String ambiente;
    private String servidor;
    private String puerto;
    private String dominio;
    private String servidorWeb;
    private String proxy;
    private String docker;
    private String compose;
    private String exposicion;
    private String cicd;

    // Paso 3: Seguridad
    private String ssl;
    private String autenticacion;
    private String mfa;
    private String logs;
    private String cifrado;
    private String restriccionIp;
    private String sesiones;

    // Paso 4: Evidencias
    @Builder.Default
    private List<EvidenciaDTO> evidences = new ArrayList<>();

    // Estado / control de flujo (solo lectura desde el backend)
    private String estado;
    private Integer ultimoPaso;
}
