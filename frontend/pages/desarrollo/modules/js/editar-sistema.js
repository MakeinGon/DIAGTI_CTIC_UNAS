// ============================================================
// DIAGTI · CTIC UNAS — Editar Sistema
// ============================================================

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
// DATOS DEL SISTEMA (simulados)
// ============================================================
const sistemaData = {
    codigo: 'SIS001',
    nombre: 'Sistema Académico',
    descripcion: 'Sistema de gestión académica y matrícula de la UNAS',
    area: 'Dirección Académica',
    responsable_funcional: 'Dr. Juan Pérez',
    responsable_tecnico: 'Ing. María Gómez',
    estado: 'Validado',
    criticidad: 'Académico',
    tipo: 'Web',
    anio_desarrollo: '2022',
    adquisicion: 'Desarrollo interno CTIC',
    empresa: 'CTIC UNAS',
    contrato: 'Si',
    fecha_soporte: '2027-12-31',
    observaciones: 'Sistema estable con mejoras planificadas',
    lenguaje: 'PHP',
    version_lenguaje: '8.2',
    framework: 'Laravel',
    version_framework: '10.0',
    arquitectura: 'MVC',
    patron: 'Repository',
    repositorio: 'https://github.com/unas/sistema-academico',
    tecnologias: 'Redis, Elasticsearch',
    motor: 'PostgreSQL',
    version_bd: '15.0',
    tipo_bd: 'Relacional',
    servidor: '192.168.1.100',
    esquema: 'academico',
    backup: 'Si',
    frecuencia_backup: 'Diario',
    cifrado: 'Si',
    responsable_bd: 'Ing. Carlos Ruiz',
    seguridad: ['SSL', 'Logs', 'Auditoría', 'Control de acceso'],
    integraciones: [
        { destino: 'Sistema RRHH', protocolo: 'HTTP/REST', metodo: 'POST', responsable: 'Ing. Ana Torres' }
    ],
    evidencias: [
        { tipo: 'Manual', nombre: 'manual_academico.pdf', tamaño: '2.4 MB' },
        { tipo: 'Contrato', nombre: 'contrato_ctic.pdf', tamaño: '1.2 MB' }
    ],
    urls: [
        { desc: 'Repositorio Git', url: 'https://github.com/unas/sistema-academico' }
    ]
};

