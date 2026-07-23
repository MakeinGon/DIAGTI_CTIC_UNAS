import { obtenerHeaders } from './api-utils.js';
import { configurarCerrarSesion } from './common.js';

/**
 * Bandeja real del Validador CTIC.
 *
 * Un sistema se muestra una sola vez, pero conserva dos revisiones
 * independientes: Validación de Desarrollo y Validación de Infraestructura.
 */
const CATALOGOS = {
    DESARROLLO: {
        'Información general': ['General', 'Código', 'Nombre', 'Descripción', 'Área usuaria',
            'Responsable funcional', 'Responsable técnico', 'Criticidad', 'Tipo de aplicativo'],
        'Información del desarrollo': ['Año de desarrollo', 'Forma de adquisición',
            'Empresa desarrolladora', 'Contrato vigente', 'Fecha de soporte', 'Observaciones'],
        'Arquitectura de software': ['Lenguaje', 'Versión lenguaje', 'Framework',
            'Versión framework', 'Arquitectura', 'Patrón', 'Repositorio Git',
            'Tecnologías complementarias'],
        'Base de datos': ['Motor', 'Versión', 'Tipo de BD', 'Servidor', 'Esquema',
            'Backup', 'Frecuencia Backup', 'Cifrado', 'Responsable BD'],
        Integraciones: ['Destino', 'Protocolo', 'Método', 'Responsable'],
        'Evidencias de software': ['Evidencia o URL']
    },
    INFRAESTRUCTURA: {
        'Infraestructura tecnológica': ['General', 'Plataforma', 'Tipo de servidor',
            'Sistema operativo', 'Versión del sistema operativo', 'IP privada',
            '¿Usa Proxmox?', '¿Cuenta con backup?', 'Frecuencia de backup', 'Observaciones'],
        'Despliegue, dominio y acceso': ['Ambiente', 'Servidor', 'Puerto',
            'Dominio o subdominio', 'Servidor web', 'Proxy reverso', 'Docker',
            'Docker Compose', 'Exposición', 'Mecanismo CI/CD'],
        Seguridad: ['SSL/TLS', 'Método de autenticación', 'MFA', 'Generación de logs',
            'Cifrado de información', 'Restricción por IP', 'Control de sesiones'],
        'Evidencias técnicas': ['Evidencia técnica']
    }
};

const observacionesEnEdicion = new Map();
let pendientes = [];

function esc(valor = '') {
    return String(valor).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[c]);
}

function datos(solicitud) {
    try { return JSON.parse(solicitud?.datosJson || '{}'); }
    catch (_) { return {}; }
}

function observaciones(solicitud) {
    try {
        const lista = JSON.parse(solicitud?.observacionesJson || '[]');
        return Array.isArray(lista) ? lista : [];
    } catch (_) {
        return solicitud?.comentarioRevision
            ? [{ responsable: solicitud.areaOrigen, seccion: 'General', campo: 'General',
                detalle: solicitud.comentarioRevision, evidenciaRequerida: false }]
            : [];
    }
}

function etiquetaEstado(estado) {
    return ({
        PENDIENTE: 'Pendiente', VALIDADO: 'Validado', OBSERVADO: 'Observado',
        RECHAZADO: 'Rechazado', SUBSANADO: 'Subsanado', CORREGIDO: 'Subsanado',
        NUEVO: 'Nuevo'
    })[String(estado || '').toUpperCase()] || estado || 'Nuevo';
}

function claseEstado(estado) {
    return ({
        PENDIENTE: 'warning', VALIDADO: 'success', OBSERVADO: 'danger',
        RECHAZADO: 'danger', SUBSANADO: 'info', CORREGIDO: 'info', NUEVO: 'info'
    })[String(estado || '').toUpperCase()] || 'info';
}

async function api(url, opciones = {}) {
    const response = await fetch(url, {
        cache: 'no-store',
        ...opciones,
        headers: { ...obtenerHeaders(), ...(opciones.headers || {}) }
    });
    if (!response.ok) throw new Error(await response.text() || `Error ${response.status}`);
    return response.status === 204 ? null : response.json();
}

