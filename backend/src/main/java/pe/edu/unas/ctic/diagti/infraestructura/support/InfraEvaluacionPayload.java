package pe.edu.unas.ctic.diagti.infraestructura.support;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Estructura serializada en infraestructura.capacidad_recursos (única columna TEXT del esquema).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InfraEvaluacionPayload {

    private String estadoRegistro;
    private String resultado;
    private String fechaEvaluacion;

    private String plataforma;
    private String tipoServidor;
    private String sistemaOperativo;
    private String versionSO;
    private String ipPrivada;
    private String proxmox;
    private String backup;
    private String frecuenciaBackup;
    private String observacionesInfra;
    private String disponibilidad;
    private String recuperacion;
    private String monitoreo;
    private String capacidad;
    private String responsable;

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

    private String ssl;
    private String autenticacion;
    private String mfa;
    private String logs;
    private String cifrado;
    private String restriccionIp;
    private String sesiones;

    @Builder.Default
    private List<EvidenciaItem> evidences = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvidenciaItem {
        private String tipo;
        private String nombre;
        private String archivo;
        private String url;
        private String descripcion;
    }
}
