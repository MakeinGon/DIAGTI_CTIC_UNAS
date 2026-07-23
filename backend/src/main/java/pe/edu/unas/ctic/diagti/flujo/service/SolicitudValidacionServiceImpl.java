package pe.edu.unas.ctic.diagti.flujo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.flujo.dto.SolicitudValidacionRequest;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import pe.edu.unas.ctic.diagti.flujo.repository.RegistroAreaRepository;
import pe.edu.unas.ctic.diagti.flujo.repository.SolicitudValidacionRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SolicitudValidacionServiceImpl implements SolicitudValidacionService {
    private static final Map<String, Map<String, List<String>>> CAMPOS_POR_AREA = Map.of(
            "DESARROLLO", Map.of(
                    "Información general", List.of("General", "Código", "Nombre", "Descripción", "Área usuaria",
                            "Responsable funcional", "Responsable técnico", "Criticidad", "Tipo de aplicativo"),
                    "Información del desarrollo", List.of("Año de desarrollo", "Forma de adquisición",
                            "Empresa desarrolladora", "Contrato vigente", "Fecha de soporte", "Observaciones"),
                    "Arquitectura de software", List.of("Lenguaje", "Versión lenguaje", "Framework",
                            "Versión framework", "Arquitectura", "Patrón", "Repositorio Git",
                            "Tecnologías complementarias"),
                    "Base de datos", List.of("Motor", "Versión", "Tipo de BD", "Servidor", "Esquema",
                            "Backup", "Frecuencia Backup", "Cifrado", "Responsable BD"),
                    "Integraciones", List.of("Destino", "Protocolo", "Método", "Responsable"),
                    "Evidencias de software", List.of("Evidencia o URL")
            ),
            "INFRAESTRUCTURA", Map.of(
                    "Infraestructura tecnológica", List.of("General", "Plataforma", "Tipo de servidor",
                            "Sistema operativo", "Versión del sistema operativo", "IP privada",
                            "¿Usa Proxmox?", "¿Cuenta con backup?", "Frecuencia de backup", "Observaciones"),
                    "Despliegue, dominio y acceso", List.of("Ambiente", "Servidor", "Puerto",
                            "Dominio o subdominio", "Servidor web", "Proxy reverso", "Docker",
                            "Docker Compose", "Exposición", "Mecanismo CI/CD"),
                    "Seguridad", List.of("SSL/TLS", "Método de autenticación", "MFA",
                            "Generación de logs", "Cifrado de información", "Restricción por IP",
                            "Control de sesiones"),
                    "Evidencias técnicas", List.of("Evidencia técnica")
            )
    );

    private final SolicitudValidacionRepository repository;
    private final RegistroAreaRepository registroRepository;
    private final ObjectMapper objectMapper;

    public SolicitudValidacionServiceImpl(SolicitudValidacionRepository repository,
                                          RegistroAreaRepository registroRepository,
                                          ObjectMapper objectMapper) {
        this.repository = repository;
        this.registroRepository = registroRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public SolicitudValidacion crear(SolicitudValidacionRequest request) throws JsonProcessingException {
        String codigo = request.getCodigoSistema().trim();
        String origen = request.getAreaOrigen().trim().toUpperCase(Locale.ROOT);
        String responsable = valorO(request.getResponsable(), "No especificado");
        String usuarioOrigen = valorO(request.getUsuarioOrigen(), responsable);
        SolicitudValidacion solicitud = repository
                .findFirstByCodigoSistemaAndAreaOrigenAndEstadoOrderByFechaEnvioDesc(codigo, origen, "PENDIENTE")
                .orElseGet(SolicitudValidacion::new);
        if (solicitud.getId() != null && solicitud.getUsuarioOrigen() != null
                && !solicitud.getUsuarioOrigen().equalsIgnoreCase(usuarioOrigen)) {
            throw new IllegalStateException("La solicitud pendiente pertenece a otro usuario");
        }
        solicitud.setCodigoSistema(codigo);
        solicitud.setNombreSistema(request.getNombreSistema().trim());
        solicitud.setAreaOrigen(origen);
        solicitud.setAreaUsuaria(valorO(request.getAreaUsuaria(), origen));
        solicitud.setResponsable(responsable);
        solicitud.setUsuarioOrigen(usuarioOrigen);
        solicitud.setComentario(valorO(request.getComentario(), "Enviado para validación"));
        solicitud.setDatosJson(objectMapper.writeValueAsString(request.getDatos()));
        solicitud.setEstado("PENDIENTE");
        solicitud.setComentarioRevision(null);
        solicitud.setObservacionesJson(null);
        solicitud.setRevisadoPor(null);
        solicitud.setUsuarioRevisor(null);
        solicitud.setFechaRevision(null);
        solicitud.setFechaEnvio(LocalDateTime.now());
        SolicitudValidacion guardada = repository.save(solicitud);
        sincronizarRegistro(guardada);
        return guardada;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudValidacion> pendientes() {
        return repository.findByEstadoOrderByFechaEnvioDesc("PENDIENTE");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudValidacion> porOrigen(String areaOrigen) {
        Set<String> codigos = new HashSet<>();
        return repository.findByAreaOrigenOrderByFechaEnvioDesc(normalizarOrigen(areaOrigen)).stream()
                .filter(s -> codigos.add(s.getCodigoSistema().toUpperCase(Locale.ROOT)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SolicitudValidacion> estadoActual(String areaOrigen, String codigoSistema) {
        return repository.findFirstByCodigoSistemaAndAreaOrigenOrderByFechaEnvioDesc(
                codigoSistema.trim(), normalizarOrigen(areaOrigen));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudValidacion> historial(String areaOrigen, String codigoSistema) {
        return repository.findAllByOrderByFechaEnvioDesc().stream()
                .filter(s -> areaOrigen == null || s.getAreaOrigen().equalsIgnoreCase(areaOrigen.trim()))
                .filter(s -> codigoSistema == null || s.getCodigoSistema().equalsIgnoreCase(codigoSistema.trim()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SolicitudValidacion> detalle(Long id) { return repository.findById(id); }

    @Override
    @Transactional
    public Optional<SolicitudValidacion> cambiarEstado(Long id, Map<String, Object> body) {
        String estado = texto(body.get("estado")).toUpperCase(Locale.ROOT);
        if (!List.of("VALIDADO", "OBSERVADO", "RECHAZADO").contains(estado)) {
            throw new IllegalArgumentException("Estado de validación no permitido");
        }
        return repository.findById(id).map(solicitud -> {
            String comentario = valorO(texto(body.get("comentario")),
                    estado.equals("VALIDADO") ? "Información revisada y aprobada" : "Sin detalle");
            List<Map<String, Object>> observaciones = extraerObservaciones(body.get("observaciones"));
            if ("OBSERVADO".equals(estado) || "RECHAZADO".equals(estado)) {
                if (observaciones.isEmpty()) {
                    String seccion = "DESARROLLO".equalsIgnoreCase(solicitud.getAreaOrigen())
                            ? "Información general" : "Infraestructura tecnológica";
                    observaciones = List.of(new LinkedHashMap<>(Map.of(
                            "responsable", solicitud.getAreaOrigen(),
                            "seccion", seccion,
                            "campo", "General",
                            "detalle", comentario,
                            "evidenciaRequerida", false
                    )));
                }
                observaciones = validarYNormalizarObservaciones(solicitud.getAreaOrigen(), observaciones);
                try {
                    solicitud.setObservacionesJson(objectMapper.writeValueAsString(observaciones));
                } catch (JsonProcessingException ex) {
                    throw new IllegalArgumentException("No se pudieron guardar las observaciones");
                }
                comentario = observaciones.stream()
                        .map(o -> texto(o.get("detalle")))
                        .filter(s -> !s.isBlank())
                        .collect(java.util.stream.Collectors.joining(" | "));
            } else {
                solicitud.setObservacionesJson(null);
            }
            solicitud.setEstado(estado);
            solicitud.setComentarioRevision(comentario);
            solicitud.setRevisadoPor(valorO(texto(body.get("revisadoPor")), "Validador CTIC"));
            solicitud.setUsuarioRevisor(valorO(texto(body.get("usuarioRevisor")), solicitud.getRevisadoPor()));
            solicitud.setFechaRevision(LocalDateTime.now());
            SolicitudValidacion guardada = repository.save(solicitud);
            sincronizarRegistro(guardada);
            return guardada;
        });
    }

    private void sincronizarRegistro(SolicitudValidacion solicitud) {
        RegistroArea registro = registroRepository.findByCodigoSistemaIgnoreCaseAndAreaOrigenIgnoreCase(
                solicitud.getCodigoSistema(), solicitud.getAreaOrigen()).orElseGet(RegistroArea::new);
        registro.setCodigoSistema(solicitud.getCodigoSistema());
        registro.setAreaOrigen(solicitud.getAreaOrigen());
        registro.setNombreSistema(solicitud.getNombreSistema());
        registro.setAreaUsuaria(solicitud.getAreaUsuaria());
        registro.setResponsable(solicitud.getResponsable());
        registro.setUsuarioOrigen(solicitud.getUsuarioOrigen());
        registro.setEstado(solicitud.getEstado());
        registro.setDatosJson(solicitud.getDatosJson());
        registro.setComentarioRevision(solicitud.getComentarioRevision());
        registro.setObservacionesJson(solicitud.getObservacionesJson());
        registro.setRevisadoPor(solicitud.getRevisadoPor());
        registro.setUsuarioRevisor(solicitud.getUsuarioRevisor());
        registro.setFechaEnvio(solicitud.getFechaEnvio());
        registro.setFechaRevision(solicitud.getFechaRevision());
        registroRepository.save(registro);
    }

    private String normalizarOrigen(String origen) {
        if (origen == null || origen.isBlank()) throw new IllegalArgumentException("El área de origen es obligatoria");
        return origen.trim().toUpperCase(Locale.ROOT);
    }

    private String valorO(String valor, String predeterminado) {
        return valor == null || valor.isBlank() ? predeterminado : valor.trim();
    }

    private String texto(Object valor) {
        return valor == null ? "" : String.valueOf(valor).trim();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extraerObservaciones(Object valor) {
        if (!(valor instanceof List<?> lista)) return new ArrayList<>();
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Object item : lista) {
            if (item instanceof Map<?, ?> mapa) {
                Map<String, Object> normal = new LinkedHashMap<>();
                mapa.forEach((clave, dato) -> normal.put(String.valueOf(clave), dato));
                resultado.add(normal);
            }
        }
        return resultado;
    }

    private List<Map<String, Object>> validarYNormalizarObservaciones(
            String areaOrigen, List<Map<String, Object>> observaciones) {
        String area = normalizarOrigen(areaOrigen);
        Map<String, List<String>> catalogo = CAMPOS_POR_AREA.get(area);
        if (catalogo == null) throw new IllegalArgumentException("Área de observación no permitida");

        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Map<String, Object> observacion : observaciones) {
            String seccion = texto(observacion.get("seccion"));
            String campo = texto(observacion.get("campo"));
            String detalle = texto(observacion.get("detalle"));
            if (!catalogo.containsKey(seccion) || !catalogo.get(seccion).contains(campo)) {
                throw new IllegalArgumentException("La sección o el campo no pertenece a " + area);
            }
            if (detalle.length() < 5) {
                throw new IllegalArgumentException("Cada observación debe explicar qué se debe corregir");
            }
            Map<String, Object> normal = new LinkedHashMap<>();
            normal.put("responsable", area);
            normal.put("seccion", seccion);
            normal.put("campo", campo);
            normal.put("detalle", detalle);
            normal.put("evidenciaRequerida", Boolean.parseBoolean(texto(observacion.get("evidenciaRequerida"))));
            resultado.add(normal);
        }
        return resultado;
    }
}
