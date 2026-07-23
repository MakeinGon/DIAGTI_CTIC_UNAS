// ============================================================
// DIAGTI · CTIC UNAS — Enviar Validación
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Usar el proxy de Nginx. Así funciona igual en cualquier laptop y no depende
// de acceder directamente al puerto 8080 ni de CORS.
const API_URL = '/api/desarrollador/validaciones';

// ============================================================
// OBTENER USUARIO ACTUAL
// ============================================================

function obtenerUsuarioActual() {
    const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
    return session.username || session.nombreCompleto ||
        localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'usuario-desarrollo';
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

async function consumirAPI(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'X-Usuario': (JSON.parse(localStorage.getItem('diagti_session') || '{}').username || 'usuario-desarrollo')
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
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

let sistemasParaValidar = [];
let sistemaSeleccionado = null;

// ============================================================
// CARGAR SISTEMAS DESDE EL BACKEND
// ============================================================

async function cargarSistemasPendientes() {
    try {
        const container = document.getElementById('tabla-validacion');
        if (container) {
            container.innerHTML = '<p style="padding:16px;color:var(--muted);">⏳ Cargando sistemas...</p>';
        }

        const data = await consumirAPI('/pendientes', 'GET');
        sistemasParaValidar = data || [];
        
        if (sistemasParaValidar.length === 0) {
            const container = document.getElementById('tabla-validacion');
            if (container) {
                container.innerHTML = `
                    <div style="padding:40px;text-align:center;color:var(--muted);">
                        <div style="font-size:48px;margin-bottom:12px;">📋</div>
                        <p style="font-weight:500;font-size:18px;">No hay sistemas pendientes para validación</p>
                        <p style="font-size:14px;">Todos tus sistemas están en estado Borrador u Observado</p>
                    </div>
                `;
            }
            return;
        }

        renderizarTabla();
    } catch (error) {
        console.error('Error cargando sistemas:', error);
        const container = document.getElementById('tabla-validacion');
        if (container) {
            container.innerHTML = `
                <div style="padding:32px;text-align:center;color:#991b1b">
                    <p style="font-weight:700">No se pudo consultar el backend.</p>
                    <p style="font-size:13px">${String(error.message || error)}</p>
                </div>`;
        }
    }
}

// ============================================================
// DATOS MOCK (FALLBACK)
// ============================================================

function cargarDatosMock() {
    sistemasParaValidar = [
        { 
            id: 1, 
            codigo: 'SIS001', 
            nombre: 'Sistema Académico', 
            estado: 'BORRADOR', 
            completitud: 100, 
            area: 'Dirección Académica', 
            riesgo: 'BAJO',
            puedeEnviar: true,
            mensajeCompletitud: '✅ Sistema completo, listo para validación'
        },
        { 
            id: 2, 
            codigo: 'SIS002', 
            nombre: 'Sistema Biblioteca', 
            estado: 'BORRADOR', 
            completitud: 82, 
            area: 'Biblioteca', 
            riesgo: 'ALTO',
            puedeEnviar: false,
            mensajeCompletitud: '⚠️ Completa los campos faltantes'
        },
        { 
            id: 3, 
            codigo: 'SIS003', 
            nombre: 'Sistema Finanzas', 
            estado: 'BORRADOR', 
            completitud: 95, 
            area: 'Economía y Finanzas', 
            riesgo: 'CRITICO',
            puedeEnviar: false,
            mensajeCompletitud: '⚠️ Completa los campos faltantes'
        }
    ];
    renderizarTabla();
}

// ============================================================
// RENDERIZAR TABLA
// ============================================================

function renderizarTabla() {
    const container = document.getElementById('tabla-validacion');
    if (!container) return;

    if (sistemasParaValidar.length === 0) {
        container.innerHTML = `
            <div style="padding:40px;text-align:center;color:var(--muted);">
                <div style="font-size:48px;margin-bottom:12px;">📋</div>
                <p style="font-weight:500;font-size:18px;">No hay sistemas pendientes para validación</p>
                <p style="font-size:14px;">Todos tus sistemas están en estado Borrador u Observado</p>
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
                    <th>Estado</th>
                    <th>Completitud</th>
                    <th>Área</th>
                    <th>Riesgo</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    sistemasParaValidar.forEach(s => {
        const completitud = s.completitud || 0;
        const puedeEnviar = completitud === 100 && s.puedeEnviar !== false;
        const completitudClase = completitud === 100 ? 'status-success' :
            completitud >= 80 ? 'status-warning' : 'status-danger';
        
        const accionTexto = puedeEnviar ? '📤 Enviar' : '📝 Completar';
        const accionClase = puedeEnviar ? 'btn-verde' : 'btn-secondary';

        html += `
            <tr onclick="seleccionarSistema(${s.id})" style="cursor:pointer;" id="fila-sistema-${s.id}">
                <td><strong>${s.codigo}</strong></td>
                <td>${s.nombre}</td>
                <td><span class="badge status-secondary">${s.estado}</span></td>
                <td>
                    <span class="badge ${completitudClase}">${completitud}%</span>
                    ${completitud < 100 ? `<span style="font-size:11px;color:var(--muted);display:block;">${s.mensajeCompletitud || ''}</span>` : ''}
                </td>
                <td>${s.area || '-'}</td>
                <td>${s.riesgo || '-'}</td>
                <td>
                    <button class="btn ${accionClase} btn-sm" onclick="event.stopPropagation(); ejecutarAccion(${s.id})" ${!puedeEnviar ? 'disabled' : ''}>
                        ${accionTexto}
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

    // Ocultar resumen si no hay selección
    const resumen = document.getElementById('resumen-seleccion');
    if (resumen && !sistemaSeleccionado) {
        resumen.classList.remove('visible');
    }
}

// ============================================================
// SELECCIONAR SISTEMA (muestra resumen y resalta fila)
// ============================================================

function seleccionarSistema(id) {
    const sistema = sistemasParaValidar.find(s => s.id === id);
    if (!sistema) return;

    sistemaSeleccionado = sistema;

    // Resaltar fila seleccionada
    document.querySelectorAll('#tabla-validacion tbody tr').forEach(tr => {
        tr.classList.remove('selected-row');
    });
    const fila = document.getElementById(`fila-sistema-${id}`);
    if (fila) fila.classList.add('selected-row');

    // Mostrar resumen
    const resumen = document.getElementById('resumen-seleccion');
    if (resumen) resumen.classList.add('visible');

    // Actualizar resumen
    document.getElementById('resumen-codigo').textContent = sistema.codigo;
    document.getElementById('resumen-nombre').textContent = sistema.nombre;
    document.getElementById('resumen-area').textContent = sistema.area || 'No definida';
    document.getElementById('resumen-completitud').textContent = (sistema.completitud || 0) + '%';
    document.getElementById('resumen-riesgo').textContent = sistema.riesgo || 'No definido';

    // Actualizar botón de envío
    const btnEnviar = document.getElementById('btn-enviar-validacion');
    const puedeEnviar = (sistema.completitud || 0) === 100 && sistema.puedeEnviar !== false;
    
    if (puedeEnviar) {
        btnEnviar.textContent = '📤 Enviar Validación';
        btnEnviar.className = 'btn btn-verde';
        btnEnviar.disabled = false;
        btnEnviar.onclick = enviarValidacion;
    } else {
        btnEnviar.textContent = '📝 Ir a Completar';
        btnEnviar.className = 'btn btn-azul';
        btnEnviar.disabled = false;
        btnEnviar.onclick = function() {
            window.location.href = 'editar-sistema.html?id=' + sistema.id;
        };
    }
}

// ============================================================
// EJECUTAR ACCIÓN (Enviar o Completar)
// ============================================================

function ejecutarAccion(id) {
    const sistema = sistemasParaValidar.find(s => s.id === id);
    if (!sistema) return;

    const completitud = sistema.completitud || 0;
    const puedeEnviar = completitud === 100 && sistema.puedeEnviar !== false;

    if (puedeEnviar) {
        seleccionarSistema(id);
        enviarValidacion();
    } else {
        alert(`⚠️ El sistema "${sistema.nombre}" está al ${completitud}%. Debes completarlo primero.`);
        window.location.href = 'editar-sistema.html?id=' + sistema.id;
    }
}

// ============================================================
// ENVIAR VALIDACIÓN (desde el resumen)
// ============================================================

async function enviarValidacion() {
    if (!sistemaSeleccionado) {
        alert('Selecciona un sistema primero.');
        return;
    }

    const completitud = sistemaSeleccionado.completitud || 0;
    const puedeEnviar = completitud === 100 && sistemaSeleccionado.puedeEnviar !== false;

    if (!puedeEnviar) {
        alert(`⚠️ El sistema está al ${completitud}%. Debe estar al 100% para enviar.`);
        return;
    }

    // Confirmación con información adicional
    const confirmar = confirm(
        `¿Estás seguro de enviar "${sistemaSeleccionado.nombre}" a validación técnica?\n\n` +
        `📋 Código: ${sistemaSeleccionado.codigo}\n` +
        `🏢 Área: ${sistemaSeleccionado.area || 'No definida'}\n` +
        `📊 Completitud: ${completitud}%\n` +
        `⚠️ Riesgo: ${sistemaSeleccionado.riesgo || 'No definido'}`
    );

    if (!confirmar) return;

    try {
        // Solicitar comentario opcional
        const comentario = prompt('¿Deseas agregar un comentario para el validador? (Opcional)', 'Sistema completo, listo para validación técnica');

        const data = {
            sistemaId: sistemaSeleccionado.id,
            comentario: comentario || 'Sistema enviado a validación'
        };

        const result = await consumirAPI('/solicitar', 'POST', data);

        if (result && result.exito) {
            const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
            const solicitud = {
                    codigoSistema: sistemaSeleccionado.codigo || `DES-${sistemaSeleccionado.id}`,
                    nombreSistema: sistemaSeleccionado.nombre,
                    areaOrigen: 'DESARROLLO',
                    areaUsuaria: sistemaSeleccionado.area || 'CTIC UNAS',
                    responsable: session.nombreCompleto || obtenerUsuarioActual(),
                    usuarioOrigen: session.username || session.nombreCompleto || obtenerUsuarioActual(),
                    comentario: comentario || 'Sistema enviado a validación técnica',
                    datos: sistemaSeleccionado
                };
            if (window.DIAGTIFlujo) await window.DIAGTIFlujo.enviar(solicitud);
            else {
                const solicitudResponse = await fetch('/api/flujo-validacion/solicitudes', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(solicitud)});
                if (!solicitudResponse.ok) throw new Error(await solicitudResponse.text() || 'No se pudo registrar la solicitud compartida');
            }
            alert(`✅ ${result.mensaje || 'Sistema enviado a validación correctamente.'}`);
            
            // Ocultar resumen
            document.getElementById('resumen-seleccion').classList.remove('visible');
            sistemaSeleccionado = null;

            // Recargar lista
            await cargarSistemasPendientes();
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error enviando validación:', error);
        alert('❌ Error al enviar la validación: ' + error.message);
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    // Cargar sistemas pendientes desde el backend
    cargarSistemasPendientes();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'enviar-validacion.html') {
            item.classList.add('active');
        }
    });
});
