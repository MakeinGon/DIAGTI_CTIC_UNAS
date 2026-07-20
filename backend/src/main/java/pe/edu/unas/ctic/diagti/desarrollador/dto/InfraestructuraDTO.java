package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfraestructuraDTO {
    private Long id;
    private String plataforma;
    private String tipoServidor;
    private String sistemaOperativo;
    private String versionSO;
    private String ip;
    private Integer puerto;
    private String dominio;
    private String subdominio;
    private String ambiente;
    private Boolean usoDocker;
    private Boolean dockerCompose;
    private Boolean proxmox;
    private String proxyReverso;
    private String servidorWeb;
    private String ciCd;
    private String mecanismoPublicacion;
    private String exposicion;
    private String ipPublica;
    private String ipPrivada;
    private String subdominioInstitucional;
    private String observaciones;
}