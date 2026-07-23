// DIAGTI · Subsanación estructurada del Área de Desarrollo.
let sistemasObservados = [];
let sistemaActual = null;

function sesion() { return window.DIAGTIFlujo.sesion(); }
function esc(valor = '') {
    return String(valor).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[c]);
}
function parsearObservaciones(solicitud) {
    try {
        const lista = JSON.parse(solicitud.observacionesJson || '[]');
        if (Array.isArray(lista) && lista.length) return lista;
    } catch (_) {}
    return [{
        responsable: 'DESARROLLO', seccion: 'Información general', campo: 'General',
        detalle: solicitud.comentarioRevision || 'Revise la información enviada.',
        evidenciaRequerida: false
    }];
}
function esPropietario(registro) {
    const usuario = sesion().username;
    return !registro?.usuarioOrigen || !usuario ||
        String(registro.usuarioOrigen).toLowerCase() === String(usuario).toLowerCase();
}

async function cargarSistemasObservados() {
    const contenedor = document.getElementById('lista-observados');
    contenedor.innerHTML = '<div class="loading-area">Cargando observaciones del área...</div>';
    try {
        const [solicitudes, registros] = await Promise.all([
            window.DIAGTIFlujo.listarPorOrigen('DESARROLLO'),
            window.DIAGTIFlujo.listarRegistros('DESARROLLO')
        ]);
        const porCodigo = new Map(registros.map(r => [String(r.codigoSistema).toUpperCase(), r]));
        sistemasObservados = solicitudes
            .filter(s => ['OBSERVADO', 'RECHAZADO'].includes(String(s.estado).toUpperCase()))
            .map(s => {
                const registro = porCodigo.get(String(s.codigoSistema).toUpperCase());
                const subsanado = ['SUBSANADO', 'CORREGIDO'].includes(String(registro?.estado).toUpperCase());
                return {
                    id: s.id,
                    codigo: s.codigoSistema,
                    nombre: s.nombreSistema,
                    areaUsuaria: s.areaUsuaria,
                    estado: subsanado ? 'SUBSANADO' : s.estado,
                    fechaObservacion: s.fechaRevision,
                    validador: s.revisadoPor || 'Validador CTIC',
                    observaciones: parsearObservaciones(s),
                    datosSistema: registro?.datos || window.DIAGTIFlujo.datos(s),
                    registro,
                    puedeEditar: esPropietario(registro)
                };
            });
        renderizarLista();
        if (sistemaActual) {
            sistemaActual = sistemasObservados.find(s => s.id === sistemaActual.id) || null;
            if (sistemaActual) renderizarDetalle(sistemaActual);
        }
    } catch (error) {
        sistemasObservados = [];
        contenedor.innerHTML = `<div class="loading-area error">No se pudieron cargar las observaciones: ${esc(error.message)}</div>`;
    }
}

function renderizarLista() {
    const contenedor = document.getElementById('lista-observados');
    if (!sistemasObservados.length) {
        contenedor.innerHTML = '<div class="empty-area"><strong>No hay observaciones pendientes.</strong><span>La información de Desarrollo está al día.</span></div>';
        return;
    }
    contenedor.innerHTML = `<table><thead><tr>
        <th>Código</th><th>Sistema</th><th>Estado</th><th>Responsable</th><th>Observaciones</th><th>Acción</th>
    </tr></thead><tbody>${sistemasObservados.map(s => `<tr>
        <td><strong>${esc(s.codigo)}</strong></td><td>${esc(s.nombre)}</td>
        <td><span class="badge ${s.estado === 'SUBSANADO' ? 'status-success' : 'status-danger'}">${esc(s.estado)}</span></td>
        <td>${esc(s.registro?.responsable || s.registro?.usuarioOrigen || 'Área de Desarrollo')}</td>
        <td><span class="badge status-warning">${s.observaciones.length}</span></td>
        <td><button class="btn btn-verde btn-sm abrir-subsanacion" data-id="${s.id}">${s.puedeEditar ? (s.estado === 'SUBSANADO' ? 'Revisar' : 'Subsanar') : 'Ver'}</button></td>
    </tr>`).join('')}</tbody></table>`;
    contenedor.querySelectorAll('.abrir-subsanacion').forEach(btn => {
        btn.onclick = () => seleccionarSistema(Number(btn.dataset.id));
    });
}

