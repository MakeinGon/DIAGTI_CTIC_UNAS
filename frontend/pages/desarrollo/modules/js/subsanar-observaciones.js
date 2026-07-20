// ============================================================
// DIAGTI · CTIC UNAS — Subsanar Observaciones
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL = 'http://localhost:8080/api/desarrollador/subsanar';

// ============================================================
// OBTENER USUARIO ACTUAL
// ============================================================

function obtenerUsuarioActual() {
    return localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'desarrollador1';
}

// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../../../login/html/login.html";
    }
}

// ============================================================
// FUNCIÓN PARA CONSUMIR API
// ============================================================

async function consumirAPI(endpoint, method = 'GET', body = null, isFormData = false) {
    try {
        const options = {
            method: method,
            headers: {}
        };

        if (isFormData) {
            options.body = body;
        } else {
            options.headers['Content-Type'] = 'application/json';
            if (body) {
                options.body = JSON.stringify(body);
            }
        }

        const token = localStorage.getItem('token') || '';
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

// ============================================================
// ESTADO GLOBAL
// ============================================================

let sistemasObservados = [];
let sistemaActual = null;

// ============================================================
// CARGAR SISTEMAS OBSERVADOS DESDE EL BACKEND
// ============================================================

async function cargarSistemasObservados() {
    try {
        const container = document.getElementById('lista-observados');
        if (container) {
            container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted);">⏳ Cargando sistemas observados...</div>';
        }

        const data = await consumirAPI('/pendientes', 'GET');
        sistemasObservados = data || [];
        renderizarLista();
    } catch (error) {
        console.error('Error cargando sistemas observados:', error);
        // Fallback a datos mock
        cargarDatosMock();
    }
}

// ============================================================
// DATOS MOCK (FALLBACK)
// ============================================================

function cargarDatosMock() {
    sistemasObservados = [
        {
            id: 2,
            codigo: 'SIS002',
            nombre: 'Sistema Biblioteca',
            estado: 'OBSERVADO',
            fechaObservacion: '2026-07-05T09:15:00',
            areaUsuaria: 'Biblioteca',
            validador: 'CTIC Validador',
            cantidadObservaciones: 3,
            observacionesResumen: [
                'Debe indicar versión PostgreSQL.',
                'Debe adjuntar contrato.',
                'Debe indicar repositorio Git.'
            ]
        }
    ];
    renderizarLista();
}

// ============================================================
// RENDERIZAR LISTA DE SISTEMAS OBSERVADOS
// ============================================================

function renderizarLista() {
    const container = document.getElementById('lista-observados');
    if (!container) return;

    if (sistemasObservados.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--muted);">
                <div style="font-size:48px;margin-bottom:12px;">✅</div>
                <p style="font-weight:500;font-size:16px;">No hay sistemas con observaciones pendientes</p>
                <p style="font-size:14px;">Todos tus sistemas están al día</p>
            </div>
        `;
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Sistema</th>
                    <th>Área</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                    <th>Validador</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    sistemasObservados.forEach(s => {
        const fechaFormateada = s.fechaObservacion ? 
            new Date(s.fechaObservacion).toLocaleDateString('es-ES') : '-';

        html += `
            <tr onclick="seleccionarSistema(${s.id})" style="cursor:pointer;" id="fila-sistema-${s.id}">
                <td><strong>${s.codigo}</strong></td>
                <td>${s.nombre}</td>
                <td>${s.areaUsuaria || '-'}</td>
                <td><span class="badge status-danger">${s.estado}</span></td>
                <td>
                    <span class="badge status-warning">${s.cantidadObservaciones || 0}</span>
                    ${s.cantidadObservaciones > 0 ? '📋' : ''}
                </td>
                <td>${s.validador || '-'}</td>
                <td>
                    <button class="btn btn-verde btn-sm" onclick="event.stopPropagation(); seleccionarSistema(${s.id})">
                        ✏️ Subsanar
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// ============================================================
// SELECCIONAR SISTEMA (carga detalle desde backend)
// ============================================================

async function seleccionarSistema(id) {
    try {
        // Mostrar loading en el detalle
        const detalle = document.getElementById('detalle-subsanacion');
        detalle.classList.add('visible');
        detalle.querySelector('.card').innerHTML = '<div style="padding:40px;text-align:center;">⏳ Cargando detalles...</div>';

        const data = await consumirAPI(`/${id}`, 'GET');
        sistemaActual = data;
        
        // Buscar el sistema en la lista local
        const sistemaLocal = sistemasObservados.find(s => s.id === id);
        if (sistemaLocal) {
            sistemaActual.sistemaLocal = sistemaLocal;
        }
        
        renderizarDetalle(data);
    } catch (error) {
        console.error('Error seleccionando sistema:', error);
        alert('❌ Error al cargar los detalles del sistema');
        document.getElementById('detalle-subsanacion').classList.remove('visible');
    }
}

// ============================================================
// RENDERIZAR DETALLE DE SUBSANACIÓN
// ============================================================

function renderizarDetalle(data) {
    const detalle = document.getElementById('detalle-subsanacion');
    
    // Reconstruir el contenido del card
    detalle.innerHTML = `
        <div class="card">
            <h3 style="margin-bottom:8px;">✏️ Subsanar Observaciones</h3>
            <p style="color:var(--muted);font-size:13px;margin-bottom:12px;">
                Sistema: <strong id="sistema-nombre">${data.nombre}</strong> 
                (${data.codigo})
                <span style="margin-left:12px;" class="badge status-danger">${data.estado}</span>
            </p>

            <!-- Observaciones -->
            <div class="observaciones-box">
                <h4 style="margin-bottom:8px;color:#664d03;">📋 Observaciones de CTIC:</h4>
                <ul id="observaciones-lista">
                    ${data.observaciones && data.observaciones.length > 0 ? 
                        data.observaciones.map(o => `<li>${o.descripcion}</li>`).join('') :
                        '<li style="color:var(--muted);">No hay observaciones específicas</li>'
                    }
                </ul>
            </div>

            <!-- Pestañas para corregir -->
            <div class="tabs">
                <button class="tab-btn active" data-tab="tab-subsanar-bd" onclick="cambiarTabSubsanar('tab-subsanar-bd')">Base de Datos</button>
                <button class="tab-btn" data-tab="tab-subsanar-evidencias" onclick="cambiarTabSubsanar('tab-subsanar-evidencias')">Evidencias</button>
                <button class="tab-btn" data-tab="tab-subsanar-seguridad" onclick="cambiarTabSubsanar('tab-subsanar-seguridad')">Seguridad</button>
                <button class="tab-btn" data-tab="tab-subsanar-arquitectura" onclick="cambiarTabSubsanar('tab-subsanar-arquitectura')">Arquitectura</button>
            </div>

            <!-- Pestaña: Base de Datos -->
            <div class="tab-content active" id="tab-subsanar-bd">
                <h4 style="margin-bottom:12px;">Base de Datos</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Motor *</label>
                        <select id="subsanar-motor">
                            <option value="">Seleccionar</option>
                            <option value="PostgreSQL">PostgreSQL</option>
                            <option value="MySQL">MySQL</option>
                            <option value="SQL Server">SQL Server</option>
                            <option value="Oracle">Oracle</option>
                        </select>
                        <div class="field-hint">${data.datosSistema?.motorBaseDatos ? 'Actual: ' + data.datosSistema.motorBaseDatos : 'Debe indicar versión PostgreSQL.'}</div>
                    </div>
                    <div class="form-group">
                        <label>Versión</label>
                        <input type="text" id="subsanar-version-bd" placeholder="Ej. 15.0" value="${data.datosSistema?.versionBaseDatos || ''}">
                    </div>
                </div>
            </div>

            <!-- Pestaña: Evidencias -->
            <div class="tab-content" id="tab-subsanar-evidencias">
                <h4 style="margin-bottom:12px;">Evidencias</h4>
                <div class="form-group">
                    <label style="display:flex;align-items:center;gap:8px;font-weight:400;">
                        <input type="checkbox" id="subsanar-contrato" ${data.datosSistema?.contratoAdjunto ? 'checked' : ''}> 
                        Contrato adjunto
                    </label>
                    <div class="field-hint">${data.datosSistema?.contratoAdjunto ? '✅ Contrato ya adjunto' : 'Debe adjuntar contrato.'}</div>
                </div>
                <div class="form-group">
                    <label>Subir contrato (opcional)</label>
                    <input type="file" id="subsanar-archivo-contrato" style="padding:8px;" onchange="subirEvidenciaSubsanacion('contrato')">
                    <div id="subsanar-contrato-status"></div>
                </div>
            </div>

            <!-- Pestaña: Seguridad -->
            <div class="tab-content" id="tab-subsanar-seguridad">
                <h4 style="margin-bottom:12px;">Seguridad</h4>
                <div class="checkbox-group" id="subsanar-seguridad-checks">
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('SSL') ? 'checked' : ''}> SSL</label>
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('MFA') ? 'checked' : ''}> MFA</label>
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('Logs') ? 'checked' : ''}> Logs</label>
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('Auditoría') ? 'checked' : ''}> Auditoría</label>
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('OWASP') ? 'checked' : ''}> OWASP</label>
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('Control de acceso') ? 'checked' : ''}> Control de acceso</label>
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('Restricción IP') ? 'checked' : ''}> Restricción IP</label>
                    <label><input type="checkbox" ${data.datosSistema?.seguridadChecks?.includes('Backup') ? 'checked' : ''}> Backup</label>
                </div>
            </div>

            <!-- Pestaña: Arquitectura -->
            <div class="tab-content" id="tab-subsanar-arquitectura">
                <h4 style="margin-bottom:12px;">Arquitectura</h4>
                <div class="form-group">
                    <label>Repositorio Git *</label>
                    <input type="text" id="subsanar-repositorio" placeholder="URL del repositorio Git" value="${data.datosSistema?.repositorioGit || ''}">
                    <div class="field-hint">${data.datosSistema?.repositorioGit ? '✅ Repositorio: ' + data.datosSistema.repositorioGit : 'Debe indicar repositorio Git.'}</div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="cancelarSubsanacion()">Cancelar</button>
                <button class="btn btn-verde" onclick="guardarSubsanacion()">💾 Guardar</button>
                <button class="btn btn-azul" onclick="reenviarValidacion()">📤 Reenviar Validación</button>
            </div>
        </div>
    `;
}

// ============================================================
// CAMBIAR PESTAÑA (subsanación)
// ============================================================

function cambiarTabSubsanar(tabId) {
    document.querySelectorAll('#detalle-subsanacion .tab-content').forEach(function (c) {
        c.classList.remove('active');
    });
    document.querySelectorAll('#detalle-subsanacion .tab-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
    const btn = document.querySelector('#detalle-subsanacion .tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

// ============================================================
// SUBIR EVIDENCIA DURANTE SUBSANACIÓN
// ============================================================

async function subirEvidenciaSubsanacion(tipo) {
    const input = document.getElementById('subsanar-archivo-contrato');
    if (!input) return;
    
    const file = input.files[0];
    if (!file) {
        alert('Selecciona un archivo para ' + tipo);
        return;
    }

    if (!sistemaActual || !sistemaActual.id) {
        alert('Primero selecciona un sistema.');
        return;
    }

    try {
        const id = sistemaActual.id;
        const formData = new FormData();
        formData.append('tipo', tipo);
        formData.append('archivo', file);

        const result = await consumirAPI(`/${id}/evidencias`, 'POST', formData, true);

        if (result && result.exito) {
            alert('✅ ' + result.mensaje);
            document.getElementById('subsanar-contrato-status').innerHTML = `
                <span style="color:#059669;font-size:12px;">✅ Archivo subido: ${file.name}</span>
            `;
            // Marcar contrato como adjunto
            document.getElementById('subsanar-contrato').checked = true;
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error subiendo evidencia:', error);
        alert('❌ Error al subir la evidencia: ' + error.message);
    }
    input.value = '';
}

// ============================================================
// GUARDAR SUBSANACIÓN
// ============================================================

async function guardarSubsanacion() {
    if (!sistemaActual || !sistemaActual.id) {
        alert('Selecciona un sistema primero.');
        return;
    }

    // Recoger datos del formulario
    const motor = document.getElementById('subsanar-motor')?.value || '';
    const versionBD = document.getElementById('subsanar-version-bd')?.value || '';
    const contrato = document.getElementById('subsanar-contrato')?.checked || false;
    const repositorio = document.getElementById('subsanar-repositorio')?.value.trim() || '';

    // Validaciones básicas
    if (!motor) {
        alert('⚠️ Debes indicar el motor de base de datos.');
        return;
    }
    if (!repositorio) {
        alert('⚠️ Debes indicar el repositorio Git.');
        return;
    }

    // Recoger checks de seguridad
    const seguridadChecks = [];
    document.querySelectorAll('#subsanar-seguridad-checks input[type="checkbox"]').forEach(cb => {
        if (cb.checked) {
            seguridadChecks.push(cb.parentElement.textContent.trim());
        }
    });

    const data = {
        motorBaseDatos: motor,
        versionBaseDatos: versionBD,
        contratoAdjunto: contrato,
        repositorioGit: repositorio,
        seguridadChecks: seguridadChecks,
        comentarioGeneral: 'Observaciones subsanadas'
    };

    try {
        const result = await consumirAPI(`/${sistemaActual.id}/guardar`, 'POST', data);

        if (result && result.exito) {
            alert('✅ ' + result.mensaje);
            // Actualizar estado local
            sistemaActual.estado = 'SUBSANADO';
            
            // Volver a la lista
            document.getElementById('detalle-subsanacion').classList.remove('visible');
            sistemaActual = null;
            await cargarSistemasObservados();
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error guardando subsanación:', error);
        alert('❌ Error al guardar: ' + error.message);
    }
}

// ============================================================
// REENVIAR VALIDACIÓN
// ============================================================

async function reenviarValidacion() {
    if (!sistemaActual || !sistemaActual.id) {
        alert('Selecciona un sistema primero.');
        return;
    }

    if (sistemaActual.estado !== 'SUBSANADO') {
        alert('⚠️ Primero debes guardar las correcciones.');
        return;
    }

    if (!confirm(`¿Reenviar "${sistemaActual.nombre}" a validación?`)) return;

    try {
        const result = await consumirAPI(`/${sistemaActual.id}/reenviar`, 'POST');

        if (result && result.exito) {
            alert(`✅ ${result.mensaje || 'Sistema reenviado a validación.'}`);
            
            // Eliminar de la lista
            const index = sistemasObservados.findIndex(s => s.id === sistemaActual.id);
            if (index !== -1) sistemasObservados.splice(index, 1);
            
            document.getElementById('detalle-subsanacion').classList.remove('visible');
            sistemaActual = null;
            renderizarLista();
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error reenviando validación:', error);
        alert('❌ Error al reenviar: ' + error.message);
    }
}

// ============================================================
// CANCELAR SUBSANACIÓN
// ============================================================

function cancelarSubsanacion() {
    if (confirm('¿Cancelar la subsanación? Los cambios no guardados se perderán.')) {
        document.getElementById('detalle-subsanacion').classList.remove('visible');
        sistemaActual = null;
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    // Cargar sistemas observados desde el backend
    cargarSistemasObservados();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'subsanar-observaciones.html') {
            item.classList.add('active');
        }
    });
});