// ============================================================
// CONFIGURACIÓN API
// ============================================================
const API_BASE = '/api/admin/catalogos';

// Tipos alineados a DataBase/init.sql y módulos oficiales (AREA_USUARIO, no AREA_USUARIA).
const MAPA_TIPOS = {
    areas: 'AREA_USUARIO',
    tipos: 'TIPO_APLICATIVO',
    estados: 'ESTADO_LEVANTAMIENTO',
    criticidad: 'CRITICIDAD',
    tecnologias: 'TECNOLOGIA',
    motores: 'MOTOR_BD',
    evidencias: 'TIPO_EVIDENCIA',
    adquisicion: 'FORMA_ADQUISICION',
    riesgo: 'NIVEL_RIESGO'
};

let catalogoActual = 'areas';

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function manejarError(res) {
    if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || 'Error en la petición'); });
    }
    return res.json();
}

// ============================================================
// MODALES
// ============================================================
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
// CARGAR CATÁLOGO DESDE BACKEND
// ============================================================
function cargarCatalogo(tipoFront) {
    const tipoBD = MAPA_TIPOS[tipoFront];
    if (!tipoBD) {
        console.error('Tipo de catálogo no mapeado:', tipoFront);
        return;
    }

    fetch(`${API_BASE}/${tipoBD}`)
        .then(res => manejarError(res))
        .then(data => {
            const tbody = document.querySelector(`#cat-${tipoFront} table tbody`);
            if (!tbody) return;
            tbody.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');
                const badgeClase = item.estado === 'Activo' ? 'low' : 'gray';
                tr.innerHTML = `
                    <td>${item.codigo}</td>
                    <td><b>${item.nombre}</b></td>
                    <td>${item.descripcion || '—'}</td>
                    <td><span class="badge ${badgeClase}">${item.estado}</span></td>
                    <td>
                        <div class="row-actions">
                            <button class="btn ghost sm" onclick="editarItem(this.closest('tr'))">Editar</button>
                            <button class="btn danger sm" onclick="eliminarItem(this.closest('tr'))">Desactivar</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            actualizarContadorCatalogo(`cat-${tipoFront}`);
        })
        .catch(err => {
            console.error('Error cargando catálogo:', err);
            mostrarErrorFormulario('item-form-error', 'Error al cargar datos: ' + err.message);
        });
}

// ============================================================
// ACTUALIZAR CONTADOR DE UN CATÁLOGO ESPECÍFICO
// ============================================================
function actualizarContadorCatalogo(catViewId) {
    const total = document.querySelectorAll('#' + catViewId + ' table tbody tr').length;
    const tipoFront = catViewId.replace('cat-', '');
    const pill = document.querySelector(`.list-item[data-cat="${tipoFront}"] .count-pill`);
    if (pill) pill.textContent = total;
}

// ============================================================
// ACTUALIZAR TODOS LOS CONTADORES (al cargar la página)
// ============================================================
function actualizarTodosLosContadores() {
    // Para cada tipo de catálogo, hacer fetch y actualizar el contador sin pintar la tabla
    // Pero es mejor obtener todos los datos de una vez. Como no tenemos un endpoint que devuelva todos,
    // haremos fetch por cada tipo.
    const tipos = Object.keys(MAPA_TIPOS);
    tipos.forEach(tipoFront => {
        const tipoBD = MAPA_TIPOS[tipoFront];
        fetch(`${API_BASE}/${tipoBD}`)
            .then(res => manejarError(res))
            .then(data => {
                const count = data.length;
                const pill = document.querySelector(`.list-item[data-cat="${tipoFront}"] .count-pill`);
                if (pill) pill.textContent = count;
            })
            .catch(err => console.error('Error actualizando contador de', tipoFront, err));
    });
}

// ============================================================
// MOSTRAR CATÁLOGO (selector de la izquierda)
// ============================================================
function mostrarCatalogo(tipoFront, el) {
    document.querySelectorAll('.cat-view').forEach(v => v.classList.remove('active'));
    const vista = document.getElementById('cat-' + tipoFront);
    if (vista) vista.classList.add('active');

    document.querySelectorAll('#lista-catalogos .list-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');

    catalogoActual = tipoFront;
    cargarCatalogo(tipoFront);
}

// ============================================================
// ALTA / EDICIÓN / ELIMINACIÓN
// ============================================================
let itemEditando = null;

function limpiarFormularioItem() {
    document.getElementById('input-item-codigo').value = '';
    document.getElementById('input-item-nombre').value = '';
    document.getElementById('textarea-item-desc').value = '';
    document.getElementById('select-item-estado').selectedIndex = 0;
    ocultarErrorFormulario('item-form-error');
}

function abrirNuevoItem(catViewId) {
    itemEditando = null;
    document.getElementById('item-modal-titulo').textContent = 'Nuevo ítem de catálogo';
    document.getElementById('item-btn-guardar').textContent = 'Guardar ítem';
    limpiarFormularioItem();

    const tipoFront = catViewId.replace('cat-', '');
    const selectCatalogo = document.getElementById('select-item-catalogo');
    const opciones = selectCatalogo.options;
    for (let i = 0; i < opciones.length; i++) {
        if (opciones[i].text === obtenerNombreCatalogo(tipoFront)) {
            selectCatalogo.selectedIndex = i;
            break;
        }
    }
    selectCatalogo.disabled = false;
    abrirModal('modal-item');
}

function editarItem(fila) {
    itemEditando = fila;
    document.getElementById('item-modal-titulo').textContent = 'Editar ítem de catálogo';
    document.getElementById('item-btn-guardar').textContent = 'Guardar cambios';
    ocultarErrorFormulario('item-form-error');

    const catViewId = fila.closest('.cat-view').id;
    const tipoFront = catViewId.replace('cat-', '');
    const selectCatalogo = document.getElementById('select-item-catalogo');
    const opciones = selectCatalogo.options;
    for (let i = 0; i < opciones.length; i++) {
        if (opciones[i].text === obtenerNombreCatalogo(tipoFront)) {
            selectCatalogo.selectedIndex = i;
            break;
        }
    }
    selectCatalogo.disabled = true;

    document.getElementById('input-item-codigo').value = fila.children[0].textContent.trim();
    document.getElementById('input-item-nombre').value = fila.children[1].textContent.trim();
    document.getElementById('textarea-item-desc').value = fila.children[2].textContent.trim();
    document.getElementById('select-item-estado').value = fila.children[3].textContent.trim();
    abrirModal('modal-item');
}

function guardarItem() {
    const catalogoNombre = document.getElementById('select-item-catalogo').value;
    const tipoFront = obtenerTipoFrontDesdeNombre(catalogoNombre);
    const tipoBD = MAPA_TIPOS[tipoFront];
    if (!tipoBD) {
        mostrarErrorFormulario('item-form-error', 'Tipo de catálogo no válido');
        return;
    }

    const codigo = document.getElementById('input-item-codigo').value.trim().toUpperCase();
    const nombre = document.getElementById('input-item-nombre').value.trim();
    const descripcion = document.getElementById('textarea-item-desc').value.trim();
    const estado = document.getElementById('select-item-estado').value;

    if (!codigo || !nombre) {
        mostrarErrorFormulario('item-form-error', 'Completa el código y el nombre del ítem.');
        return;
    }
    if (!/^[A-Za-z]{2,4}-\d{2,4}$/.test(codigo)) {
        mostrarErrorFormulario('item-form-error', 'El código debe tener el formato AA-00 (2 a 4 letras, guion y 2 a 4 números).');
        return;
    }
    if (nombre.length < 2) {
        mostrarErrorFormulario('item-form-error', 'El nombre debe tener al menos 2 caracteres.');
        return;
    }

    const payload = { codigo, nombre, descripcion, estado, orden: 0 };

    const method = itemEditando ? 'PUT' : 'POST';
    const url = itemEditando
        ? `${API_BASE}/${tipoBD}/${codigo}`
        : `${API_BASE}/${tipoBD}`;

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => manejarError(res))
    .then(() => {
        cerrarModal('modal-item');
        cargarCatalogo(tipoFront);
        actualizarContadorCatalogo(`cat-${tipoFront}`);
        // También actualizamos los demás contadores (opcional, pero por si cambia el total)
        // Podemos llamar a actualizarTodosLosContadores() pero haría muchas peticiones.
        // Mejor solo actualizar el que cambió y dejar que los demás se actualicen cuando se carguen.
    })
    .catch(err => {
        mostrarErrorFormulario('item-form-error', err.message || 'Error al guardar');
    });
}

function eliminarItem(fila) {
    const codigo = fila.children[0].textContent.trim();
    const catViewId = fila.closest('.cat-view').id;
    const tipoFront = catViewId.replace('cat-', '');
    const tipoBD = MAPA_TIPOS[tipoFront];

    pedirConfirmacion(
        '¿Desactivar el ítem "' + codigo + '" de este catálogo? El valor se conserva (soft-delete).',
        function() {
            fetch(`${API_BASE}/${tipoBD}/${codigo}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) throw new Error('Error al desactivar');
                    cargarCatalogo(tipoFront);
                    actualizarContadorCatalogo(catViewId);
                })
                .catch(err => console.error(err));
        },
        'Desactivar'
    );
}

