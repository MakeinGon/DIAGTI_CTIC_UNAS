// ============================================================
// CONFIGURACIÓN API
// ============================================================
const API_BASE = 'http://localhost:8080/api/admin';

// Colores de badge por nombre de rol (roles conocidos de fábrica).
// Si el admin crea un rol nuevo desde "Roles y permisos", se usa 'gray'.
const BADGE_POR_ROL = {
    'Administrador CTIC': 'crit',
    'Área de Desarrollo': 'brand',
    'Área de Infraestructura': 'med',
    'Responsable Funcional': 'info',
    'Validador Técnico': 'high',
    'Auditor': 'gray',
    'Directivo': 'crit'
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function manejarError(res) {
    if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || 'Error en la petición'); });
    }
    if (res.status === 204) return null;
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
// MENSAJES DE ERROR DE FORMULARIO
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
// ROLES: se cargan del backend para llenar los selects
// (filtro-rol, select-usuario-rol) con los roles reales creados
// en la pestaña "Roles y permisos", en vez de una lista fija.
// ============================================================
let rolesDisponibles = []; // [{id, nombre}, ...]

function cargarRolesParaSelects() {
    return fetch(`${API_BASE}/roles`)
        .then(res => manejarError(res))
        .then(data => {
            rolesDisponibles = (data || []).map(r => ({ id: r.id, nombre: r.nombre }));
            llenarSelectRoles(document.getElementById('filtro-rol'), true);
            llenarSelectRoles(document.getElementById('select-usuario-rol'), false);
        })
        .catch(err => {
            // Si falla, los selects quedan vacíos (además del placeholder);
            // no bloqueamos la pantalla de usuarios por esto.
            console.error('Error cargando roles para los selects:', err);
            rolesDisponibles = [];
            llenarSelectRoles(document.getElementById('filtro-rol'), true);
            llenarSelectRoles(document.getElementById('select-usuario-rol'), false);
        });
}

function llenarSelectRoles(select, esFiltro) {
    if (!select) return;
    const valorPrevio = select.value;
    select.innerHTML = '';
    if (esFiltro) {
        const optTodos = document.createElement('option');
        optTodos.value = '';
        optTodos.textContent = 'Todos los roles';
        select.appendChild(optTodos);
    }
    rolesDisponibles.forEach(rol => {
        const opt = document.createElement('option');
        opt.value = rol.id;
        opt.textContent = rol.nombre;
        select.appendChild(opt);
    });
    if ([...select.options].some(o => o.value === valorPrevio)) {
        select.value = valorPrevio;
    }
}

function nombreRolPorId(rolId) {
    const rol = rolesDisponibles.find(r => String(r.id) === String(rolId));
    return rol ? rol.nombre : '';
}

// ============================================================
// CARGAR USUARIOS DESDE EL BACKEND
// ============================================================
function cargarUsuarios() {
    fetch(`${API_BASE}/usuarios`)
        .then(res => manejarError(res))
        .then(data => pintarUsuarios(data || []))
        .catch(err => {
            // Igual que en Roles y Catálogos: si falla la carga, la pantalla
            // queda vacía y lista para crear, en vez de bloquear con un alert.
            console.error('Error cargando usuarios:', err);
            pintarUsuarios([]);
        });
}

function pintarUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios-body');
    tbody.innerHTML = '';

    usuarios.forEach(u => {
        const nombre = u.nombreCompleto || '';
        const iniciales = nombre.split(' ').filter(Boolean).slice(0, 2)
            .map(p => p[0].toUpperCase()).join('');
        const activo = u.estado === 'Activo';
        const badgeRol = BADGE_POR_ROL[u.rol] || 'gray';
        const badgeOrigen = u.origen === 'LDAP' ? 'info' : 'gray';

        const tr = document.createElement('tr');
        tr.setAttribute('data-dni', u.dni || '');
        tr.setAttribute('data-rol-id', u.rolId != null ? u.rolId : '');
        tr.innerHTML = `
            <td><div class="cell-user"><div class="av">${iniciales}</div><div><div class="nm">${nombre}</div><div class="em">${u.correo || ''}</div></div></div></td>
            <td>${u.dni || ''}</td>
            <td>${u.area || ''}</td>
            <td><span class="badge ${badgeRol}">${u.rol || 'Sin rol'}</span></td>
            <td><span class="badge ${badgeOrigen}">${u.origen || ''}</span></td>
            <td>${u.ultimoAcceso || 'Sin accesos registrados'}</td>
            <td><button class="toggle${activo ? ' on' : ''}" title="${activo ? 'Activo' : 'Inactivo'}"></button></td>
            <td><div class="row-actions"><button class="btn ghost sm" onclick="editarUsuario(this.closest('tr'))">Editar</button><button class="btn danger sm" onclick="eliminarUsuario(this.closest('tr'))">Eliminar</button></div></td>
        `;
        tbody.appendChild(tr);
    });

    filtrarUsuarios();
    actualizarContadoresUsuarios();
}

