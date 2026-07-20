// ============================================================
// DIAGTI · CTIC UNAS — Editar Sistema
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL = 'http://localhost:8080/api/desarrollador/editar-sistema';

// ============================================================
// OBTENER USUARIO ACTUAL
// ============================================================

function obtenerUsuarioActual() {
    return localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'desarrollador1';
}

// ============================================================
// OBTENER ID DEL SISTEMA DESDE URL
// ============================================================

function obtenerIdSistema() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('sistemaId') || '1';
}

// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../../../login/modules/html/login.html";
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

        console.log(`📡 ${method} ${API_URL}${endpoint}`);
        if (body && !isFormData) {
            console.log('📝 Body:', body);
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
// CARGAR DATOS DESDE EL BACKEND
// ============================================================

async function cargarDatosDesdeBackend() {
    try {
        const id = obtenerIdSistema();
        console.log(`🔍 Cargando sistema ID: ${id}`);
        
        const data = await consumirAPI(`/${id}`, 'GET');

        if (data) {
            cargarDatosEnFormulario(data);
            actualizarResumen(data);
            document.getElementById('edit-codigo-display').textContent = data.codigo || 'SIS001';
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('❌ Error al cargar los datos del sistema. Usando datos de respaldo.');
        cargarDatosMock();
    }
}

// ============================================================
// DATOS MOCK (FALLBACK)
// ============================================================

function cargarDatosMock() {
    const sistemaData = {
        id: 1,
        codigo: 'SIS001',
        nombre: 'Sistema Académico',
        descripcion: 'Sistema de gestión académica y matrícula de la UNAS',
        areaUsuaria: 'Dirección Académica',
        responsableFuncional: 'Dr. Juan Pérez',
        responsableTecnico: 'Ing. María Gómez',
        estado: 'VALIDADO',
        criticidad: 'ALTA',
        tipoAplicativo: 'WEB',
        anioDesarrollo: 2022,
        formaAdquisicion: 'Desarrollo interno CTIC',
        empresaDesarrolladora: 'CTIC UNAS',
        contratoVigente: true,
        fechaVencimientoSoporte: '2027-12-31',
        observaciones: 'Sistema estable con mejoras planificadas',
        arquitectura: {
            lenguajeProgramacion: 'PHP',
            versionLenguaje: '8.2',
            framework: 'Laravel',
            versionFramework: '10.0',
            arquitectura: 'MVC',
            patronDiseno: 'Repository',
            repositorio: 'https://github.com/unas/sistema-academico',
            tecnologiasComplementarias: 'Redis, Elasticsearch',
            motorBaseDatos: 'PostgreSQL',
            versionBaseDatos: '15.0',
            tipoBaseDatos: 'Relacional',
            servidorBaseDatos: '192.168.1.100',
            esquemaBaseDatos: 'academico',
            backupActivo: true,
            frecuenciaBackup: 'Diario',
            cifradoBaseDatos: true,
            responsableBaseDatos: 'Ing. Carlos Ruiz'
        },
        seguridad: {
            sslTls: true,
            autenticacionActiva: true,
            mfa: false,
            logsActivos: true,
            auditoriaActiva: true,
            owaspCumple: false,
            cifradoActivo: true,
            controlAcceso: true,
            restriccionIP: false,
            controlSesiones: true,
            backupSeguro: true
        },
        integraciones: [
            { id: 1, sistemaDestino: 'Sistema RRHH', protocolo: 'HTTP/REST', metodoIntercambio: 'POST', responsable: 'Ing. Ana Torres' }
        ],
        evidencias: [
            { id: 1, tipoEvidencia: 'Manual', nombreArchivo: 'manual_academico.pdf' },
            { id: 2, tipoEvidencia: 'Contrato', nombreArchivo: 'contrato_ctic.pdf' }
        ],
        urls: [
            { id: 1, url: 'https://github.com/unas/sistema-academico', descripcion: 'Repositorio Git' }
        ]
    };
    cargarDatosEnFormulario(sistemaData);
    actualizarResumen(sistemaData);
    document.getElementById('edit-codigo-display').textContent = sistemaData.codigo;
}

// ============================================================
// CARGAR DATOS EN FORMULARIO
// ============================================================

function cargarDatosEnFormulario(data) {
    console.log('📝 Cargando datos en formulario:', data);
    
    // Información General
    document.getElementById('edit-codigo').value = data.codigo || '';
    document.getElementById('edit-nombre').value = data.nombre || '';
    document.getElementById('edit-descripcion').value = data.descripcion || '';
    document.getElementById('edit-area').value = data.areaUsuaria || '';
    document.getElementById('edit-funcional').value = data.responsableFuncional || '';
    document.getElementById('edit-tecnico').value = data.responsableTecnico || '';
    document.getElementById('edit-estado').value = data.estado || 'BORRADOR';
    document.getElementById('edit-criticidad').value = data.criticidad || 'MEDIA';

    // Tipo
    const tipoRadios = document.querySelectorAll('input[name="edit-tipo"]');
    tipoRadios.forEach(radio => {
        radio.checked = radio.value === data.tipoAplicativo;
    });

    // Desarrollo
    document.getElementById('edit-anio').value = data.anioDesarrollo || '';
    document.getElementById('edit-adquisicion').value = data.formaAdquisicion || '';
    document.getElementById('edit-empresa').value = data.empresaDesarrolladora || '';
    document.getElementById('edit-contrato').value = data.contratoVigente ? 'Si' : 'No';
    // ✅ CORREGIDO: Formato de fecha para el input type="date"
    document.getElementById('edit-soporte').value = data.fechaVencimientoSoporte ? data.fechaVencimientoSoporte.split('T')[0] : '';
    document.getElementById('edit-obs-desarrollo').value = data.observaciones || '';

    // Arquitectura
    if (data.arquitectura) {
        document.getElementById('edit-lenguaje').value = data.arquitectura.lenguajeProgramacion || '';
        document.getElementById('edit-version-lenguaje').value = data.arquitectura.versionLenguaje || '';
        document.getElementById('edit-framework').value = data.arquitectura.framework || '';
        document.getElementById('edit-version-framework').value = data.arquitectura.versionFramework || '';
        document.getElementById('edit-arquitectura').value = data.arquitectura.arquitectura || '';
        document.getElementById('edit-patron').value = data.arquitectura.patronDiseno || '';
        document.getElementById('edit-repositorio').value = data.arquitectura.repositorio || '';
        document.getElementById('edit-tecnologias').value = data.arquitectura.tecnologiasComplementarias || '';
        
        // Base de Datos
        document.getElementById('edit-motor').value = data.arquitectura.motorBaseDatos || '';
        document.getElementById('edit-version-bd').value = data.arquitectura.versionBaseDatos || '';
        document.getElementById('edit-tipo-bd').value = data.arquitectura.tipoBaseDatos || '';
        document.getElementById('edit-servidor').value = data.arquitectura.servidorBaseDatos || '';
        document.getElementById('edit-esquema').value = data.arquitectura.esquemaBaseDatos || '';
        document.getElementById('edit-backup').value = data.arquitectura.backupActivo ? 'Si' : 'No';
        document.getElementById('edit-frecuencia').value = data.arquitectura.frecuenciaBackup || '';
        document.getElementById('edit-cifrado').value = data.arquitectura.cifradoBaseDatos ? 'Si' : 'No';
        document.getElementById('edit-responsable-bd').value = data.arquitectura.responsableBaseDatos || '';
    }

    // Seguridad
    if (data.seguridad) {
        const checkboxes = document.querySelectorAll('#tab-seguridad-edit input[type="checkbox"]');
        checkboxes.forEach(cb => {
            const value = cb.value;
            const isChecked = data.seguridad[value.toLowerCase().replace(/ /g, '')] === true;
            cb.checked = isChecked;
        });
    }

    // Integraciones
    if (data.integraciones && data.integraciones.length > 0) {
        const tbody = document.getElementById('tabla-integraciones-edit').querySelector('tbody');
        tbody.innerHTML = '';
        data.integraciones.forEach(integ => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${integ.sistemaDestino}</td>
                <td>${integ.protocolo}</td>
                <td>${integ.metodoIntercambio}</td>
                <td>${integ.responsable}</td>
                <td><button class="btn btn-danger btn-sm" onclick="eliminarIntegracion(${integ.id})">Eliminar</button></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Evidencias
    if (data.evidencias && data.evidencias.length > 0) {
        const lista = document.getElementById('lista-evidencias-edit');
        lista.innerHTML = '';
        data.evidencias.forEach(ev => {
            if (!ev.archivoUrl || !ev.archivoUrl.startsWith('http')) {
                const item = document.createElement('div');
                item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
                item.innerHTML = `
                    <span><strong>${ev.tipoEvidencia}:</strong> ${ev.nombreArchivo}</span>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEvidencia(${ev.id})">Eliminar</button>
                `;
                lista.appendChild(item);
            }
        });
    }

    // URLs
    if (data.urls && data.urls.length > 0) {
        const lista = document.getElementById('lista-urls-edit');
        lista.innerHTML = '';
        data.urls.forEach(url => {
            const item = document.createElement('div');
            item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
            item.innerHTML = `
                <span><strong>${url.descripcion || 'URL'}:</strong> <a href="${url.url}" target="_blank">${url.url}</a></span>
                <button class="btn btn-danger btn-sm" onclick="eliminarUrl(${url.id})">Eliminar</button>
            `;
            lista.appendChild(item);
        });
    }
}

// ============================================================
// ACTUALIZAR RESUMEN
// ============================================================

function actualizarResumen(data) {
    document.getElementById('resumen-codigo').textContent = data.codigo || '-';
    document.getElementById('resumen-nombre').textContent = data.nombre || '-';
    document.getElementById('resumen-area').textContent = data.areaUsuaria || '-';
    document.getElementById('resumen-tecnico').textContent = data.responsableTecnico || '-';
    document.getElementById('resumen-tipo').textContent = data.tipoAplicativo || '-';
}

// ============================================================
// CAMBIAR PESTAÑA
// ============================================================

function cambiarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
    const btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

// ============================================================
// RECOPILAR DATOS DEL FORMULARIO
// ============================================================

function recopilarDatosFormulario() {
    const seguridadChecks = document.querySelectorAll('#tab-seguridad-edit input[type="checkbox"]');
    const seguridad = {};
    seguridadChecks.forEach(cb => {
        const key = cb.value.toLowerCase().replace(/ /g, '');
        seguridad[key] = cb.checked;
    });

    // ✅ CORREGIDO: Formato de fecha con hora
    const soporte = document.getElementById('edit-soporte')?.value || '';
    let fechaVencimientoSoporte = null;
    if (soporte) {
        fechaVencimientoSoporte = soporte + 'T00:00:00';
        console.log('📅 Fecha de soporte formateada:', fechaVencimientoSoporte);
    }

    const data = {
        codigo: document.getElementById('edit-codigo').value,
        nombre: document.getElementById('edit-nombre').value,
        descripcion: document.getElementById('edit-descripcion').value,
        tipoAplicativo: document.querySelector('input[name="edit-tipo"]:checked')?.value || '',
        areaUsuaria: document.getElementById('edit-area').value,
        responsableFuncional: document.getElementById('edit-funcional').value,
        responsableTecnico: document.getElementById('edit-tecnico').value || obtenerUsuarioActual(),
        estado: document.getElementById('edit-estado').value,
        criticidad: document.getElementById('edit-criticidad').value,
        anioDesarrollo: parseInt(document.getElementById('edit-anio').value) || null,
        formaAdquisicion: document.getElementById('edit-adquisicion').value,
        empresaDesarrolladora: document.getElementById('edit-empresa').value,
        contratoVigente: document.getElementById('edit-contrato').value === 'Si',
        // ✅ CORREGIDO
        fechaVencimientoSoporte: fechaVencimientoSoporte,
        observaciones: document.getElementById('edit-obs-desarrollo').value,
        esLegacy: document.getElementById('edit-legacy')?.checked || false,
        
        arquitectura: {
            lenguajeProgramacion: document.getElementById('edit-lenguaje').value,
            versionLenguaje: document.getElementById('edit-version-lenguaje').value,
            framework: document.getElementById('edit-framework').value,
            versionFramework: document.getElementById('edit-version-framework').value,
            arquitectura: document.getElementById('edit-arquitectura').value,
            patronDiseno: document.getElementById('edit-patron').value,
            repositorio: document.getElementById('edit-repositorio').value,
            tecnologiasComplementarias: document.getElementById('edit-tecnologias').value,
            motorBaseDatos: document.getElementById('edit-motor').value,
            versionBaseDatos: document.getElementById('edit-version-bd').value,
            tipoBaseDatos: document.getElementById('edit-tipo-bd').value,
            servidorBaseDatos: document.getElementById('edit-servidor').value,
            esquemaBaseDatos: document.getElementById('edit-esquema').value,
            backupActivo: document.getElementById('edit-backup').value === 'Si',
            frecuenciaBackup: document.getElementById('edit-frecuencia').value,
            cifradoBaseDatos: document.getElementById('edit-cifrado').value === 'Si',
            responsableBaseDatos: document.getElementById('edit-responsable-bd').value
        },
        
        seguridad: {
            sslTls: seguridad.ssltls || false,
            autenticacionActiva: seguridad.autenticacion || false,
            mfa: seguridad.mfa || false,
            logsActivos: seguridad.logs || false,
            auditoriaActiva: seguridad.auditoria || false,
            owaspCumple: seguridad.owasp || false,
            cifradoActivo: seguridad.cifrado || false,
            controlAcceso: seguridad.controldeacceso || false,
            restriccionIP: seguridad.restriccionip || false,
            controlSesiones: seguridad.sesiones || false,
            backupSeguro: seguridad.backup || false
        }
    };
    
    console.log('📝 Datos recopilados para editar:', data);
    return data;
}

// ============================================================
// GUARDAR CAMBIOS
// ============================================================

async function guardarCambios() {
    if (!confirm('¿Guardar los cambios realizados?')) return;

    try {
        const id = obtenerIdSistema();
        const data = recopilarDatosFormulario();
        
        console.log(`📤 Enviando PUT a /${id}`);
        const result = await consumirAPI(`/${id}`, 'PUT', data);

        if (result && result.exito) {
            alert('✅ ' + result.mensaje);
            window.location.href = 'mis-sistemas.html';
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error guardando:', error);
        alert('❌ Error al guardar los cambios: ' + error.message);
    }
}

// ============================================================
// CANCELAR EDICIÓN
// ============================================================

function cancelarEdicion() {
    if (confirm('¿Cancelar la edición? Los cambios no guardados se perderán.')) {
        window.location.href = 'mis-sistemas.html';
    }
}

// ============================================================
// ENVIAR A VALIDACIÓN
// ============================================================

async function enviarValidacionEdit() {
    if (!confirm('¿Enviar este sistema a validación?')) return;

    try {
        const id = obtenerIdSistema();
        const result = await consumirAPI(`/${id}/enviar-validacion`, 'POST');

        if (result && result.exito) {
            alert('✅ ' + result.mensaje);
            window.location.href = 'mis-sistemas.html';
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error enviando a validación:', error);
        alert('❌ Error al enviar a validación: ' + error.message);
    }
}

// ============================================================
// SUBIR EVIDENCIA
// ============================================================

async function subirEvidenciaEdit(tipo) {
    const input = document.getElementById('evidencia-' + tipo + '-edit');
    if (!input) return;
    const file = input.files[0];
    if (!file) {
        alert('Selecciona un archivo para ' + tipo);
        return;
    }

    try {
        const id = obtenerIdSistema();
        const formData = new FormData();
        formData.append('tipo', tipo);
        formData.append('archivo', file);

        const result = await consumirAPI(`/${id}/evidencias`, 'POST', formData, true);

        if (result && result.exito) {
            alert('✅ ' + result.mensaje);
            cargarDatosDesdeBackend();
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
// ELIMINAR EVIDENCIA
// ============================================================

async function eliminarEvidencia(evidenciaId) {
    if (!confirm('¿Eliminar esta evidencia?')) return;

    try {
        const id = obtenerIdSistema();
        await consumirAPI(`/${id}/evidencias/${evidenciaId}`, 'DELETE');
        alert('✅ Evidencia eliminada');
        cargarDatosDesdeBackend();
    } catch (error) {
        console.error('Error eliminando evidencia:', error);
        alert('❌ Error al eliminar la evidencia');
    }
}

// ============================================================
// AGREGAR URL
// ============================================================

async function agregarUrlEdit() {
    const url = document.getElementById('evidencia-url-edit').value.trim();
    const desc = document.getElementById('evidencia-url-desc-edit').value.trim();

    if (!url) {
        alert('Ingresa una URL válida.');
        return;
    }

    try {
        const id = obtenerIdSistema();
        const params = new URLSearchParams();
        params.append('url', url);
        if (desc) params.append('descripcion', desc);

        const result = await consumirAPI(`/${id}/urls?${params.toString()}`, 'POST');

        if (result && result.exito) {
            alert('✅ ' + result.mensaje);
            document.getElementById('evidencia-url-edit').value = '';
            document.getElementById('evidencia-url-desc-edit').value = '';
            cargarDatosDesdeBackend();
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error agregando URL:', error);
        alert('❌ Error al agregar la URL');
    }
}

// ============================================================
// ELIMINAR URL
// ============================================================

async function eliminarUrl(urlId) {
    if (!confirm('¿Eliminar esta URL?')) return;

    try {
        const id = obtenerIdSistema();
        await consumirAPI(`/${id}/urls/${urlId}`, 'DELETE');
        alert('✅ URL eliminada');
        cargarDatosDesdeBackend();
    } catch (error) {
        console.error('Error eliminando URL:', error);
        alert('❌ Error al eliminar la URL');
    }
}

// ============================================================
// AGREGAR INTEGRACIÓN
// ============================================================

async function agregarIntegracionEdit() {
    const destino = document.getElementById('integracion-destino-edit').value.trim();
    const protocolo = document.getElementById('integracion-protocolo-edit').value;
    const metodo = document.getElementById('integracion-metodo-edit').value.trim();
    const responsable = document.getElementById('integracion-responsable-edit').value.trim();

    if (!destino || !protocolo || !metodo || !responsable) {
        alert('Completa todos los campos de la integración.');
        return;
    }

    try {
        const id = obtenerIdSistema();
        const data = {
            sistemaDestino: destino,
            protocolo: protocolo,
            metodo: metodo,
            responsable: responsable,
            frecuencia: 'Tiempo real',
            estado: 'ACTIVO'
        };

        const result = await consumirAPI(`/${id}/integraciones`, 'POST', data);

        if (result && result.exito) {
            alert('✅ ' + result.mensaje);
            document.getElementById('integracion-destino-edit').value = '';
            document.getElementById('integracion-metodo-edit').value = '';
            document.getElementById('integracion-responsable-edit').value = '';
            cargarDatosDesdeBackend();
        } else {
            alert('❌ Error: ' + (result?.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error agregando integración:', error);
        alert('❌ Error al agregar la integración');
    }
}

// ============================================================
// ELIMINAR INTEGRACIÓN
// ============================================================

async function eliminarIntegracion(integracionId) {
    if (!confirm('¿Eliminar esta integración?')) return;

    try {
        const id = obtenerIdSistema();
        await consumirAPI(`/${id}/integraciones/${integracionId}`, 'DELETE');
        alert('✅ Integración eliminada');
        cargarDatosDesdeBackend();
    } catch (error) {
        console.error('Error eliminando integración:', error);
        alert('❌ Error al eliminar la integración');
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Editar Sistema - Página cargada');
    
    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'editar-sistema.html' || item.getAttribute('href') === 'mis-sistemas.html') {
            item.classList.add('active');
        }
    });

    // Activar primera pestaña
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        cambiarTab(firstTab.getAttribute('data-tab'));
    }

    // Cargar datos reales del backend
    cargarDatosDesdeBackend();
});