function agruparSolicitudes(lista) {
    const mapa = new Map();
    lista.forEach(item => {
        const codigo = item.codigoSistema;
        if (!mapa.has(codigo)) {
            mapa.set(codigo, {
                codigo,
                nombre: item.nombreSistema,
                areaUsuaria: item.areaUsuaria,
                fecha: item.fechaEnvio,
                desarrollo: null,
                infraestructura: null
            });
        }
        const grupo = mapa.get(codigo);
        const origen = String(item.areaOrigen || '').toUpperCase();
        // El historial llega del más reciente al más antiguo. Conservamos el
        // primero de cada área para no reemplazarlo con ciclos anteriores.
        if (origen === 'DESARROLLO' && !grupo.desarrollo) grupo.desarrollo = item;
        if (origen === 'INFRAESTRUCTURA' && !grupo.infraestructura) grupo.infraestructura = item;
        if ((item.fechaEnvio || '') > (grupo.fecha || '')) grupo.fecha = item.fechaEnvio;
    });
    return [...mapa.values()];
}

function badgeSolicitud(solicitud, vacio = 'Nuevo') {
    const estado = solicitud?.estado || vacio.toUpperCase();
    return `<span class="badge ${claseEstado(estado)}">${esc(etiquetaEstado(estado))}</span>`;
}

function renderizarTabla(lista) {
    const tbody = document.getElementById('pendientes-body');
    const grupos = agruparSolicitudes(lista);
    if (!grupos.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="validator-empty">No hay sistemas pendientes.</td></tr>';
        return;
    }
    tbody.innerHTML = grupos.map(grupo => `
        <tr>
            <td><strong>${esc(grupo.nombre)}</strong><small class="system-code">${esc(grupo.codigo)}</small></td>
            <td>${esc(grupo.areaUsuaria || '--')}</td>
            <td>${badgeSolicitud(grupo.desarrollo, 'NUEVO')}</td>
            <td>${badgeSolicitud(grupo.infraestructura, grupo.desarrollo ? 'NUEVO' : 'NUEVO')}</td>
            <td>${esc(grupo.fecha ? new Date(grupo.fecha).toLocaleDateString('es-PE') : '--')}</td>
            <td><button class="btn-sm btn-verde revisar-sistema" data-code="${esc(grupo.codigo)}">Revisar</button></td>
        </tr>
    `).join('');
    tbody.querySelectorAll('.revisar-sistema').forEach(btn => {
        btn.addEventListener('click', () => abrirSistema(btn.dataset.code));
    });
}

async function cargarPendientes(mostrarMensaje = false) {
    const boton = document.getElementById('btn-actualizar');
    if (boton) boton.disabled = true;
    try {
        pendientes = await api('/api/flujo-validacion/pendientes');
        const codigosPendientes = new Set(pendientes.map(item => item.codigoSistema));
        const historial = await api('/api/flujo-validacion/historial');
        // La fila muestra los dos estados reales aunque sólo una de las áreas
        // tenga trabajo pendiente para el Validador.
        renderizarTabla(historial.filter(item => codigosPendientes.has(item.codigoSistema)));
        if (mostrarMensaje) notificar('Bandeja actualizada desde PostgreSQL.', 'success');
    } catch (error) {
        renderizarTabla([]);
        notificar('No se pudo cargar la bandeja: ' + error.message, 'error');
    } finally {
        if (boton) boton.disabled = false;
    }
}

function ultimoPorArea(historial, area) {
    return historial.find(item => String(item.areaOrigen).toUpperCase() === area) || null;
}

function camposEnviados(solicitud) {
    if (!solicitud) return '<p class="muted">Todavía no se envió información de esta área.</p>';
    const contenido = datos(solicitud);
    const planos = [];
    Object.entries(contenido).forEach(([clave, valor]) => {
        if (valor == null || valor === '' || typeof valor === 'object') return;
        planos.push(`<div class="info-row"><span class="label">${esc(clave)}</span><span class="value">${esc(valor)}</span></div>`);
    });
    if (contenido.datosFormulario && typeof contenido.datosFormulario === 'object') {
        Object.entries(contenido.datosFormulario).forEach(([clave, valor]) => {
            if (valor != null && valor !== '') {
                planos.push(`<div class="info-row"><span class="label">${esc(clave)}</span><span class="value">${esc(valor)}</span></div>`);
            }
        });
    }
    return planos.slice(0, 30).join('') || '<p class="muted">No se encontraron campos adicionales.</p>';
}

function listaObservaciones(solicitud) {
    const lista = observaciones(solicitud);
    if (!lista.length) return '';
    return `<div class="registered-observations"><strong>Observaciones registradas</strong>
        ${lista.map(obs => `<article><span>${esc(obs.seccion)} · ${esc(obs.campo)}</span>
            <p>${esc(obs.detalle)}</p>${obs.evidenciaRequerida ? '<small>Evidencia requerida</small>' : ''}</article>`).join('')}
    </div>`;
}