// ============================================================
// TOGGLE DE ESTADO ACTIVO/INACTIVO (persistido en el backend)
// ============================================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.toggle');
    if (!btn) return;

    const fila = btn.closest('tr');
    const dni = fila ? fila.getAttribute('data-dni') : null;
    if (!dni) return;

    const nuevoEstado = !btn.classList.contains('on');
    // Optimista: refleja el cambio de inmediato en la UI.
    btn.classList.toggle('on');
    btn.title = nuevoEstado ? 'Activo' : 'Inactivo';
    filtrarUsuarios();
    actualizarContadoresUsuarios();

    fetch(`${API_BASE}/usuarios/${dni}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
    })
    .then(res => manejarError(res))
    .catch(err => {
        // Si falla en el backend, revertimos el toggle visual.
        console.error('Error actualizando estado:', err);
        btn.classList.toggle('on');
        btn.title = !nuevoEstado ? 'Activo' : 'Inactivo';
        filtrarUsuarios();
        actualizarContadoresUsuarios();
    });
});

// ============================================================
// FILTRO DE LA TABLA (client-side, igual que antes)
// ============================================================
// ============================================================
// RESETEAR FILTROS (para que el usuario recién creado/editado
// siempre sea visible, aunque hubiera un filtro activo que lo
// escondería, ej: buscar "Juan" y luego crear a "Pedro").
// ============================================================
function resetearFiltrosUsuarios() {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-rol').value = '';
    document.getElementById('filtro-estado').value = 'Todos los estados';
    document.getElementById('filtro-origen').value = 'Todo origen';
}

function filtrarUsuarios() {
    const texto = (document.getElementById('filtro-busqueda').value || '').trim().toLowerCase();
    const rolId = document.getElementById('filtro-rol').value;
    const estado = document.getElementById('filtro-estado').value;
    const origen = document.getElementById('filtro-origen').value;

    let visibles = 0;
    document.querySelectorAll('#tabla-usuarios-body tr').forEach(function(fila) {
        if (fila.id === 'fila-usuarios-vacia') return;
        const nombre = (fila.querySelector('.nm') ? fila.querySelector('.nm').textContent : '').toLowerCase();
        const correo = (fila.querySelector('.em') ? fila.querySelector('.em').textContent : '').toLowerCase();
        const dni = fila.children[1].textContent.trim().toLowerCase();
        const filaRolId = fila.getAttribute('data-rol-id') || '';
        const origenTexto = fila.children[4].textContent.trim();
        const toggle = fila.querySelector('.toggle');
        const estadoTexto = toggle && toggle.classList.contains('on') ? 'Activo' : 'Inactivo';

        let visible = true;
        if (texto && !(nombre.includes(texto) || correo.includes(texto) || dni.includes(texto))) visible = false;
        if (rolId && filaRolId !== rolId) visible = false;
        if (estado !== 'Todos los estados' && estadoTexto !== estado) visible = false;
        if (origen !== 'Todo origen' && origenTexto !== origen) visible = false;

        fila.style.display = visible ? '' : 'none';
        if (visible) visibles++;
    });

    const filaVacia = document.getElementById('fila-usuarios-vacia');
    if (visibles === 0) {
        if (!filaVacia) {
            const tr = document.createElement('tr');
            tr.id = 'fila-usuarios-vacia';
            tr.innerHTML = '<td colspan="8" class="empty">No se encontraron usuarios con los filtros aplicados.</td>';
            document.getElementById('tabla-usuarios-body').appendChild(tr);
        }
    } else if (filaVacia) {
        filaVacia.remove();
    }
}

// ============================================================
// ALTA / EDICIÓN DE USUARIOS
// ============================================================
let usuarioEditando = null; // <tr> que se está editando, o null si es nuevo

function limpiarFormularioUsuario() {
    document.getElementById('input-usuario-dni').value = '';
    document.getElementById('input-usuario-dni').disabled = false;
    document.getElementById('input-usuario-nombre').value = '';
    document.getElementById('input-usuario-correo').value = '';
    document.getElementById('select-usuario-area').selectedIndex = 0;
    document.getElementById('select-usuario-rol').selectedIndex = 0;
    document.getElementById('select-usuario-origen').selectedIndex = 0;
    document.getElementById('select-usuario-estado').selectedIndex = 0;
    ocultarErrorFormulario('usuario-form-error');
}

function abrirNuevoUsuario() {
    usuarioEditando = null;
    document.getElementById('usuario-modal-titulo').textContent = 'Nuevo usuario';
    document.getElementById('usuario-btn-guardar').textContent = 'Guardar usuario';
    limpiarFormularioUsuario();
    abrirModal('modal-usuario');
}

function editarUsuario(fila) {
    usuarioEditando = fila;
    document.getElementById('usuario-modal-titulo').textContent = 'Editar usuario';
    document.getElementById('usuario-btn-guardar').textContent = 'Guardar cambios';
    ocultarErrorFormulario('usuario-form-error');

    document.getElementById('input-usuario-dni').value = fila.children[1].textContent.trim();
    // El DNI identifica al usuario en el backend: no se reasigna desde aquí.
    document.getElementById('input-usuario-dni').disabled = true;
    document.getElementById('input-usuario-nombre').value = fila.querySelector('.nm').textContent.trim();
    document.getElementById('input-usuario-correo').value = fila.querySelector('.em').textContent.trim();
    document.getElementById('select-usuario-area').value = fila.children[2].textContent.trim();
    document.getElementById('select-usuario-rol').value = fila.getAttribute('data-rol-id') || '';
    document.getElementById('select-usuario-origen').value = fila.children[4].textContent.trim();
    const activo = fila.querySelector('.toggle').classList.contains('on');
    document.getElementById('select-usuario-estado').value = activo ? 'Activo' : 'Inactivo';

    abrirModal('modal-usuario');
}

// ============================================================
// VALIDACIONES (mismas reglas que ya tenías)
// ============================================================
const RE_DNI = /^\d{8}$/;
const RE_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/;
const RE_CORREO_INSTITUCIONAL = /^[A-Za-z0-9._%+-]+@unas\.edu\.pe$/i;

function guardarUsuario() {
    const dni = document.getElementById('input-usuario-dni').value.trim();
    const nombreCompleto = document.getElementById('input-usuario-nombre').value.trim().replace(/\s+/g, ' ');
    const correo = document.getElementById('input-usuario-correo').value.trim();
    const area = document.getElementById('select-usuario-area').value;
    const rolId = document.getElementById('select-usuario-rol').value;
    const origen = document.getElementById('select-usuario-origen').value;
    const estado = document.getElementById('select-usuario-estado').value;

    if (!dni || !nombreCompleto || !correo) {
        mostrarErrorFormulario('usuario-form-error', 'Completa DNI, nombre completo y correo institucional.');
        return;
    }
    if (!RE_DNI.test(dni)) {
        mostrarErrorFormulario('usuario-form-error', 'El DNI debe tener exactamente 8 dígitos numéricos.');
        return;
    }
    if (!RE_NOMBRE.test(nombreCompleto)) {
        mostrarErrorFormulario('usuario-form-error', 'Ingresa nombre y apellido usando solo letras (sin números ni símbolos).');
        return;
    }
    if (!RE_CORREO_INSTITUCIONAL.test(correo)) {
        mostrarErrorFormulario('usuario-form-error', 'Ingresa un correo institucional válido, con el formato usuario@unas.edu.pe.');
        return;
    }
    if (!rolId) {
        mostrarErrorFormulario('usuario-form-error', 'Selecciona un rol para el usuario.');
        return;
    }

    ocultarErrorFormulario('usuario-form-error');

    const payload = { dni, nombreCompleto, correo, area, origen, estado };
    const esEdicion = !!usuarioEditando;
    const dniOriginal = esEdicion ? usuarioEditando.getAttribute('data-dni') : null;

    const url = esEdicion
        ? `${API_BASE}/usuarios/${dniOriginal}?rolId=${rolId}`
        : `${API_BASE}/usuarios?rolId=${rolId}`;
    const method = esEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => manejarError(res))
    .then(() => {
        cerrarModal('modal-usuario');
        resetearFiltrosUsuarios();
        cargarUsuarios();
    })
    .catch(err => {
        mostrarErrorFormulario('usuario-form-error', err.message || 'Error al guardar el usuario.');
    });
}

function eliminarUsuario(fila) {
    const nombre = fila.querySelector('.nm').textContent.trim();
    const dni = fila.getAttribute('data-dni');

    pedirConfirmacion(
        `¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`,
        function() {
            fetch(`${API_BASE}/usuarios/${dni}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) {
                        return res.json()
                            .then(err => { throw new Error(err.message || 'Error al eliminar usuario'); })
                            .catch(() => { throw new Error('Error al eliminar usuario'); });
                    }
                    cargarUsuarios();
                })
                .catch(err => alert('Error al eliminar: ' + err.message));
        }
    );
}

// ============================================================
// ESTADÍSTICAS DEL PANEL (tarjetas superiores)
// ============================================================
function actualizarContadoresUsuarios() {
    const filas = document.querySelectorAll('#tabla-usuarios-body tr:not(#fila-usuarios-vacia)');
    const total = filas.length;
    let activos = 0, ldap = 0;
    filas.forEach(function(fila) {
        const toggle = fila.querySelector('.toggle');
        if (toggle && toggle.classList.contains('on')) activos++;
        if (fila.children[4] && fila.children[4].textContent.trim() === 'LDAP') ldap++;
    });
    document.getElementById('stat-total-usuarios').textContent = total;
    document.getElementById('stat-activos-usuarios').textContent = activos;
    document.getElementById('stat-inactivos-usuarios').textContent = total - activos;
    document.getElementById('stat-ldap-usuarios').textContent = ldap;
}

// ============================================================
// SANEO EN VIVO DEL CAMPO DNI
// ============================================================
const inputDni = document.getElementById('input-usuario-dni');
if (inputDni) {
    inputDni.setAttribute('maxlength', '8');
    inputDni.setAttribute('inputmode', 'numeric');
    inputDni.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 8);
    });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    cargarRolesParaSelects().then(cargarUsuarios);
});
