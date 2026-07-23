package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import org.junit.jupiter.api.Test;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InfraSistemasServiceImplTest {

    private static final LocalDateTime ENVIO_DESARROLLO =
            LocalDateTime.of(2026, 7, 23, 10, 0);

    @Test
    void validadoAnteriorNoSeReutilizaEnNuevoEnvioDeDesarrollo() {
        SolicitudValidacion desarrollo = desarrolloEnviado(ENVIO_DESARROLLO);
        RegistroArea infraestructura = registroTecnico("VALIDADO",
                ENVIO_DESARROLLO.minusDays(1), ENVIO_DESARROLLO.plusMinutes(5));

        assertFalse(InfraSistemasServiceImpl.perteneceAlCicloActual(desarrollo, infraestructura));
    }

    @Test
    void borradorPosteriorAlEnvioDeDesarrolloPerteneceAlCicloActual() {
        SolicitudValidacion desarrollo = desarrolloEnviado(ENVIO_DESARROLLO);
        RegistroArea infraestructura = registroTecnico("BORRADOR",
                null, ENVIO_DESARROLLO.plusMinutes(1));

        assertTrue(InfraSistemasServiceImpl.perteneceAlCicloActual(desarrollo, infraestructura));
    }

    @Test
    void envioTecnicoPosteriorAlDeDesarrolloConservaSuEstado() {
        SolicitudValidacion desarrollo = desarrolloEnviado(ENVIO_DESARROLLO);
        RegistroArea infraestructura = registroTecnico("VALIDADO",
                ENVIO_DESARROLLO.plusMinutes(10), ENVIO_DESARROLLO.plusHours(1));

        assertTrue(InfraSistemasServiceImpl.perteneceAlCicloActual(desarrollo, infraestructura));
    }

    private SolicitudValidacion desarrolloEnviado(LocalDateTime fecha) {
        SolicitudValidacion solicitud = new SolicitudValidacion();
        solicitud.setFechaEnvio(fecha);
        return solicitud;
    }

    private RegistroArea registroTecnico(String estado, LocalDateTime fechaEnvio,
                                         LocalDateTime fechaActualizacion) {
        RegistroArea registro = new RegistroArea();
        registro.setEstado(estado);
        registro.setFechaEnvio(fechaEnvio);
        registro.setFechaActualizacion(fechaActualizacion);
        return registro;
    }
}
