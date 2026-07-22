package pe.edu.unas.ctic.diagti.auditor.service;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.mapper.AuditorMapper;
import pe.edu.unas.ctic.diagti.auditor.model.Auditoria;
import pe.edu.unas.ctic.diagti.auditor.repository.AuditorAuditoriaRepository;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class AuditorAuditoriaServicelmpl implements AuditorAuditoriaService {

    @Autowired
    private AuditorAuditoriaRepository auditoriaRepository;

    @Autowired
    private LoginUsuarioRepository usuarioRepository;

    @Override
    public List<AuditorAuditoriaResponseDTO> getAuditoria(AuditorAuditoriaRequestDTO request) {
        try {
            System.out.println("🔍 ===== INICIANDO CONSULTA DE AUDITORÍA =====");
            System.out.println("📋 Filtros recibidos:");
            System.out.println("   searchText: " + request.getSearchText());
            System.out.println("   modulo: " + request.getModulo());
            System.out.println("   accion: " + request.getAccion());
            System.out.println("   fechaDesde: " + request.getFechaDesde());
            System.out.println("   fechaHasta: " + request.getFechaHasta());

            // 🔥 PRIMERO: Probar si hay datos en la tabla
            long totalRegistros = auditoriaRepository.count();
            System.out.println("📊 TOTAL DE REGISTROS EN LA TABLA: " + totalRegistros);

            // 🔥 SEGUNDO: Traer todos los registros sin filtros (prueba)
            if (request.getSearchText() == null && request.getModulo() == null && 
                request.getAccion() == null && request.getFechaDesde() == null && 
                request.getFechaHasta() == null) {
                
                System.out.println("📡 SIN FILTROS - Consultando todos los registros...");
                List<Auditoria> todas = auditoriaRepository.findAllOrderByFechaDesc();
                System.out.println("✅ Registros encontrados (sin filtros): " + todas.size());
                
                List<AuditorAuditoriaResponseDTO> resultado = new ArrayList<>();
                for (Auditoria auditoria : todas) {
                    Usuario usuario = null;
                    if (auditoria.getIdUsuario() != null) {
                        Optional<Usuario> usuarioOpt = usuarioRepository.findById(auditoria.getIdUsuario());
                        if (usuarioOpt.isPresent()) {
                            usuario = usuarioOpt.get();
                        }
                    }
                    resultado.add(AuditorMapper.toResponseDTO(auditoria, usuario));
                }
                return resultado;
            }

            // 🔥 TERCERO: Con filtros
            LocalDateTime fechaDesde = null;
            LocalDateTime fechaHasta = null;

            if (request.getFechaDesde() != null) {
                fechaDesde = request.getFechaDesde().atStartOfDay();
            }

            if (request.getFechaHasta() != null) {
                fechaHasta = request.getFechaHasta().atTime(LocalTime.MAX);
            }

            List<Auditoria> auditorias = auditoriaRepository.filtrarAuditoria(
                request.getSearchText(),
                request.getModulo(),
                request.getAccion(),
                fechaDesde,
                fechaHasta
            );

            System.out.println("✅ Registros encontrados (con filtros): " + auditorias.size());

            List<AuditorAuditoriaResponseDTO> resultado = new ArrayList<>();
            
            for (Auditoria auditoria : auditorias) {
                Usuario usuario = null;
                if (auditoria.getIdUsuario() != null) {
                    Optional<Usuario> usuarioOpt = usuarioRepository.findById(auditoria.getIdUsuario());
                    if (usuarioOpt.isPresent()) {
                        usuario = usuarioOpt.get();
                    }
                }
                resultado.add(AuditorMapper.toResponseDTO(auditoria, usuario));
            }

            System.out.println("🔍 ===== FIN CONSULTA DE AUDITORÍA =====");
            return resultado;

        } catch (Exception e) {
            System.err.println("❌ ERROR en getAuditoria: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Long> getKPIs() {
        Map<String, Long> kpis = new HashMap<>();
        try {
            kpis.put("total", auditoriaRepository.count());
            kpis.put("consultas", auditoriaRepository.countConsultas());
            kpis.put("intentosFallidos", auditoriaRepository.countIntentosFallidos());
            kpis.put("exportaciones", auditoriaRepository.countExportaciones());
            System.out.println("📊 KPIs calculados: " + kpis);
        } catch (Exception e) {
            System.err.println("❌ ERROR en getKPIs: " + e.getMessage());
            kpis.put("total", 0L);
            kpis.put("consultas", 0L);
            kpis.put("intentosFallidos", 0L);
            kpis.put("exportaciones", 0L);
        }
        return kpis;
    }

    @Override
    @Transactional
    public void registrarEvento(Long idUsuario, String modulo, String accion, String descripcion, String ip, String userAgent) {
        try {
            Auditoria auditoria = new Auditoria();
            auditoria.setIdUsuario(idUsuario);
            auditoria.setModulo(modulo);
            auditoria.setAccion(accion);
            auditoria.setDescripcion(descripcion);
            auditoria.setDireccionIp(ip);
            auditoria.setUserAgent(userAgent);
            auditoria.setFechaEvento(LocalDateTime.now());

            auditoriaRepository.save(auditoria);
            System.out.println("📝 Evento registrado en BD: " + modulo + " - " + accion);
        } catch (Exception e) {
            System.err.println("❌ ERROR en registrarEvento: " + e.getMessage());
            e.printStackTrace();
        }
    }
}