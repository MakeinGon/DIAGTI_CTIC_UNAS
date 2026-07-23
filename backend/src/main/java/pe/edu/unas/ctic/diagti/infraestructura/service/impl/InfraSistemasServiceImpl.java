package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import pe.edu.unas.ctic.diagti.flujo.repository.RegistroAreaRepository;
import pe.edu.unas.ctic.diagti.flujo.service.SolicitudValidacionService;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDTO;
import pe.edu.unas.ctic.diagti.infraestructura.mapper.InfraSistemaMapper;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraSistemasService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class InfraSistemasServiceImpl implements InfraSistemasService {
    private static final String ORIGEN = "INFRAESTRUCTURA";
    private final SolicitudValidacionService solicitudService;
    private final RegistroAreaRepository registroRepository;
    private final InfraSistemaMapper mapper;

    public InfraSistemasServiceImpl(SolicitudValidacionService solicitudService,
                                    RegistroAreaRepository registroRepository,
                                    InfraSistemaMapper mapper) {
        this.solicitudService = solicitudService;
        this.registroRepository = registroRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InfraSistemaDTO> listar(String usuario) {
        Map<String, RegistroArea> propios = registroRepository
                .findByAreaOrigenIgnoreCaseOrderByFechaActualizacionDesc(ORIGEN).stream()
                .collect(Collectors.toMap(r -> r.getCodigoSistema().toUpperCase(Locale.ROOT),
                        Function.identity(), (a, b) -> a, LinkedHashMap::new));

        return solicitudService.porOrigen("DESARROLLO").stream()
                .map(desarrollo -> new AbstractMap.SimpleEntry<>(desarrollo,
                        registroTecnicoActual(desarrollo,
                                propios.get(desarrollo.getCodigoSistema().toUpperCase(Locale.ROOT)))))
                // Todos los integrantes del área pueden consultar la bandeja.
                // El usuario asignado continúa identificado en el DTO.
                .map(par -> mapper.desdeAsignacion(par.getKey(), par.getValue()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InfraSistemaDTO obtener(String codigo) {
        SolicitudValidacion desarrollo = solicitudService.estadoActual("DESARROLLO", codigo)
                .orElseThrow(() -> new NoSuchElementException("El sistema todavía no fue enviado por Desarrollo"));
        RegistroArea propio = registroRepository
                .findByCodigoSistemaIgnoreCaseAndAreaOrigenIgnoreCase(codigo, ORIGEN).orElse(null);
        return mapper.desdeAsignacion(desarrollo, registroTecnicoActual(desarrollo, propio));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> estadisticas(String usuario) {
        List<InfraSistemaDTO> sistemas = listar(usuario);
        Map<String, Long> resultado = new LinkedHashMap<>();
        resultado.put("total", (long) sistemas.size());
        for (String estado : List.of("NUEVO", "BORRADOR", "PENDIENTE", "OBSERVADO",
                "SUBSANADO", "CORREGIDO", "VALIDADO", "RECHAZADO")) {
            resultado.put(estado.toLowerCase(Locale.ROOT), sistemas.stream()
                    .filter(s -> estado.equalsIgnoreCase(s.getEstado())).count());
        }
        return resultado;
    }

    /**
     * Devuelve el registro técnico solo cuando pertenece al último envío de
     * Desarrollo. Así, un VALIDADO de un ciclo anterior no se reutiliza como
     * estado inicial de la nueva asignación de Infraestructura.
     */
    static RegistroArea registroTecnicoActual(SolicitudValidacion desarrollo, RegistroArea infraestructura) {
        return perteneceAlCicloActual(desarrollo, infraestructura) ? infraestructura : null;
    }

    /**
     * La fecha de envío de Infraestructura identifica el ciclo que revisó el
     * Validador. Para un borrador, que aún no tiene envío, se usa su última
     * actualización. La fecha de revisión no se usa porque una validación
     * tardía de un ciclo antiguo no debe volverlo vigente.
     */
    static boolean perteneceAlCicloActual(SolicitudValidacion desarrollo, RegistroArea infraestructura) {
        if (infraestructura == null) return false;
        if (desarrollo == null || desarrollo.getFechaEnvio() == null) return true;

        LocalDateTime inicioInfraestructura = infraestructura.getFechaEnvio() != null
                ? infraestructura.getFechaEnvio()
                : infraestructura.getFechaActualizacion();
        if (inicioInfraestructura == null) inicioInfraestructura = infraestructura.getFechaCreacion();

        return inicioInfraestructura != null
                && !inicioInfraestructura.isBefore(desarrollo.getFechaEnvio());
    }
}