function valorActual(datos, campo) {
    const formulario = datos?.datosFormulario || {};
    const equivalencias = {
        'Repositorio Git': ['Repositorio Git', 'repositorio', 'repositorioGit'],
        Motor: ['Motor', 'motor_bd', 'motorBaseDatos'],
        Versión: ['Versión', 'version_bd', 'versionBaseDatos'],
        'Evidencia o URL': ['Evidencia o URL', 'evidencias', 'urls']
    };
    const claves = equivalencias[campo] || [campo];
    for (const clave of claves) {
        const valor = formulario[clave] ?? datos?.[clave];
        if (Array.isArray(valor)) return valor.map(v => v.nombre || v.url || String(v)).join(', ');
        if (valor != null && valor !== '') return String(valor);
    }
    return '';
}

function seleccionarSistema(id) {
    sistemaActual = sistemasObservados.find(s => s.id === id);
    if (sistemaActual) renderizarDetalle(sistemaActual);
}

function renderizarDetalle(sistema) {
    const detalle = document.getElementById('detalle-subsanacion');
    detalle.classList.add('visible');
    detalle.innerHTML = `<div class="card correction-card">
        <header class="correction-head"><div><h3>Corrección de Desarrollo</h3>
            <p>${esc(sistema.codigo)} · <strong>${esc(sistema.nombre)}</strong></p></div>
            <span class="badge ${sistema.estado === 'SUBSANADO' ? 'status-success' : 'status-danger'}">${esc(sistema.estado)}</span>
        </header>
        <div class="observaciones-box">
            <h4>Observaciones del Validador CTIC</h4>
            ${sistema.observaciones.map((obs, indice) => `
                <article class="correction-item" data-index="${indice}">
                    <div class="observation-title"><strong>${esc(obs.seccion)}</strong><span>${esc(obs.campo)}</span></div>
                    <p>${esc(obs.detalle)}</p>
                    <label>Dato corregido <span class="required">*</span>
                        <textarea class="valor-corregido" rows="2" ${sistema.puedeEditar && sistema.estado !== 'SUBSANADO' ? '' : 'disabled'}>${esc(valorActual(sistema.datosSistema, obs.campo))}</textarea>
                    </label>
                    <label>Respuesta al validador <span class="required">*</span>
                        <textarea class="respuesta-correccion" rows="2" ${sistema.puedeEditar && sistema.estado !== 'SUBSANADO' ? '' : 'disabled'}
                            placeholder="Explique qué se corrigió">${esc(sistema.datosSistema?.subsanacion?.respuestas?.[indice]?.respuesta || '')}</textarea>
                    </label>
                    ${obs.evidenciaRequerida ? `<label>Evidencia o URL requerida <span class="required">*</span>
                        <input class="evidencia-correccion" ${sistema.puedeEditar && sistema.estado !== 'SUBSANADO' ? '' : 'disabled'}
                            value="${esc(sistema.datosSistema?.subsanacion?.respuestas?.[indice]?.evidencia || '')}" placeholder="Nombre del archivo o https://...">
                    </label>` : ''}
                </article>`).join('')}
        </div>
        <div id="faltantesSubsanacion" class="missing-list"></div>
        <div class="form-actions">
            <button class="btn btn-secondary" id="cancelarSubsanacion">Cerrar</button>
            ${sistema.puedeEditar && sistema.estado !== 'SUBSANADO'
                ? '<button class="btn btn-verde" id="marcarCorregido">Marcar como corregido</button>' : ''}
            ${sistema.puedeEditar && sistema.estado === 'SUBSANADO'
                ? '<button class="btn btn-azul" id="reenviarValidacion">Reenviar a validación</button>' : ''}
        </div>
    </div>`;
    document.getElementById('cancelarSubsanacion').onclick = () => {
        detalle.classList.remove('visible'); sistemaActual = null;
    };
    document.getElementById('marcarCorregido')?.addEventListener('click', marcarComoCorregido);
    document.getElementById('reenviarValidacion')?.addEventListener('click', reenviarValidacion);
    detalle.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function recogerCorrecciones() {
    const respuestas = [];
    const faltantes = [];
    document.querySelectorAll('.correction-item').forEach((item, indice) => {
        const observacion = sistemaActual.observaciones[indice];
        const valor = item.querySelector('.valor-corregido')?.value.trim() || '';
        const respuesta = item.querySelector('.respuesta-correccion')?.value.trim() || '';
        const evidencia = item.querySelector('.evidencia-correccion')?.value.trim() || '';
        if (!valor) faltantes.push(`${observacion.seccion} → ${observacion.campo}: dato corregido`);
        if (!respuesta) faltantes.push(`${observacion.seccion} → ${observacion.campo}: respuesta al validador`);
        if (observacion.evidenciaRequerida && !evidencia) {
            faltantes.push(`${observacion.seccion} → ${observacion.campo}: evidencia requerida`);
        }
        respuestas.push({ seccion: observacion.seccion, campo: observacion.campo, valor, respuesta, evidencia });
    });
    return { respuestas, faltantes };
}

async function marcarComoCorregido() {
    const { respuestas, faltantes } = recogerCorrecciones();
    const mensaje = document.getElementById('faltantesSubsanacion');
    if (faltantes.length) {
        mensaje.innerHTML = `<strong>No se puede marcar como corregido. Falta completar:</strong><ul>${faltantes.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`;
        return;
    }
    const datosFormulario = { ...(sistemaActual.datosSistema?.datosFormulario || {}) };
    respuestas.forEach(r => { datosFormulario[r.campo] = r.valor; });
    const datos = {
        ...(sistemaActual.datosSistema || {}),
        datosFormulario,
        subsanacion: { estado: 'SUBSANADO', fecha: new Date().toISOString(), respuestas }
    };
    try {
        await window.DIAGTIFlujo.guardarCorreccion({
            codigoSistema: sistemaActual.codigo,
            nombreSistema: sistemaActual.nombre,
            areaOrigen: 'DESARROLLO',
            areaUsuaria: sistemaActual.areaUsuaria || 'CTIC UNAS',
            responsable: sesion().nombreCompleto || sesion().username || 'Área de Desarrollo',
            comentario: 'Observaciones de Desarrollo subsanadas',
            datos
        });
        sistemaActual.datosSistema = datos;
        sistemaActual.estado = 'SUBSANADO';
        renderizarDetalle(sistemaActual);
    } catch (error) {
        mensaje.textContent = 'No se pudo guardar la corrección: ' + error.message;
    }
}

async function reenviarValidacion() {
    if (!confirm(`¿Reenviar "${sistemaActual.nombre}" al Validador CTIC?`)) return;
    try {
        await window.DIAGTIFlujo.enviar({
            codigoSistema: sistemaActual.codigo,
            nombreSistema: sistemaActual.nombre,
            areaOrigen: 'DESARROLLO',
            areaUsuaria: sistemaActual.areaUsuaria || 'CTIC UNAS',
            responsable: sesion().nombreCompleto || sesion().username || 'Área de Desarrollo',
            comentario: 'Información de Desarrollo subsanada y reenviada',
            datos: sistemaActual.datosSistema || {}
        });
        document.getElementById('detalle-subsanacion').classList.remove('visible');
        sistemaActual = null;
        await cargarSistemasObservados();
    } catch (error) {
        document.getElementById('faltantesSubsanacion').textContent = 'No se pudo reenviar: ' + error.message;
    }
}

function cerrarSesion() {
    localStorage.clear(); sessionStorage.clear();
    location.href = '../../../login/html/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSistemasObservados();
    document.getElementById('btn-actualizar').onclick = cargarSistemasObservados;
    window.addEventListener('focus', cargarSistemasObservados);
    window.setInterval(() => { if (!document.hidden && !sistemaActual) cargarSistemasObservados(); }, 15000);
});
