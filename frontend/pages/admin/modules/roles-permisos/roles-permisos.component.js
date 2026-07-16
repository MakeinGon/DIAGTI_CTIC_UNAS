// ============================================================
// CONFIGURACIÓN API
// ============================================================
const API_BASE = 'http://localhost:8080/api/admin';

// Lista de módulos que aparecerán en la matriz (debe coincidir con backend)
const MODULOS = [
    'Dashboard ejecutivo',
    'Inventario de sistemas',
    'Registro de sistemas',
    'Validación técnica',
    'Evidencias técnicas',
    'Auditoría y trazabilidad',
    'Reportes',
    'Usuarios y roles',
    'Catálogos'
];

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function manejarError(res) {
    if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || 'Error en la petición'); });
    }
    return res.json();
}

function abrirModal(id) { document.getElementById(id).classList.add('open'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(ov) {
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.classList.remove('open'); });
});

// ============================================================
// CERRAR SESIÓN
// ============================================================
function cerrarSesion() {
    document.getElementById('logout-confirm-overlay').classList.add('open');
}
function cancelarCerrarSesion() {
    document.getElementById('logout-confirm-overlay').classList.remove('open');
}
function confirmarCerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../../login/html/login.html";
}
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
});

// ============================================================
// CONFIRMACIÓN GENÉRICA
// ============================================================
let accionConfirmada = null;
function pedirConfirmacion(mensaje, callback, textoBoton) {
    document.getElementById('confirmar-mensaje').textContent = mensaje;
    document.getElementById('confirmar-btn-aceptar').textContent = textoBoton || 'Eliminar';
    accionConfirmada = callback;
    abrirModal('modal-confirmar');
}
document.getElementById('confirmar-btn-aceptar').addEventListener('click', function() {
    if (typeof accionConfirmada === 'function') { accionConfirmada(); }
    accionConfirmada = null;
    cerrarModal('modal-confirmar');
});

// ============================================================
// MENSAJES DE ERROR
// ============================================================
function mostrarErrorFormulario(id, mensaje) {
    const el = document.getElementById(id);
    if (el) { el.textContent = mensaje; el.style.display = 'block'; }
}
function ocultarErrorFormulario(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; }
}

// ============================================================
// CARGAR LISTA DE ROLES
// ============================================================
function cargarRoles() {
    fetch(`${API_BASE}/roles`)
        .then(res => manejarError(res))
        .then(data => {
            const lista = document.getElementById('lista-roles');
            lista.innerHTML = '';
            data.forEach(rol => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.setAttribute('data-role', rol.id);
                div.onclick = function() { mostrarRol(rol.id, this); };
                div.innerHTML = `
                    <div><div class="n">${rol.nombre}</div><div class="c">${rol.descripcion || ''}</div></div>
                    <span class="count-pill">${rol.cantidadUsuarios || 0}</span>
                `;
                lista.appendChild(div);
            });
            // Seleccionar el primer rol si existe
            if (data.length > 0) {
                const primero = lista.querySelector('.list-item');
                if (primero) {
                    mostrarRol(data[0].id, primero);
                }
            } else {
                mostrarEstadoVacio();
            }
            actualizarContadorRoles();
        })
        .catch(err => {
            // No bloquear la pantalla: dejar el tab vacío y listo para crear roles,
            // igual que hace Catálogos cuando no hay datos o falla la carga.
            console.error('Error cargando roles:', err);
            const lista = document.getElementById('lista-roles');
            if (lista) lista.innerHTML = '';
            mostrarEstadoVacio();
            actualizarContadorRoles();
        });
}

// ============================================================
// ESTADO VACÍO DEL PANEL (sin roles o carga fallida)
// ============================================================
function mostrarEstadoVacio() {
    rolActualId = null;
    document.getElementById('panel-roles').innerHTML =
        '<p class="empty">No hay roles registrados. Crea uno nuevo con el botón "+ Nuevo rol".</p>';
}

