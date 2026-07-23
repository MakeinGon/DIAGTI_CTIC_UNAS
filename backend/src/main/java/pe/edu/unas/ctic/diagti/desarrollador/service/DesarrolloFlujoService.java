package pe.edu.unas.ctic.diagti.desarrollador.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.desarrollador.dto.DesarrolloFlujoDTO;
import pe.edu.unas.ctic.diagti.desarrollador.mapper.DesarrolloFlujoMapper;
import pe.edu.unas.ctic.diagti.flujo.dto.SolicitudValidacionRequest;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import pe.edu.unas.ctic.diagti.flujo.repository.RegistroAreaRepository;
import pe.edu.unas.ctic.diagti.flujo.service.SolicitudValidacionService;

import java.util.*;

/**
 * Orquesta el flujo compartido Desarrollo → Infraestructura/Validador.
 * Persiste borradores y correcciones en {@link RegistroArea} y crea la
 * solicitud transversal mediante {@link SolicitudValidacionService}.
 */
@Service
public class DesarrolloFlujoService {
    private static final String ORIGEN = "DESARROLLO";
    private final RegistroAreaRepository registroRepository;
    private final DesarrolloFlujoMapper mapper;
    private final SolicitudValidacionService solicitudService;
    private final ObjectMapper objectMapper;

    public DesarrolloFlujoService(RegistroAreaRepository registroRepository,
                                      DesarrolloFlujoMapper mapper,
                                      SolicitudValidacionService solicitudService,
                                      ObjectMapper objectMapper) {
        this.registroRepository = registroRepository;
        this.mapper = mapper;
        this.solicitudService = solicitudService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<DesarrolloFlujoDTO> listar(String usuario) {
        // La bandeja pertenece al área, no a una sola cuenta. Se conservan
        // usuarioOrigen y responsable para saber quién creó/asumió el registro.
        List<RegistroArea> registros =
                registroRepository.findByAreaOrigenIgnoreCaseOrderByFechaActualizacionDesc(ORIGEN);
        return registros.stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public DesarrolloFlujoDTO obtener(String codigo) {
        return registroRepository.findByCodigoSistemaIgnoreCaseAndAreaOrigenIgnoreCase(codigo, ORIGEN)
                .map(mapper::toDto).orElseThrow(() -> new NoSuchElementException("Sistema de Desarrollo no encontrado"));
    }

    @Transactional
    public DesarrolloFlujoDTO guardarBorrador(DesarrolloFlujoDTO.Request request) throws JsonProcessingException {
        return mapper.toDto(guardar(request, "BORRADOR"));
    }

    @Transactional
    public DesarrolloFlujoDTO guardarCorreccion(DesarrolloFlujoDTO.Request request) throws JsonProcessingException {
        return mapper.toDto(guardar(request, "SUBSANADO"));
    }

    @Transactional
    public SolicitudValidacion enviar(DesarrolloFlujoDTO.Request request) throws JsonProcessingException {
        guardar(request, "ENVIADO");
        SolicitudValidacionRequest solicitud = convertirSolicitud(request);
        solicitud.setComentario(valorO(request.getComentario(), "Información de Desarrollo enviada para validación"));
        return solicitudService.crear(solicitud);
    }

    @Transactional(readOnly = true)
    public List<SolicitudValidacion> historial(String codigo) {
        return solicitudService.historial(ORIGEN, codigo);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> estadisticas(String usuario) {
        List<DesarrolloFlujoDTO> registros = listar(usuario);
        Map<String, Long> resultado = new LinkedHashMap<>();
        resultado.put("total", (long) registros.size());
        for (String estado : List.of("BORRADOR", "PENDIENTE", "OBSERVADO", "SUBSANADO",
                "CORREGIDO", "VALIDADO", "RECHAZADO")) {
            resultado.put(estado.toLowerCase(Locale.ROOT), registros.stream()
                    .filter(r -> estado.equalsIgnoreCase(r.getEstado())).count());
        }
        return resultado;
    }

    private RegistroArea guardar(DesarrolloFlujoDTO.Request request, String estado) throws JsonProcessingException {
        String codigo = request.getCodigoSistema().trim();
        RegistroArea registro = registroRepository
                .findByCodigoSistemaIgnoreCaseAndAreaOrigenIgnoreCase(codigo, ORIGEN)
                .orElseGet(RegistroArea::new);
        String usuario = valorO(request.getUsuarioOrigen(),
                valorO(request.getResponsable(), "Área de Desarrollo"));
        if (registro.getId() != null && registro.getUsuarioOrigen() != null
                && !registro.getUsuarioOrigen().equalsIgnoreCase(usuario)) {
            throw new IllegalStateException("El sistema pertenece a otro usuario de Desarrollo");
        }
        registro.setCodigoSistema(codigo);
        registro.setNombreSistema(request.getNombreSistema().trim());
        registro.setAreaOrigen(ORIGEN);
        registro.setAreaUsuaria(valorO(request.getAreaUsuaria(), "CTIC UNAS"));
        registro.setResponsable(valorO(request.getResponsable(), "Área de Desarrollo"));
        registro.setUsuarioOrigen(valorO(usuario, registro.getResponsable()));
        registro.setEstado(estado);
        registro.setDatosJson(objectMapper.writeValueAsString(request.getDatos()));
        if ("BORRADOR".equals(estado)) {
            registro.setComentarioRevision(null);
            registro.setObservacionesJson(null);
            registro.setRevisadoPor(null);
            registro.setUsuarioRevisor(null);
            registro.setFechaRevision(null);
        }
        return registroRepository.save(registro);
    }

    private SolicitudValidacionRequest convertirSolicitud(DesarrolloFlujoDTO.Request request) {
        SolicitudValidacionRequest solicitud = new SolicitudValidacionRequest();
        solicitud.setCodigoSistema(request.getCodigoSistema());
        solicitud.setNombreSistema(request.getNombreSistema());
        solicitud.setAreaOrigen(ORIGEN);
        solicitud.setAreaUsuaria(request.getAreaUsuaria());
        solicitud.setResponsable(request.getResponsable());
        solicitud.setUsuarioOrigen(request.getUsuarioOrigen());
        solicitud.setDatos(request.getDatos());
        return solicitud;
    }

    private String valorO(String valor, String defecto) {
        return valor == null || valor.isBlank() ? defecto : valor.trim();
    }
}
