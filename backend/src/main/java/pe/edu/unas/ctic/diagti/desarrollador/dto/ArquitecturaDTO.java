package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArquitecturaDTO {
    private Long id;
    private String lenguajeProgramacion;
    private String versionLenguaje;
    private String framework;
    private String versionFramework;
    private String arquitectura;
    private String patronDiseno;
    private String repositorio;
    private String tecnologiasComplementarias;
    private String motorBaseDatos;
    private String versionBaseDatos;
    private String tipoBaseDatos;
    private String servidorBaseDatos;
    private String esquemaBaseDatos;
    private Boolean backupActivo;
    private String frecuenciaBackup;
    private Boolean cifradoBaseDatos;
    private String responsableBaseDatos;
    private String observaciones;
}//-