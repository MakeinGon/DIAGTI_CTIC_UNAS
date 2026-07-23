package pe.edu.unas.ctic.diagti.desarrollador.controller;
//-
import jakarta.validation.Valid;
import lombok.Data;  // ✅ IMPORTANTE: Agregar este import-
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EditarSistemaRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.OperacionSistemaDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaCompletoDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.EditarSistemaService;

@RestController
@RequestMapping("/api/desarrollador/editar-sistema")
@RequiredArgsConstructor

public class EditarSistemaController {
    
    private final EditarSistemaService editarSistemaService;
    
    @GetMapping("/{id}")
    public ResponseEntity<SistemaCompletoDTO> obtenerDatosEdicion(@PathVariable Long id) {
        return ResponseEntity.ok(editarSistemaService.obtenerDatosEdicion(id));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<OperacionSistemaDTO.EdicionResponse> editarSistema(
            @PathVariable Long id,
            @Valid @RequestBody EditarSistemaRequestDTO request) {
        return ResponseEntity.ok(editarSistemaService.editarSistema(id, request));
    }
    
    @PostMapping("/{id}/evidencias")
    public ResponseEntity<OperacionSistemaDTO.EdicionResponse> subirEvidencia(
            @PathVariable Long id,
            @RequestParam("tipo") String tipo,
            @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(editarSistemaService.subirEvidencia(id, tipo, archivo));
    }
    
    @DeleteMapping("/{id}/evidencias/{evidenciaId}")
    public ResponseEntity<Void> eliminarEvidencia(
            @PathVariable Long id,
            @PathVariable Long evidenciaId) {
        editarSistemaService.eliminarEvidencia(id, evidenciaId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/urls")
    public ResponseEntity<OperacionSistemaDTO.EdicionResponse> agregarUrl(
            @PathVariable Long id,
            @RequestParam String url,
            @RequestParam(required = false) String descripcion) {
        return ResponseEntity.ok(editarSistemaService.agregarUrl(id, url, descripcion));
    }
    
    @DeleteMapping("/{id}/urls/{urlId}")
    public ResponseEntity<Void> eliminarUrl(
            @PathVariable Long id,
            @PathVariable Long urlId) {
        editarSistemaService.eliminarUrl(id, urlId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/integraciones")
    public ResponseEntity<OperacionSistemaDTO.EdicionResponse> agregarIntegracion(
            @PathVariable Long id,
            @RequestBody IntegracionRequest request) {
        return ResponseEntity.ok(editarSistemaService.agregarIntegracion(id, request));
    }
    
    @DeleteMapping("/{id}/integraciones/{integracionId}")
    public ResponseEntity<Void> eliminarIntegracion(
            @PathVariable Long id,
            @PathVariable Long integracionId) {
        editarSistemaService.eliminarIntegracion(id, integracionId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/enviar-validacion")
    public ResponseEntity<OperacionSistemaDTO.EdicionResponse> enviarAValidacion(@PathVariable Long id) {
        return ResponseEntity.ok(editarSistemaService.enviarAValidacion(id));
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