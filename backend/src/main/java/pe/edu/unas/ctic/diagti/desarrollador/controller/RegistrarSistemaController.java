package pe.edu.unas.ctic.diagti.desarrollador.controller;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.RegistrarSistemaService;

@RestController
@RequestMapping("/api/desarrollador/registrar-sistema")
@RequiredArgsConstructor

public class RegistrarSistemaController {
    
    private final RegistrarSistemaService registrarSistemaService;
    
    @PostMapping
    public ResponseEntity<RegistrarSistemaResponseDTO> registrarSistema(
            @Valid @RequestBody RegistrarSistemaRequestDTO request) {
        return ResponseEntity.ok(registrarSistemaService.registrarSistema(request));
    }
    
    @PostMapping("/validar-codigo")
    public ResponseEntity<Boolean> validarCodigo(@RequestParam String codigo) {
        return ResponseEntity.ok(registrarSistemaService.validarCodigo(codigo));
    }
    
    @PostMapping("/{id}/evidencias")
    public ResponseEntity<RegistrarSistemaResponseDTO> subirEvidencia(
            @PathVariable Long id,
            @RequestParam("tipo") String tipo,
            @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(registrarSistemaService.subirEvidencia(id, tipo, archivo));
    }
    
    @PostMapping("/{id}/urls")
    public ResponseEntity<RegistrarSistemaResponseDTO> agregarUrl(
            @PathVariable Long id,
            @RequestParam String url,
            @RequestParam(required = false) String descripcion) {
        return ResponseEntity.ok(registrarSistemaService.agregarUrl(id, url, descripcion));
    }
    
    @PostMapping("/{id}/integraciones")
    public ResponseEntity<RegistrarSistemaResponseDTO> agregarIntegracion(
            @PathVariable Long id,
            @RequestBody IntegracionRequest request) {
        return ResponseEntity.ok(registrarSistemaService.agregarIntegracion(id, request));
    }
    
    @Data
    public static class IntegracionRequest {
        private String sistemaDestino;
        private String protocolo;
        private String metodo;
        private String responsable;
        private String frecuencia;
        private String estado;
        private String descripcion;
    }
}