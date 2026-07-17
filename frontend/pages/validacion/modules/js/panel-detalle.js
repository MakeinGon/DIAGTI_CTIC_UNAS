// panel-detalle.js

import { obtenerHeaders } from './api-utils.js';

let panelAbierto = false;

// Renombrar función para evitar conflictos
export function abrirPanelDetalleUnico(sistemaId) {
    const panel = document.getElementById('panel-detalle');
    const overlay = document.getElementById('panel-overlay-detalle');
    const body = document.getElementById('panel-body-detalle');
    
    if (!panel || !overlay || !body) {
        console.error('❌ No se encontraron elementos del panel de detalle');
        return;
    }
    
    console.log('✅ abrirPanelDetalleUnico llamado con ID:', sistemaId);
    
    // Datos de ejemplo completos
    const data = {
        id: sistemaId,
        nombre: 'Sistema Académico UNAS',
        descripcion: 'Sistema de gestión académica para la Universidad Nacional Agraria de la Selva',
        estado: 'Activo',
        ultimaRevision: '2026-07-08',
        nivelRiesgo: 'Alta',
        responsable: 'Ing. Carlos Ruiz',
        version: 'v2.5.1',
        area: 'Oficina de Registro',
        framework: 'Spring Boot 3.2',
        baseDatos: 'PostgreSQL 15',
        servidor: 'Tomcat 10',
        codigo: 'SIS-001',
        lenguaje: 'Java',
        arquitectura: 'Microservicios',
        repositorio: 'https://github.com/unas/sistema-academico',
        tipoAplicacion: 'Web',
        anioDesarrollo: '2026',
        sistemaOperativo: 'Ubuntu Server 22.04 LTS',
        versionSO: '22.04.3',
        autenticacion: 'LDAP + MFA',
        cifrado: 'AES-256',
        tipoBD: 'PostgreSQL',
        versionBD: '15.2'
    };
    
    body.innerHTML = renderizarDetalleCompleto(data);
    
    overlay.classList.add('active');
    panel.classList.add('active');
    panelAbierto = true;
    document.body.style.overflow = 'hidden';
}

export function cerrarPanelDetalleUnico() {
    const panel = document.getElementById('panel-detalle');
    const overlay = document.getElementById('panel-overlay-detalle');
    
    if (panel) panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    panelAbierto = false;
    document.body.style.overflow = '';
}

// Exponer con nombres únicos para evitar conflictos
window.abrirPanelDetalleUnico = abrirPanelDetalleUnico;
window.cerrarPanelDetalleUnico = cerrarPanelDetalleUnico;

// También mantener los nombres originales para compatibilidad
window.abrirPanelDetalle = abrirPanelDetalleUnico;
window.cerrarPanelDetalle = cerrarPanelDetalleUnico;