function bloqueArea(area, solicitud, codigo) {
    const titulo = area === 'DESARROLLO' ? 'Validación de Desarrollo' : 'Validación de Infraestructura';
    const estado = solicitud?.estado || (area === 'INFRAESTRUCTURA' ? 'NUEVO' : 'NUEVO');
    const pendiente = solicitud && estado === 'PENDIENTE';
    return `
        <section class="area-validation-card" id="area-${area}">
            <header>
                <div><h3>${titulo}</h3><small>${solicitud
                    ? `Enviado por ${esc(solicitud.responsable || solicitud.usuarioOrigen || area)}`
                    : 'Pendiente de envío por el área'}</small></div>
                ${badgeSolicitud(solicitud, 'NUEVO')}
            </header>
            <div class="area-fields">${camposEnviados(solicitud)}</div>
            ${listaObservaciones(solicitud)}
            ${pendiente ? `
                <div class="validation-actions">
                    <button class="btn btn-verde validar-area" data-id="${solicitud.id}">Validar ${area === 'DESARROLLO' ? 'Desarrollo' : 'Infraestructura'}</button>
                    <button class="btn observar-area" data-id="${solicitud.id}" data-area="${area}">Registrar observaciones</button>
                </div>
                <div class="observation-editor hidden" id="editor-${solicitud.id}">
                    <h4>Observaciones para ${area === 'DESARROLLO' ? 'Desarrollo' : 'Infraestructura'}</h4>
                    <div class="editor-grid">
                        <label>Sección<select id="seccion-${solicitud.id}"></select></label>
                        <label>Campo<select id="campo-${solicitud.id}"></select></label>
                        <label class="full">Observación<textarea id="detalle-${solicitud.id}" rows="3" placeholder="Explique claramente qué debe corregirse"></textarea></label>
                        <label class="check full"><input type="checkbox" id="evidencia-${solicitud.id}"> Requiere evidencia</label>
                    </div>
                    <button class="btn agregar-observacion" data-id="${solicitud.id}" data-area="${area}">Agregar observación</button>
                    <div id="lista-observaciones-${solicitud.id}" class="draft-observations"></div>
                    <p class="form-message" id="error-observaciones-${solicitud.id}"></p>
                    <button class="btn btn-verde enviar-observaciones" data-id="${solicitud.id}">Enviar observaciones</button>
                </div>` : ''}
        </section>`;
}

async function abrirSistema(codigo) {
    const panel = document.getElementById('panel-detalle');
    const overlay = document.getElementById('panel-overlay-detalle');
    const body = document.getElementById('panel-body-detalle');
    panel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    body.innerHTML = '<div class="loading-spinner"><span>Cargando las dos validaciones...</span></div>';
    try {
        const historial = await api(`/api/flujo-validacion/historial?codigoSistema=${encodeURIComponent(codigo)}`);
        const desarrollo = ultimoPorArea(historial, 'DESARROLLO');
        const infraestructura = ultimoPorArea(historial, 'INFRAESTRUCTURA');
        const base = desarrollo || infraestructura;
        body.innerHTML = `
            <div class="system-validation-head">
                <span class="badge info">${esc(codigo)}</span>
                <h2>${esc(base?.nombreSistema || 'Sistema')}</h2>
                <p>${esc(base?.areaUsuaria || '--')}</p>
            </div>
            ${bloqueArea('DESARROLLO', desarrollo, codigo)}
            ${bloqueArea('INFRAESTRUCTURA', infraestructura, codigo)}
        `;
        configurarAccionesPanel();
    } catch (error) {
        body.innerHTML = `<div class="info-card"><strong>No se pudo cargar el sistema.</strong><p>${esc(error.message)}</p></div>`;
    }
}

function configurarAccionesPanel() {
    document.querySelectorAll('.validar-area').forEach(btn => {
        btn.addEventListener('click', () => validarSolicitud(Number(btn.dataset.id)));
    });
    document.querySelectorAll('.observar-area').forEach(btn => {
        btn.addEventListener('click', () => abrirEditor(Number(btn.dataset.id), btn.dataset.area));
    });
    document.querySelectorAll('.agregar-observacion').forEach(btn => {
        btn.addEventListener('click', () => agregarObservacion(Number(btn.dataset.id), btn.dataset.area));
    });
    document.querySelectorAll('.enviar-observaciones').forEach(btn => {
        btn.addEventListener('click', () => enviarObservaciones(Number(btn.dataset.id)));
    });
}

