package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraDashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraDashboardService;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraModuloService;

@Service
@RequiredArgsConstructor
public class InfraDashboardServiceImpl implements InfraDashboardService {

    private final InfraestructuraModuloService infraestructuraModuloService;

    @Override
    public InfraDashboardDTO getDashboardData() {
        return infraestructuraModuloService.getDashboard();
    }
}