function renderizarDetalleCompleto(data) {
    const badgeColor = data.nivelRiesgo === 'Crítica' ? 'danger' :
                       data.nivelRiesgo === 'Alta' ? 'warning' :
                       data.nivelRiesgo === 'Medio' ? 'info' : 'success';

    return `
        <div class="panel-content">
            <!-- HERO -->
            <div class="info-card" style="border-left: 5px solid var(--color-verde-ctic);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span class="badge info"><i class="fas fa-info-circle"></i> SISTEMA</span>
                        <h2 style="margin: 8px 0 4px; font-size: 20px; color: var(--text);">${data.nombre || '--'}</h2>
                        <p style="color: var(--muted); font-size: 13px; margin: 0;">${data.descripcion || 'Información del sistema'}</p>
                        <div style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;">
                            <span class="badge ${badgeColor}">${data.nivelRiesgo || '--'}</span>
                            <span class="badge success">${data.estado || '--'}</span>
                            <span class="badge info">${data.area || '--'}</span>
                        </div>
                    </div>
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--color-verde-ctic), var(--color-verde-dark)); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                        <i class="fas fa-desktop"></i>
                    </div>
                </div>
            </div>

            <!-- ESTADÍSTICAS RÁPIDAS -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                <div class="info-card" style="padding: 12px 14px; border-left: 3px solid #16a34a;">
                    <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 600;">Código</div>
                    <div style="font-size: 18px; font-weight: 700; margin: 4px 0; color: var(--text);">${data.codigo || '--'}</div>
                </div>
                <div class="info-card" style="padding: 12px 14px; border-left: 3px solid #ca8a04;">
                    <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 600;">Responsable</div>
                    <div style="font-size: 16px; font-weight: 700; margin: 4px 0; color: var(--text);">${data.responsable || '--'}</div>
                </div>
                <div class="info-card" style="padding: 12px 14px; border-left: 3px solid #3b82f6;">
                    <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 600;">Versión</div>
                    <div style="font-size: 18px; font-weight: 700; margin: 4px 0; color: var(--text);">${data.version || '--'}</div>
                </div>
            </div>

            <!-- INFORMACIÓN DE DESARROLLO -->
            <div class="info-card" style="border-left: 4px solid #0f75bc;">
                <div class="info-card-title" style="color: #0f75bc;">
                    <i class="fas fa-code"></i> Información de Desarrollo
                    <span style="font-size: 10px; font-weight: 400; color: var(--muted); margin-left: 8px;">(Área de Desarrollo)</span>
                </div>
                <div class="info-row"><span class="label">Lenguaje</span><span class="value"><strong>${data.lenguaje || '--'}</strong></span></div>
                <div class="info-row"><span class="label">Framework</span><span class="value">${data.framework || '--'}</span></div>
                <div class="info-row"><span class="label">Arquitectura</span><span class="value">${data.arquitectura || '--'}</span></div>
                <div class="info-row"><span class="label">Tipo de Aplicación</span><span class="value">${data.tipoAplicacion || '--'}</span></div>
                <div class="info-row"><span class="label">Año de Desarrollo</span><span class="value">${data.anioDesarrollo || '--'}</span></div>
                <div class="info-row"><span class="label">Repositorio</span><span class="value"><a href="${data.repositorio || '#'}" target="_blank" style="color: var(--color-azul-ctic);">${data.repositorio || '--'}</a></span></div>
            </div>

            <!-- INFORMACIÓN DE INFRAESTRUCTURA -->
            <div class="info-card" style="border-left: 4px solid #8B5CF6;">
                <div class="info-card-title" style="color: #8B5CF6;">
                    <i class="fas fa-server"></i> Información de Infraestructura
                    <span style="font-size: 10px; font-weight: 400; color: var(--muted); margin-left: 8px;">(Área de Infraestructura)</span>
                </div>
                <div class="info-row"><span class="label">Sistema Operativo</span><span class="value">${data.sistemaOperativo || '--'}</span></div>
                <div class="info-row"><span class="label">Versión de SO</span><span class="value">${data.versionSO || '--'}</span></div>
                <div class="info-row"><span class="label">Autenticación</span><span class="value">${data.autenticacion || '--'}</span></div>
                <div class="info-row"><span class="label">Cifrado</span><span class="value">${data.cifrado || '--'}</span></div>
                <div class="info-row"><span class="label">Base de Datos</span><span class="value">${data.tipoBD || '--'}</span></div>
                <div class="info-row"><span class="label">Versión de BD</span><span class="value">${data.versionBD || '--'}</span></div>
                <div class="info-row"><span class="label">Servidor</span><span class="value">${data.servidor || '--'}</span></div>
            </div>

            <!-- EVIDENCIAS -->
            <div class="info-card">
                <div class="info-card-title"><i class="fas fa-file"></i> Evidencias Obligatorias <span style="font-size: 10px; font-weight: 400; color: var(--muted); margin-left: 8px;">(RF-15)</span></div>
                <div class="evidencia-item"><span class="evidencia-nombre"><i class="fas fa-file-pdf"></i> Manual Técnico</span><span class="badge success">✅ Cargado</span></div>
                <div class="evidencia-item"><span class="evidencia-nombre"><i class="fas fa-file-exclamation"></i> Certificado SSL</span><span class="badge danger">❌ Faltante</span></div>
                <div class="evidencia-item"><span class="evidencia-nombre"><i class="fas fa-file-exclamation"></i> Documentación de API</span><span class="badge warning">⏳ Pendiente</span></div>
            </div>

            <!-- HISTORIAL -->
            <div class="info-card">
                <div class="info-card-title"><i class="fas fa-history"></i> Historial de Validaciones <span style="font-size: 10px; font-weight: 400; color: var(--muted); margin-left: 8px;">(RNF-19)</span></div>
                <div class="historial-item"><span class="fecha">2026-07-05</span><span class="badge warning">Observado</span><span class="comentario">Faltan evidencias de pruebas</span><span class="validador">👤 Validador CTIC</span></div>
                <div class="historial-item"><span class="fecha">2026-07-03</span><span class="badge success">Aprobado</span><span class="comentario">Documentación completa y correcta</span><span class="validador">👤 Validador CTIC</span></div>
                <div class="historial-item"><span class="fecha">2026-07-01</span><span class="badge info">Enviado</span><span class="comentario">Sistema enviado para validación</span><span class="validador">👤 Sistema</span></div>
            </div>

            <!-- ACCIONES -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px;">
                <button onclick="window.location.href='validar-desarrollo.html?id=${data.id}'" class="btn btn-verde" style="justify-content: center; background: #0f75bc; color: white; padding: 10px 16px; border: none; border-radius: 4px; font-weight: 700; font-size: 12px; cursor: pointer;">
                    <i class="fas fa-check-circle"></i> Validar
                </button>
                <button onclick="window.location.href='registrar-observacion.html?id=${data.id}&area=desarrollo'" class="btn btn-observar" style="justify-content: center; background: #fef3c7; color: #92400e; border: 1px solid #fef3c7; padding: 10px 16px; border-radius: 4px; font-weight: 700; font-size: 12px; cursor: pointer;">
                    <i class="fas fa-pen"></i> Observar
                </button>
            </div>
            <button onclick="cerrarPanelDetalleUnico()" class="btn btn-verde" style="width: 100%; justify-content: center; background: #0f75bc; color: white; padding: 10px 16px; border: none; border-radius: 4px; font-weight: 700; font-size: 12px; cursor: pointer; margin-top: 10px;">
                <i class="fas fa-times"></i> Cerrar Detalle
            </button>
        </div>
    `;
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && panelAbierto) {
        cerrarPanelDetalleUnico();
    }
});

console.log('✅ panel-detalle.js VERSIÓN RENOMBRADA cargada');