// ============================================================
// MAPEO PARA EL SELECT DEL MODAL
// ============================================================
function obtenerNombreCatalogo(tipoFront) {
    const mapa = {
        areas: 'Áreas usuarias',
        tipos: 'Tipos de aplicativo',
        estados: 'Estados de levantamiento',
        criticidad: 'Criticidades',
        tecnologias: 'Tecnologías',
        motores: 'Motores de base de datos',
        evidencias: 'Tipos de evidencia',
        adquisicion: 'Formas de adquisición',
        riesgo: 'Niveles de riesgo'
    };
    return mapa[tipoFront] || tipoFront;
}

function obtenerTipoFrontDesdeNombre(nombre) {
    const mapa = {
        'Áreas usuarias': 'areas',
        'Tipos de aplicativo': 'tipos',
        'Estados de levantamiento': 'estados',
        'Criticidades': 'criticidad',
        'Tecnologías': 'tecnologias',
        'Motores de base de datos': 'motores',
        'Tipos de evidencia': 'evidencias',
        'Formas de adquisición': 'adquisicion',
        'Niveles de riesgo': 'riesgo'
    };
    return mapa[nombre] || nombre;
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Primero cargar el catálogo activo (por defecto 'areas')
    const primerItem = document.querySelector('.list-item[data-cat="areas"]');
    if (primerItem) {
        mostrarCatalogo('areas', primerItem);
    }

    // Luego actualizar todos los contadores para que no aparezcan en 0
    // Esperamos un poco para que se cargue el primer catálogo y luego actualizamos los demás
    setTimeout(function() {
        actualizarTodosLosContadores();
    }, 500);
});

// ============================================================
// SANEO DEL CÓDIGO
// ============================================================
const inputItemCodigo = document.getElementById('input-item-codigo');
if (inputItemCodigo) {
    inputItemCodigo.setAttribute('maxlength', '9');
    inputItemCodigo.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/\s+/g, '');
    });
}