function abrirEditor(id, area) {
    const editor = document.getElementById(`editor-${id}`);
    editor.classList.remove('hidden');
    observacionesEnEdicion.set(id, observacionesEnEdicion.get(id) || []);
    const seccion = document.getElementById(`seccion-${id}`);
    seccion.innerHTML = Object.keys(CATALOGOS[area]).map(nombre => `<option>${esc(nombre)}</option>`).join('');
    seccion.onchange = () => cargarCampos(id, area);
    cargarCampos(id, area);
    renderObservacionesBorrador(id);
    editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cargarCampos(id, area) {
    const seccion = document.getElementById(`seccion-${id}`).value;
    document.getElementById(`campo-${id}`).innerHTML =
        CATALOGOS[area][seccion].map(campo => `<option>${esc(campo)}</option>`).join('');
}

function agregarObservacion(id, area) {
    const seccion = document.getElementById(`seccion-${id}`).value;
    const campo = document.getElementById(`campo-${id}`).value;
    const detalle = document.getElementById(`detalle-${id}`).value.trim();
    const error = document.getElementById(`error-observaciones-${id}`);
    if (detalle.length < 5) {
        error.textContent = 'Explique la observación con al menos 5 caracteres.';
        return;
    }
    const lista = observacionesEnEdicion.get(id) || [];
    lista.push({
        responsable: area,
        seccion,
        campo,
        detalle,
        evidenciaRequerida: document.getElementById(`evidencia-${id}`).checked
    });
    observacionesEnEdicion.set(id, lista);
    document.getElementById(`detalle-${id}`).value = '';
    document.getElementById(`evidencia-${id}`).checked = false;
    error.textContent = '';
    renderObservacionesBorrador(id);
}

function renderObservacionesBorrador(id) {
    const lista = observacionesEnEdicion.get(id) || [];
    const contenedor = document.getElementById(`lista-observaciones-${id}`);
    contenedor.innerHTML = lista.length ? lista.map((obs, indice) => `
        <article><strong>${esc(obs.seccion)} · ${esc(obs.campo)}</strong>
            <p>${esc(obs.detalle)}</p>
            <button class="remove-observation" data-index="${indice}">Eliminar</button>
        </article>`).join('') : '<small>Todavía no agregó observaciones.</small>';
    contenedor.querySelectorAll('.remove-observation').forEach(btn => {
        btn.addEventListener('click', () => {
            lista.splice(Number(btn.dataset.index), 1);
            renderObservacionesBorrador(id);
        });
    });
}

async function validarSolicitud(id) {
    if (!confirm('¿Confirma que la información de esta área es correcta?')) return;
    try {
        await window.DIAGTIFlujo.revisar(id, 'VALIDADO', 'Información revisada y aprobada', []);
        notificar('Validación guardada correctamente.', 'success');
        cerrarPanelDetalle();
        await cargarPendientes();
    } catch (error) {
        notificar('No se pudo validar: ' + error.message, 'error');
    }
}

async function enviarObservaciones(id) {
    const lista = observacionesEnEdicion.get(id) || [];
    const error = document.getElementById(`error-observaciones-${id}`);
    if (!lista.length) {
        error.textContent = 'Agregue al menos una observación antes de enviar.';
        return;
    }
    try {
        const resumen = lista.map(obs => `${obs.seccion} / ${obs.campo}: ${obs.detalle}`).join(' | ');
        await window.DIAGTIFlujo.revisar(id, 'OBSERVADO', resumen, lista);
        observacionesEnEdicion.delete(id);
        notificar('Observaciones enviadas al área correspondiente.', 'success');
        cerrarPanelDetalle();
        await cargarPendientes();
    } catch (ex) {
        error.textContent = 'No se guardaron las observaciones: ' + ex.message;
    }
}

function cerrarPanelDetalle() {
    document.getElementById('panel-detalle')?.classList.remove('active');
    document.getElementById('panel-overlay-detalle')?.classList.remove('active');
    document.body.style.overflow = '';
}

function notificar(mensaje, tipo = 'info') {
    document.querySelector('.notification-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = `notification-toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPendientes();
    configurarCerrarSesion();
    document.getElementById('btn-actualizar')?.addEventListener('click', () => cargarPendientes(true));
    window.addEventListener('focus', () => cargarPendientes());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) cargarPendientes(); });
    window.setInterval(() => {
        if (!document.hidden && !document.getElementById('panel-detalle')?.classList.contains('active')) {
            cargarPendientes();
        }
    }, 15000);
});

window.cerrarPanelDetalle = cerrarPanelDetalle;
window.cerrarPanelValidacion = cerrarPanelDetalle;
