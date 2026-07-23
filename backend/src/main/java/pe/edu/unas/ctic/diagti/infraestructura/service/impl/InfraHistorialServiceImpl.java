package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import pe.edu.unas.ctic.diagti.flujo.service.SolicitudValidacionService;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraHistorialDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraHistorialService;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class InfraHistorialServiceImpl implements InfraHistorialService {
    private final SolicitudValidacionService solicitudService;
    public InfraHistorialServiceImpl(SolicitudValidacionService solicitudService) { this.solicitudService = solicitudService; }

    @Override
    @Transactional(readOnly = true)
    public List<InfraHistorialDTO> listar(String codigoSistema) {
        List<InfraHistorialDTO> eventos = new ArrayList<>();
        for (SolicitudValidacion solicitud : solicitudService.historial("INFRAESTRUCTURA", codigoSistema)) {
            InfraHistorialDTO envio = new InfraHistorialDTO();
            envio.setId(solicitud.getId());
            envio.setCodigoSistema(solicitud.getCodigoSistema());
            envio.setAccion("ENVIO");
            envio.setEstado("PENDIENTE");
            envio.setUsuario(solicitud.getResponsable());
            envio.setDetalle(solicitud.getComentario());
            envio.setFecha(solicitud.getFechaEnvio());
            eventos.add(envio);
            if (solicitud.getFechaRevision() != null) {
                InfraHistorialDTO revision = new InfraHistorialDTO();
                revision.setId(solicitud.getId());
                revision.setCodigoSistema(solicitud.getCodigoSistema());
                revision.setAccion("VALIDADO".equals(solicitud.getEstado()) ? "VALIDACION" : "OBSERVACION");
                revision.setEstado(solicitud.getEstado());
                revision.setUsuario(solicitud.getRevisadoPor());
                revision.setDetalle(solicitud.getComentarioRevision());
                revision.setFecha(solicitud.getFechaRevision());
                eventos.add(revision);
            }
        }
        eventos.sort(Comparator.comparing(InfraHistorialDTO::getFecha,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return eventos;
    }
}