// ============================================================
// MOSTRAR ROL Y SUS PERMISOS
// ============================================================
let rolActualId = null;

function mostrarRol(rolId, el) {
    // Guardar el ID del rol actual
    rolActualId = rolId;

    // Cambiar clase activa en la lista
    document.querySelectorAll('#lista-roles .list-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');

    // Cargar permisos del rol
    fetch(`${API_BASE}/permisos/${rolId}`)
        .then(res => manejarError(res))
        .then(permisos => {
            const panel = document.getElementById('panel-roles');
            panel.innerHTML = generarVistaRol(rolId, permisos);
        })
        .catch(err => {
            // Si el rol aún no tiene permisos guardados (o falla la carga),
            // mostramos la matriz completa en blanco: el usuario puede marcar
            // casillas y "Guardar cambios" la crea desde cero.
            console.error('Error cargando permisos:', err);
            const panel = document.getElementById('panel-roles');
            panel.innerHTML = generarVistaRol(rolId, []);
        });
}

// ============================================================
// GENERAR VISTA DE MATRIZ DE PERMISOS
// ============================================================
function generarVistaRol(rolId, permisos) {
    // Crear un mapa de módulo -> permisos para acceso rápido
    const permisosMap = {};
    permisos.forEach(p => {
        permisosMap[p.modulo] = p;
    });

    let html = `
        <div class="role-header">
            <div>
                <h3 id="rol-nombre-display">Cargando...</h3>
                <p id="rol-desc-display">Cargando...</p>
            </div>
            <div class="role-actions">
                <button class="btn ghost sm" onclick="editarRol()">Editar rol</button>
                <button class="btn btn-verde sm" onclick="guardarPermisos()">Guardar cambios</button>
                <button class="btn danger sm" onclick="eliminarRol()">Eliminar rol</button>
            </div>
        </div>
        <div class="matrix-wrap">
            <table class="matrix">
                <thead>
                    <tr><th>Módulo</th><th>Ver</th><th>Crear</th><th>Editar</th><th>Eliminar</th><th>Validar</th><th>Exportar</th></tr>
                </thead>
                <tbody>
    `;

    MODULOS.forEach(modulo => {
        const p = permisosMap[modulo] || { ver: false, crear: false, editar: false, eliminar: false, validar: false, exportar: false };
        html += `
            <tr>
                <td>${modulo}</td>
                <td><span class="perm-box ${p.ver ? 'on' : ''}" data-modulo="${modulo}" data-accion="ver"></span></td>
                <td><span class="perm-box ${p.crear ? 'on' : ''}" data-modulo="${modulo}" data-accion="crear"></span></td>
                <td><span class="perm-box ${p.editar ? 'on' : ''}" data-modulo="${modulo}" data-accion="editar"></span></td>
                <td><span class="perm-box ${p.eliminar ? 'on' : ''}" data-modulo="${modulo}" data-accion="eliminar"></span></td>
                <td><span class="perm-box ${p.validar ? 'on' : ''}" data-modulo="${modulo}" data-accion="validar"></span></td>
                <td><span class="perm-box ${p.exportar ? 'on' : ''}" data-modulo="${modulo}" data-accion="exportar"></span></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        <p class="field-hint" style="margin-top:12px">Haz clic en las casillas para activar/desactivar permisos. Luego presiona "Guardar cambios".</p>
    `;

    // También actualizar el nombre y descripción del rol (necesitamos obtenerlos de la lista)
    const itemSeleccionado = document.querySelector('.list-item.active');
    if (itemSeleccionado) {
        const nombre = itemSeleccionado.querySelector('.n')?.textContent || '';
        const desc = itemSeleccionado.querySelector('.c')?.textContent || '';
        // Insertar en el html temporal, pero mejor actualizar después de renderizar
        setTimeout(() => {
            const nombreDisplay = document.getElementById('rol-nombre-display');
            const descDisplay = document.getElementById('rol-desc-display');
            if (nombreDisplay) nombreDisplay.textContent = nombre;
            if (descDisplay) descDisplay.textContent = desc;
        }, 50);
    }

    return html;
}

// ============================================================
// TOGGLE DE CASILLAS DE PERMISOS (delegado)
// ============================================================
document.addEventListener('click', function(e) {
    const box = e.target.closest('.perm-box');
    if (box) {
        box.classList.toggle('on');
    }
});

// ============================================================
// GUARDAR PERMISOS DEL ROL ACTUAL
// ============================================================
function guardarPermisos() {
    if (!rolActualId) {
        alert('No hay un rol seleccionado.');
        return;
    }

    // Recopilar permisos de la matriz
    const filas = document.querySelectorAll('#panel-roles table.matrix tbody tr');
    const permisos = [];
    filas.forEach(tr => {
        const modulo = tr.cells[0].textContent;
        const celdas = tr.querySelectorAll('.perm-box');
        const ver = celdas[0].classList.contains('on');
        const crear = celdas[1].classList.contains('on');
        const editar = celdas[2].classList.contains('on');
        const eliminar = celdas[3].classList.contains('on');
        const validar = celdas[4].classList.contains('on');
        const exportar = celdas[5].classList.contains('on');
        permisos.push({ modulo, ver, crear, editar, eliminar, validar, exportar });
    });

    // Enviar al backend
    fetch(`${API_BASE}/permisos/${rolActualId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permisos)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al guardar permisos');
        // El backend responde 204 No Content: no hay body que parsear.
        return null;
    })
    .then(() => {
        // Feedback visual
        const btn = document.querySelector('.role-actions .btn-verde');
        if (btn) {
            const original = btn.textContent;
            btn.textContent = '✓ Guardado';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
            }, 1500);
        }
    })
    .catch(err => {
        alert('Error al guardar: ' + err.message);
    });
}

// ============================================================
// CRUD DE ROLES
// ============================================================
let rolEditandoId = null;

function abrirNuevoRol() {
    rolEditandoId = null;
    document.getElementById('rol-modal-titulo').textContent = 'Nuevo rol';
    document.getElementById('rol-btn-guardar').textContent = 'Crear rol';
    document.getElementById('input-rol-nombre').value = '';
    document.getElementById('textarea-rol-desc').value = '';
    document.getElementById('select-rol-base').style.display = 'none';
    document.getElementById('select-rol-base').previousElementSibling.style.display = 'none';
    ocultarErrorFormulario('rol-form-error');
    abrirModal('modal-rol');
}

function editarRol() {
    if (!rolActualId) {
        alert('No hay un rol seleccionado.');
        return;
    }
    rolEditandoId = rolActualId;
    const item = document.querySelector(`.list-item[data-role="${rolActualId}"]`);
    if (!item) {
        alert('No se encontró el rol en la lista.');
        return;
    }
    const nombre = item.querySelector('.n')?.textContent || '';
    const desc = item.querySelector('.c')?.textContent || '';
    document.getElementById('rol-modal-titulo').textContent = 'Editar rol';
    document.getElementById('rol-btn-guardar').textContent = 'Guardar cambios';
    document.getElementById('input-rol-nombre').value = nombre;
    document.getElementById('textarea-rol-desc').value = desc;
    document.getElementById('select-rol-base').style.display = 'none';
    document.getElementById('select-rol-base').previousElementSibling.style.display = 'none';
    ocultarErrorFormulario('rol-form-error');
    abrirModal('modal-rol');
}

function guardarRol() {
    const nombre = document.getElementById('input-rol-nombre').value.trim();
    const descripcion = document.getElementById('textarea-rol-desc').value.trim();
    const estado = 'Activo'; // Por defecto, podrías agregar un campo en el modal

    if (!nombre) {
        mostrarErrorFormulario('rol-form-error', 'El nombre del rol es obligatorio.');
        return;
    }

    const payload = { nombre, descripcion, estado };

    const method = rolEditandoId ? 'PUT' : 'POST';
    const url = rolEditandoId ? `${API_BASE}/roles/${rolEditandoId}` : `${API_BASE}/roles`;

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => manejarError(res))
    .then(data => {
        cerrarModal('modal-rol');
        // Recargar lista de roles
        cargarRoles();
        // Si se creó un nuevo rol, seleccionarlo automáticamente
        if (!rolEditandoId) {
            setTimeout(() => {
                const items = document.querySelectorAll('#lista-roles .list-item');
                const ultimo = items[items.length - 1];
                if (ultimo) {
                    const id = ultimo.getAttribute('data-role');
                    mostrarRol(parseInt(id), ultimo);
                }
            }, 200);
        } else {
            // Si se editó, refrescar la vista del rol actual
            const item = document.querySelector(`.list-item[data-role="${rolEditandoId}"]`);
            if (item) {
                mostrarRol(rolEditandoId, item);
            }
        }
    })
    .catch(err => {
        mostrarErrorFormulario('rol-form-error', err.message || 'Error al guardar rol');
    });
}

function eliminarRol() {
    if (!rolActualId) {
        alert('No hay un rol seleccionado.');
        return;
    }
    const item = document.querySelector(`.list-item[data-role="${rolActualId}"]`);
    const nombre = item ? item.querySelector('.n')?.textContent : 'este rol';

    pedirConfirmacion(
        `¿Eliminar el rol "${nombre}"? Los usuarios con este rol quedarán sin asignación.`,
        function() {
            fetch(`${API_BASE}/roles/${rolActualId}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) {
                        return res.json()
                            .then(err => { throw new Error(err.message || 'Error al eliminar rol'); })
                            .catch(() => { throw new Error('Error al eliminar rol'); });
                    }
                    // Recargar lista
                    cargarRoles();
                    actualizarStatUsuariosConRol();
                    // Limpiar panel
                    document.getElementById('panel-roles').innerHTML = '<p class="empty">Selecciona un rol para ver sus permisos.</p>';
                    rolActualId = null;
                })
                .catch(err => alert('Error al eliminar: ' + err.message));
        }
    );
}

