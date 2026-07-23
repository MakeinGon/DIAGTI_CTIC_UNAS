package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.flujo.dto.SolicitudValidacionRequest;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import pe.edu.unas.ctic.diagti.flujo.repository.RegistroAreaRepository;
import pe.edu.unas.ctic.diagti.flujo.service.SolicitudValidacionService;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraTecnicoRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraTecnicoResponseDTO;
import pe.edu.unas.ctic.diagti.infraestructura.mapper.InfraSistemaMapper;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraTecnicoService;

@Service
public class InfraTecnicoServiceImpl implements InfraTecnicoService {
    private static final String ORIGEN = "INFRAESTRUCTURA";
    private final RegistroAreaRepository registroRepository;
    private final SolicitudValidacionService solicitudService;
    private final InfraSistemaMapper mapper;
    private final ObjectMapper objectMapper;

    public InfraTecnicoServiceImpl(RegistroAreaRepository registroRepository,
                                   SolicitudValidacionService solicitudService,
                                   InfraSistemaMapper mapper,
                                   ObjectMapper objectMapper) {
        this.registroRepository = registroRepository;
        this.solicitudService = solicitudService;
        this.mapper = mapper;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public InfraTecnicoResponseDTO guardarBorrador(InfraTecnicoRequestDTO request) throws JsonProcessingException {
        RegistroArea registro = guardar(request, "BORRADOR");
        return respuesta("Borrador de Infraestructura guardado en PostgreSQL", registro, null);
    }

    @Override
    @Transactional
    public InfraTecnicoResponseDTO guardarCorreccion(InfraTecnicoRequestDTO request) throws JsonProcessingException {
        RegistroArea registro = guardar(request, "SUBSANADO");
        return respuesta("Corrección de Infraestructura guardada", registro, null);
    }

    @Override
    @Transactional
    public InfraTecnicoResponseDTO enviar(InfraTecnicoRequestDTO request) throws JsonProcessingException {
        RegistroArea registro = guardar(request, "ENVIADO");
        SolicitudValidacionRequest solicitud = new SolicitudValidacionRequest();
        solicitud.setCodigoSistema(request.getCodigoSistema());
        solicitud.setNombreSistema(request.getNombreSistema());
        solicitud.setAreaOrigen(ORIGEN);
        solicitud.setAreaUsuaria(request.getAreaUsuaria());
        solicitud.setResponsable(request.getResponsable());
        solicitud.setUsuarioOrigen(request.getUsuarioOrigen());
        solicitud.setComentario(valorO(request.getComentario(), "Registro técnico enviado para validación"));
        solicitud.setDatos(request.getDatos());
        SolicitudValidacion enviada = solicitudService.crear(solicitud);
        return respuesta("Registro técnico enviado al Validador CTIC", registro, enviada);
    }

    private RegistroArea guardar(InfraTecnicoRequestDTO request, String estado) throws JsonProcessingException {
        SolicitudValidacion desarrollo = solicitudService.estadoActual("DESARROLLO", request.getCodigoSistema())
                .orElseThrow(() -> new IllegalStateException("Desarrollo todavía no envió este sistema a Infraestructura"));
        String codigo = request.getCodigoSistema().trim();
        RegistroArea registro = registroRepository
                .findByCodigoSistemaIgnoreCaseAndAreaOrigenIgnoreCase(codigo, ORIGEN)
                .orElseGet(RegistroArea::new);

        // Si Desarrollo volvió a enviar el sistema, se inicia un ciclo técnico
        // independiente. No se conservan el VALIDADO, las observaciones ni el
        // responsable de la entrega anterior de Infraestructura.
        if (registro.getId() != null
                && !InfraSistemasServiceImpl.perteneceAlCicloActual(desarrollo, registro)) {
            reiniciarParaNuevoEnvio(registro);
        }

        String usuario = valorO(request.getUsuarioOrigen(),
                valorO(request.getResponsable(), "Área de Infraestructura"));
        if (registro.getId() != null && registro.getUsuarioOrigen() != null
                && !registro.getUsuarioOrigen().equalsIgnoreCase(usuario)) {
            throw new IllegalStateException("El sistema ya fue asignado a otro usuario de Infraestructura");
        }
        registro.setCodigoSistema(codigo);
        registro.setNombreSistema(request.getNombreSistema().trim());
        registro.setAreaOrigen(ORIGEN);
        registro.setAreaUsuaria(valorO(request.getAreaUsuaria(), "CTIC UNAS"));
        registro.setResponsable(valorO(request.getResponsable(), "Área de Infraestructura"));
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

    private void reiniciarParaNuevoEnvio(RegistroArea registro) {
        registro.setUsuarioOrigen(null);
        registro.setComentarioRevision(null);
        registro.setObservacionesJson(null);
        registro.setRevisadoPor(null);
        registro.setUsuarioRevisor(null);
        registro.setFechaEnvio(null);
        registro.setFechaRevision(null);
    }

    private InfraTecnicoResponseDTO respuesta(String mensaje, RegistroArea registro, SolicitudValidacion solicitud) {
        InfraTecnicoResponseDTO dto = new InfraTecnicoResponseDTO();
        dto.setExito(true);
        dto.setMensaje(mensaje);
        dto.setSistema(mapper.desdeRegistro(registro));
        dto.setSolicitud(solicitud);
        return dto;
    }

    private String valorO(String valor, String defecto) {
        return valor == null || valor.isBlank() ? defecto : valor.trim();
    }
}