// ============================================================
// CAMBIAR PESTAÑA
// ============================================================
function cambiarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(function (content) {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
    const btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

// ============================================================
// CARGAR DATOS EN FORMULARIO
// ============================================================
function cargarDatos() {
    // Información General
    document.getElementById('edit-codigo').value = sistemaData.codigo;
    document.getElementById('edit-nombre').value = sistemaData.nombre;
    document.getElementById('edit-descripcion').value = sistemaData.descripcion;
    document.getElementById('edit-area').value = sistemaData.area;
    document.getElementById('edit-funcional').value = sistemaData.responsable_funcional;
    document.getElementById('edit-tecnico').value = sistemaData.responsable_tecnico;
    document.getElementById('edit-estado').value = sistemaData.estado;
    document.getElementById('edit-criticidad').value = sistemaData.criticidad;

    // Tipo
    const tipoRadios = document.querySelectorAll('input[name="edit-tipo"]');
    tipoRadios.forEach(function (radio) {
        if (radio.value === sistemaData.tipo) {
            radio.checked = true;
        }
    });

    // Desarrollo
    document.getElementById('edit-anio').value = sistemaData.anio_desarrollo;
    document.getElementById('edit-adquisicion').value = sistemaData.adquisicion;
    document.getElementById('edit-empresa').value = sistemaData.empresa;
    document.getElementById('edit-contrato').value = sistemaData.contrato;
    document.getElementById('edit-soporte').value = sistemaData.fecha_soporte;
    document.getElementById('edit-obs-desarrollo').value = sistemaData.observaciones;

    // Arquitectura
    document.getElementById('edit-lenguaje').value = sistemaData.lenguaje;
    document.getElementById('edit-version-lenguaje').value = sistemaData.version_lenguaje;
    document.getElementById('edit-framework').value = sistemaData.framework;
    document.getElementById('edit-version-framework').value = sistemaData.version_framework;
    document.getElementById('edit-arquitectura').value = sistemaData.arquitectura;
    document.getElementById('edit-patron').value = sistemaData.patron;
    document.getElementById('edit-repositorio').value = sistemaData.repositorio;
    document.getElementById('edit-tecnologias').value = sistemaData.tecnologias;

    // Base de Datos
    document.getElementById('edit-motor').value = sistemaData.motor;
    document.getElementById('edit-version-bd').value = sistemaData.version_bd;
    document.getElementById('edit-tipo-bd').value = sistemaData.tipo_bd;
    document.getElementById('edit-servidor').value = sistemaData.servidor;
    document.getElementById('edit-esquema').value = sistemaData.esquema;
    document.getElementById('edit-backup').value = sistemaData.backup;
    document.getElementById('edit-frecuencia').value = sistemaData.frecuencia_backup;
    document.getElementById('edit-cifrado').value = sistemaData.cifrado;
    document.getElementById('edit-responsable-bd').value = sistemaData.responsable_bd;

    // Seguridad
    const checkboxes = document.querySelectorAll('#tab-seguridad-edit input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
        if (sistemaData.seguridad.includes(cb.value)) {
            cb.checked = true;
        }
    });

    // Integraciones
    const tbody = document.getElementById('tabla-integraciones-edit').querySelector('tbody');
    sistemaData.integraciones.forEach(function (integ) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${integ.destino}</td>
            <td>${integ.protocolo}</td>
            <td>${integ.metodo}</td>
            <td>${integ.responsable}</td>
            <td><button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">Eliminar</button></td>
        `;
        tbody.appendChild(row);
    });

    // Evidencias
    const listaEvidencias = document.getElementById('lista-evidencias-edit');
    sistemaData.evidencias.forEach(function (ev) {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
        item.innerHTML = `
            <span><strong>${ev.tipo}:</strong> ${ev.nombre} (${ev.tamaño})</span>
            <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Eliminar</button>
        `;
        listaEvidencias.appendChild(item);
    });

    // URLs
    const listaUrls = document.getElementById('lista-urls-edit');
    sistemaData.urls.forEach(function (url) {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
        item.innerHTML = `
            <span><strong>${url.desc}:</strong> <a href="${url.url}" target="_blank" style="color:var(--color-azul-ctic);">${url.url}</a></span>
            <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Eliminar</button>
        `;
        listaUrls.appendChild(item);
    });
}

// ============================================================
// AGREGAR INTEGRACIÓN
// ============================================================
function agregarIntegracionEdit() {
    const destino = document.getElementById('integracion-destino-edit').value.trim();
    const protocolo = document.getElementById('integracion-protocolo-edit').value;
    const metodo = document.getElementById('integracion-metodo-edit').value.trim();
    const responsable = document.getElementById('integracion-responsable-edit').value.trim();

    if (!destino || !protocolo || !metodo || !responsable) {
        alert('Completa todos los campos de la integración.');
        return;
    }

    const tabla = document.getElementById('tabla-integraciones-edit').querySelector('tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${destino}</td>
        <td>${protocolo}</td>
        <td>${metodo}</td>
        <td>${responsable}</td>
        <td><button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">Eliminar</button></td>
    `;
    tabla.appendChild(row);

    document.getElementById('integracion-destino-edit').value = '';
    document.getElementById('integracion-metodo-edit').value = '';
    document.getElementById('integracion-responsable-edit').value = '';
}

// ============================================================
// SUBIR EVIDENCIA
// ============================================================
function subirEvidenciaEdit(tipo) {
    const input = document.getElementById('evidencia-' + tipo + '-edit');
    if (!input) return;
    const file = input.files[0];
    if (!file) {
        alert('Selecciona un archivo para ' + tipo);
        return;
    }
    const lista = document.getElementById('lista-evidencias-edit');
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
    item.innerHTML = `
        <span><strong>${tipo}:</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
        <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Eliminar</button>
    `;
    lista.appendChild(item);
    input.value = '';
}

// ============================================================
// AGREGAR URL
// ============================================================
function agregarUrlEdit() {
    const url = document.getElementById('evidencia-url-edit').value.trim();
    const desc = document.getElementById('evidencia-url-desc-edit').value.trim();
    if (!url) {
        alert('Ingresa una URL válida.');
        return;
    }
    const lista = document.getElementById('lista-urls-edit');
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
    item.innerHTML = `
        <span><strong>${desc || 'URL'}:</strong> <a href="${url}" target="_blank" style="color:var(--color-azul-ctic);">${url}</a></span>
        <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Eliminar</button>
    `;
    lista.appendChild(item);
    document.getElementById('evidencia-url-edit').value = '';
    document.getElementById('evidencia-url-desc-edit').value = '';
}

// ============================================================
// ACCIONES DEL FORMULARIO
// ============================================================
function guardarCambios() {
    if (confirm('¿Guardar los cambios realizados?')) {
        alert('✅ Cambios guardados correctamente.');
        window.location.href = 'mis-sistemas.html';
    }
}

function cancelarEdicion() {
    if (confirm('¿Cancelar la edición? Los cambios no guardados se perderán.')) {
        window.location.href = 'mis-sistemas.html';
    }
}

function enviarValidacionEdit() {
    if (confirm('¿Enviar este sistema a validación?')) {
        alert('✅ Sistema enviado a validación correctamente.');
        window.location.href = 'mis-sistemas.html';
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'editar-sistema.html' || item.getAttribute('href') === 'mis-sistemas.html') {
            item.classList.add('active');
        }
    });

    // Activar primera pestaña
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        const tabId = firstTab.getAttribute('data-tab');
        cambiarTab(tabId);
    }

    // Cargar datos
    cargarDatos();
});