// ============================================================
// CONTADOR DE ROLES (estadísticas)
// ============================================================
function actualizarContadorRoles() {
    const total = document.querySelectorAll('#lista-roles .list-item').length;
    document.getElementById('stat-total-roles').textContent = total;
}

// ============================================================
// MÓDULOS CONTROLADOS: se toma de la misma lista MODULOS que
// arma la matriz de permisos, en vez de un número fijo aparte
// que se podía desincronizar si algún día cambia la lista.
// ============================================================
function actualizarStatModulosControlados() {
    const el = document.getElementById('stat-modulos-controlados');
    if (el) el.textContent = MODULOS.length;
}

// ============================================================
// USUARIOS CON ROL ASIGNADO: cuenta, contra el backend, cuántos
// usuarios tienen actualmente un rol asignado (rolId != null).
// Un usuario puede quedar sin rol si el rol que tenía fue borrado.
// ============================================================
function actualizarStatUsuariosConRol() {
    fetch(`${API_BASE}/usuarios`)
        .then(res => manejarError(res))
        .then(usuarios => {
            const total = usuarios.length;
            const conRol = usuarios.filter(u => u.rolId != null).length;
            const porcentaje = total > 0 ? Math.round((conRol / total) * 100) : 0;

            document.getElementById('stat-usuarios-con-rol').textContent = conRol;
            const badge = document.getElementById('badge-usuarios-cubierto');
            if (badge) badge.textContent = porcentaje + '% cubierto';
        })
        .catch(err => {
            // Si falla, se deja en 0 en vez de mostrar un numero inventado.
            console.error('Error calculando usuarios con rol asignado:', err);
            document.getElementById('stat-usuarios-con-rol').textContent = '0';
            const badge = document.getElementById('badge-usuarios-cubierto');
            if (badge) badge.textContent = '0% cubierto';
        });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    cargarRoles();
    actualizarStatModulosControlados();
    actualizarStatUsuariosConRol();
});