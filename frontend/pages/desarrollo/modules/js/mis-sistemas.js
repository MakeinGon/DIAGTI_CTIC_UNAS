// ============================================================
// DIAGTI · CTIC UNAS — Mis Sistemas
// ============================================================

// ============================================================
// DATOS MOCK (localStorage)
// ============================================================
const SISTEMAS_KEY = 'diagti_sistemas';

function getSistemas() {
    const stored = localStorage.getItem(SISTEMAS_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.log('Error al parsear datos, creando nuevos...');
        }
    }

    const initial = [
        {
            id: 'SIS001',
            codigo: 'SIS001',
            nombre: 'Sistema Académico',
            tipo: 'Web',
            estado: 'Validado',
            criticidad: 'Media',
            fecha: '08/07/2026',
            area: 'Académico',
            responsable_tecnico: 'Ing. María Gómez',
            responsable_funcional: 'Dr. Juan Pérez',
            descripcion: 'Sistema de gestión académica y matrícula',
            anio_desarrollo: '2022',
            adquisicion: 'Desarrollo interno CTIC',
            empresa: 'CTIC UNAS',
            contrato: 'Si',
            fecha_soporte: '2027-12-31',
            observaciones: 'Sistema estable',
            lenguaje: 'PHP',
            version_lenguaje: '8.2',
            framework: 'Laravel',
            version_framework: '10.0',
            arquitectura: 'MVC',
            patron: 'Repository',
            repositorio: 'https://github.com/unas/academico',
            tecnologias: 'Redis, Elasticsearch',
            motor_bd: 'PostgreSQL',
            version_bd: '15.0',
            tipo_bd: 'Relacional',
            servidor: '192.168.1.100',
            esquema: 'academico',
            backup: 'Si',
            frecuencia_backup: 'Diario',
            cifrado: 'Si',
            responsable_bd: 'Ing. Carlos Ruiz',
            integraciones: [{ destino: 'RRHH', protocolo: 'HTTP/REST', metodo: 'API REST', frecuencia: 'Diario', estado: 'Activo', responsable: 'Ing. Ana Torres' }],
            evidencias: [{ tipo: 'Manual', nombre: 'manual.pdf', size: 245760 }],
            urls: [{ desc: 'Git', url: 'https://github.com/unas/academico' }],
            tiene_integraciones: true,
            observaciones_validador: [],
            estado_operativo: 'Activo / En Producción'
        },
        {
            id: 'SIS002',
            codigo: 'SIS002',
            nombre: 'Sistema Biblioteca',
            tipo: 'Web',
            estado: 'Observado',
            criticidad: 'Alta',
            fecha: '05/07/2026',
            area: 'Biblioteca',
            responsable_tecnico: 'Ing. Luis Torres',
            responsable_funcional: 'Lic. Ana Paredes',
            descripcion: 'Gestión de préstamos y catálogo',
            anio_desarrollo: '2021',
            adquisicion: 'Proveedor externo',
            empresa: 'Bibliotech S.A.',
            contrato: 'No',
            fecha_soporte: '2025-06-30',
            observaciones: 'Requiere actualización',
            lenguaje: 'Java',
            version_lenguaje: '11',
            framework: 'Spring Boot',
            version_framework: '2.7',
            arquitectura: 'Microservicios',
            patron: 'Repository',
            repositorio: '',
            tecnologias: 'Kafka, MongoDB',
            motor_bd: 'MySQL',
            version_bd: '8.0',
            tipo_bd: 'Relacional',
            servidor: '192.168.1.101',
            esquema: 'biblioteca',
            backup: 'Si',
            frecuencia_backup: 'Semanal',
            cifrado: 'No',
            responsable_bd: 'Ing. Carlos Ruiz',
            integraciones: [],
            evidencias: [],
            urls: [],
            tiene_integraciones: false,
            observaciones_validador: [
                { campo: 'motor_bd', mensaje: 'Debe indicar versión PostgreSQL.' },
                { campo: 'repositorio', mensaje: 'Debe indicar repositorio Git.' }
            ],
            estado_operativo: 'Activo / En Producción'
        },
        {
            id: 'SIS003',
            codigo: 'SIS003',
            nombre: 'Sistema Finanzas',
            tipo: 'Desktop',
            estado: 'Borrador',
            criticidad: 'Crítica',
            fecha: '03/07/2026',
            area: 'Finanzas',
            responsable_tecnico: 'Ing. Pedro Ramírez',
            responsable_funcional: 'CPC. Rosa Gómez',
            descripcion: 'Gestión presupuestal y contable',
            anio_desarrollo: '2023',
            adquisicion: 'Compra directa',
            empresa: 'SoftFinanzas',
            contrato: 'Si',
            fecha_soporte: '2028-12-31',
            observaciones: '',
            lenguaje: 'C#',
            version_lenguaje: '10.0',
            framework: '.NET',
            version_framework: '6.0',
            arquitectura: 'MVC',
            patron: 'Factory',
            repositorio: 'https://github.com/unas/finanzas',
            tecnologias: 'Azure, SQL Server',
            motor_bd: 'SQL Server',
            version_bd: '2019',
            tipo_bd: 'Relacional',
            servidor: '192.168.1.102',
            esquema: 'finanzas',
            backup: 'Si',
            frecuencia_backup: 'Diario',
            cifrado: 'Si',
            responsable_bd: 'Ing. Carlos Ruiz',
            integraciones: [
                { destino: 'Tesorería', protocolo: 'HTTPS/REST', metodo: 'API REST', frecuencia: 'En tiempo real', estado: 'Activo', responsable: 'Ing. Ana Torres' },
                { destino: 'RRHH', protocolo: 'HTTP/REST', metodo: 'JSON', frecuencia: 'Diario', estado: 'Activo', responsable: 'Ing. Pedro Ramírez' }
            ],
            evidencias: [
                { tipo: 'Contrato', nombre: 'contrato_finanzas.pdf', size: 1024000 },
                { tipo: 'Manual', nombre: 'manual_usuario.pdf', size: 512000 }
            ],
            urls: [
                { desc: 'Repositorio', url: 'https://github.com/unas/finanzas' }
            ],
            tiene_integraciones: true,
            observaciones_validador: [],
            estado_operativo: 'En Desarrollo'
        }
    ];

    localStorage.setItem(SISTEMAS_KEY, JSON.stringify(initial));
    return initial;
}

function guardarSistemas(sistemas) {
    localStorage.setItem(SISTEMAS_KEY, JSON.stringify(sistemas));
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
// VARIABLES GLOBALES
// ============================================================
let sistemas = getSistemas();
let sistemaEnEdicion = null;
let modoModal = 'registrar';
let tabActual = 0;
const tabs = ['general', 'tipo', 'desarrollo', 'arquitectura', 'bd', 'integraciones', 'evidencias', 'resumen'];
let evidenciasSubidas = [];
let urlsAgregadas = [];
let integracionEditandoIndex = null;

// ============================================================
// RENDERIZAR TABLA (CON BOTONES CONDICIONALES)
// ============================================================
function renderizarTabla(lista) {
    const container = document.getElementById('tabla-sistemas');
    if (!container) {
        console.error('No se encontró el contenedor de la tabla');
        return;
    }

    const data = lista || sistemas;

    if (!Array.isArray(data)) {
        console.error('Los datos no son un array:', data);
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">Error al cargar los datos</div>';
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<div class="empty" style="text-align:center;padding:40px;color:var(--muted);">📭 No hay sistemas registrados</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Sistema</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Criticidad</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(s => {
        const codigo = s.codigo || 'SIN-COD';
        const nombre = s.nombre || 'Sin nombre';
        const tipo = s.tipo || '-';
        const estado = s.estado || 'Borrador';
        const criticidad = s.criticidad || 'Baja';
        const fecha = s.fecha || new Date().toLocaleDateString('es-PE');

        const estadoClase = estado === 'Validado' ? 'status-success' :
            estado === 'Observado' ? 'status-danger' :
                estado === 'Enviado' ? 'status-info' : 'status-secondary';

        const criticidadClase = criticidad === 'Crítica' ? 'status-danger' :
            criticidad === 'Alta' ? 'status-warning' :
                criticidad === 'Media' ? 'status-info' : 'status-success';

        html += `
            <tr>
                <td><strong>${codigo}</strong></td>
                <td>${nombre}</td>
                <td>${tipo}</td>
                <td><span class="badge ${estadoClase}">${estado}</span></td>
                <td><span class="badge ${criticidadClase}">${criticidad}</span></td>
                <td>${fecha}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-ghost btn-sm" onclick="verSistema('${s.id}')">👁 Ver</button>
                        ${estado === 'Borrador' ? `<button class="btn btn-ghost btn-sm" onclick="editarSistema('${s.id}')">✏ Editar</button>` : ''}
                        ${estado === 'Observado' ? `<button class="btn btn-verde btn-sm" onclick="corregirSistema('${s.id}')">🔧 Corregir</button>` : ''}
                    </div>
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
// FILTRAR Y BUSCAR
// ============================================================
function filtrarSistemas() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const estado = document.getElementById('filter-estado').value;
    const area = document.getElementById('filter-area').value;
    const tipo = document.getElementById('filter-tipo').value;
    const criticidad = document.getElementById('filter-criticidad').value;

    let filtrados = sistemas.filter(s => {
        const matchSearch = s.codigo.toLowerCase().includes(search) || s.nombre.toLowerCase().includes(search);
        if (!matchSearch) return false;
        if (estado && s.estado !== estado) return false;
        if (area && s.area !== area) return false;
        if (tipo && s.tipo !== tipo) return false;
        if (criticidad && s.criticidad !== criticidad) return false;
        return true;
    });

    renderizarTabla(filtrados);
}

// ============================================================
// ABRIR MODALES
// ============================================================
function abrirModalRegistro() {
    modoModal = 'registrar';
    sistemaEnEdicion = null;
    tabActual = 0;
    evidenciasSubidas = [];
    urlsAgregadas = [];
    document.getElementById('modal-titulo').textContent = 'Registrar Nuevo Sistema';
    document.getElementById('modal-subtitulo').textContent = 'Complete toda la información del sistema';
    document.getElementById('modal-sistema').classList.add('open');
    renderizarModalContenido(null);
}

function verSistema(id) {
    const sistema = sistemas.find(s => s.id === id);
    if (!sistema) { alert('Sistema no encontrado'); return; }
    modoModal = 'ver';
    sistemaEnEdicion = JSON.parse(JSON.stringify(sistema));
    tabActual = 0;
    evidenciasSubidas = sistema.evidencias ? [...sistema.evidencias] : [];
    urlsAgregadas = sistema.urls ? [...sistema.urls] : [];
    document.getElementById('modal-titulo').textContent = '👁 Ver Sistema: ' + sistema.codigo;
    document.getElementById('modal-subtitulo').textContent = 'Información de solo lectura';
    document.getElementById('modal-sistema').classList.add('open');
    renderizarModalContenido(sistemaEnEdicion, true);
}

function editarSistema(id) {
    const sistema = sistemas.find(s => s.id === id);
    if (!sistema) { alert('Sistema no encontrado'); return; }
    modoModal = 'editar';
    sistemaEnEdicion = JSON.parse(JSON.stringify(sistema));
    tabActual = 0;
    evidenciasSubidas = sistema.evidencias ? [...sistema.evidencias] : [];
    urlsAgregadas = sistema.urls ? [...sistema.urls] : [];
    document.getElementById('modal-titulo').textContent = '✏ Editar Sistema: ' + sistema.codigo;
    document.getElementById('modal-subtitulo').textContent = 'Modifique la información del sistema';
    document.getElementById('modal-sistema').classList.add('open');
    renderizarModalContenido(sistemaEnEdicion);
}

function corregirSistema(id) {
    const sistema = sistemas.find(s => s.id === id);
    if (!sistema) { alert('Sistema no encontrado'); return; }
    modoModal = 'corregir';
    sistemaEnEdicion = JSON.parse(JSON.stringify(sistema));
    tabActual = 0;
    evidenciasSubidas = sistema.evidencias ? [...sistema.evidencias] : [];
    urlsAgregadas = sistema.urls ? [...sistema.urls] : [];
    document.getElementById('modal-titulo').textContent = '🔧 Corregir Sistema: ' + sistema.codigo;
    document.getElementById('modal-subtitulo').textContent = 'Corrija las observaciones del validador';
    document.getElementById('modal-sistema').classList.add('open');
    renderizarModalContenido(sistemaEnEdicion, false, true);
}

function cerrarModalSistema() {
    document.getElementById('modal-sistema').classList.remove('open');
    sistemaEnEdicion = null;
    evidenciasSubidas = [];
    urlsAgregadas = [];
}

// ============================================================
// CALCULAR PORCENTAJE DE COMPLETITUD
// ============================================================
function calcularPorcentaje(data) {
    const tieneIntegraciones = data.tiene_integraciones !== undefined &&
        data.tiene_integraciones !== null &&
        data.tiene_integraciones !== '';

    const secciones = {
        'General': !!(data.nombre && data.nombre.trim() !== '' && data.area && data.responsable_tecnico && data.responsable_tecnico.trim() !== '' && data.criticidad),
        'Tipo': !!data.tipo,
        'Desarrollo': true,
        'Arquitectura': !!(data.arquitectura && data.arquitectura.trim() !== ''),
        'BD': !!(data.motor_bd),
        'Integraciones': tieneIntegraciones,
        'Evidencias': evidenciasSubidas.length > 0 || (data.evidencias && data.evidencias.length > 0)
    };
    const completas = Object.values(secciones).filter(v => v).length;
    const total = Object.keys(secciones).length;
    return Math.round((completas / total) * 100);
}

// ============================================================
// MANEJO DE EVIDENCIAS
// ============================================================
function subirEvidencia(tipo, inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ El archivo no debe superar los 5MB.');
        inputElement.value = '';
        return;
    }

    const tiposPermitidos = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!tiposPermitidos.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|doc|docx)$/i)) {
        alert('⚠️ Solo se permiten archivos PDF, PNG, JPG, DOC o DOCX.');
        inputElement.value = '';
        return;
    }

    const existingIndex = evidenciasSubidas.findIndex(e => e.tipo === tipo);
    if (existingIndex !== -1) {
        evidenciasSubidas[existingIndex] = { tipo, nombre: file.name, size: file.size };
    } else {
        evidenciasSubidas.push({ tipo, nombre: file.name, size: file.size });
    }

    actualizarListaEvidencias();
    actualizarResumen();

    inputElement.style.borderColor = '#28a745';
    inputElement.style.borderWidth = '2px';
    setTimeout(() => {
        inputElement.style.borderColor = '';
        inputElement.style.borderWidth = '';
    }, 2000);

    inputElement.value = '';
}

function actualizarListaEvidencias() {
    const lista = document.querySelector('#tab-evidencias .archivos-subidos-lista');
    if (!lista) return;

    const esSoloLectura = modoModal === 'ver';

    if (evidenciasSubidas.length === 0) {
        lista.innerHTML = '<p style="color:var(--muted);font-size:13px;">No hay archivos subidos</p>';
    } else {
        lista.innerHTML = evidenciasSubidas.map(e =>
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
                <span>📄 <strong>${e.tipo}:</strong> ${e.nombre} (${(e.size / 1024).toFixed(1)} KB)</span>
                ${!esSoloLectura ? `<button class="btn btn-danger btn-sm" onclick="eliminarEvidencia('${e.tipo}')">✕</button>` : ''}
            </div>`
        ).join('');
    }

    actualizarResumen();
}

function eliminarEvidencia(tipo) {
    evidenciasSubidas = evidenciasSubidas.filter(e => e.tipo !== tipo);
    actualizarListaEvidencias();
    actualizarResumen();
}

// ============================================================
// AGREGAR URL
// ============================================================
function agregarUrl() {
    const urlInput = document.getElementById('campo-url');
    const descInput = document.getElementById('campo-url-desc');

    const url = urlInput?.value?.trim();
    const desc = descInput?.value?.trim() || 'URL';

    if (!url) {
        alert('⚠️ Ingresa una URL válida.');
        return;
    }

    try {
        new URL(url);
    } catch (e) {
        alert('⚠️ La URL no es válida. Debe comenzar con http:// o https://');
        return;
    }

    urlsAgregadas.push({ desc, url });

    urlInput.value = '';
    descInput.value = '';

    actualizarListaUrls();
    actualizarResumen();
}

function actualizarListaUrls() {
    const lista = document.querySelector('#tab-evidencias .urls-agregadas-lista');
    if (!lista) return;

    const esSoloLectura = modoModal === 'ver';

    if (urlsAgregadas.length === 0) {
        lista.innerHTML = '<p style="color:var(--muted);font-size:13px;">No hay URLs agregadas</p>';
    } else {
        lista.innerHTML = urlsAgregadas.map(u =>
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
                <span>🔗 <strong>${u.desc}:</strong> <a href="${u.url}" target="_blank" style="color:var(--color-azul-ctic);">${u.url}</a></span>
                ${!esSoloLectura ? `<button class="btn btn-danger btn-sm" onclick="eliminarUrl('${u.url}')">✕</button>` : ''}
            </div>`
        ).join('');
    }

    actualizarResumen();
}

function eliminarUrl(url) {
    urlsAgregadas = urlsAgregadas.filter(u => u.url !== url);
    actualizarListaUrls();
    actualizarResumen();
}

// ============================================================
// FUNCIONES PARA INTEGRACIONES
// ============================================================
function toggleIntegraciones(valor) {
    const content = document.getElementById('integraciones-content');
    const errorEl = document.getElementById('error-integraciones');

    if (errorEl) errorEl.classList.remove('visible');

    if (sistemaEnEdicion) {
        sistemaEnEdicion.tiene_integraciones = valor;
        if (!valor) {
            sistemaEnEdicion.integraciones = [];
        }
    }

    if (valor) {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
        actualizarTablaIntegraciones([]);
    }

    actualizarResumen();
}

function abrirModalIntegracion() {
    integracionEditandoIndex = null;
    document.getElementById('modal-integracion-titulo').textContent = 'Agregar Integración';
    document.getElementById('btn-guardar-integracion').textContent = 'Guardar Integración';

    document.getElementById('integracion-destino').value = '';
    document.getElementById('integracion-protocolo').value = 'HTTP/REST';
    document.getElementById('integracion-metodo').value = 'API REST';
    document.getElementById('integracion-frecuencia').value = 'En tiempo real';
    document.getElementById('integracion-estado').value = 'Activo';
    document.getElementById('integracion-responsable').value = '';

    document.getElementById('modal-integracion').classList.add('open');
}

function editarIntegracion(index) {
    const integs = sistemaEnEdicion?.integraciones || [];
    if (index >= integs.length) return;

    const integ = integs[index];
    integracionEditandoIndex = index;

    document.getElementById('modal-integracion-titulo').textContent = 'Editar Integración';
    document.getElementById('btn-guardar-integracion').textContent = 'Guardar Cambios';

    document.getElementById('integracion-destino').value = integ.destino || '';
    document.getElementById('integracion-protocolo').value = integ.protocolo || 'HTTP/REST';
    document.getElementById('integracion-metodo').value = integ.metodo || 'API REST';
    document.getElementById('integracion-frecuencia').value = integ.frecuencia || 'En tiempo real';
    document.getElementById('integracion-estado').value = integ.estado || 'Activo';
    document.getElementById('integracion-responsable').value = integ.responsable || '';

    document.getElementById('modal-integracion').classList.add('open');
}

function cerrarModalIntegracion() {
    document.getElementById('modal-integracion').classList.remove('open');
    integracionEditandoIndex = null;
}

function guardarIntegracion() {
    const destino = document.getElementById('integracion-destino').value.trim();
    const protocolo = document.getElementById('integracion-protocolo').value;
    const metodo = document.getElementById('integracion-metodo').value;
    const frecuencia = document.getElementById('integracion-frecuencia').value;
    const estado = document.getElementById('integracion-estado').value;
    const responsable = document.getElementById('integracion-responsable').value.trim();

    if (!destino) {
        alert('⚠️ El campo "Sistema Destino" es obligatorio.');
        document.getElementById('integracion-destino').focus();
        return;
    }
    if (!responsable) {
        alert('⚠️ El campo "Responsable" es obligatorio.');
        document.getElementById('integracion-responsable').focus();
        return;
    }

    if (!sistemaEnEdicion) {
        sistemaEnEdicion = {};
    }
    if (!sistemaEnEdicion.integraciones) {
        sistemaEnEdicion.integraciones = [];
    }

    const nuevaIntegracion = {
        destino,
        protocolo,
        metodo,
        frecuencia,
        estado,
        responsable
    };

    if (integracionEditandoIndex !== null && integracionEditandoIndex < sistemaEnEdicion.integraciones.length) {
        sistemaEnEdicion.integraciones[integracionEditandoIndex] = nuevaIntegracion;
    } else {
        sistemaEnEdicion.integraciones.push(nuevaIntegracion);
        sistemaEnEdicion.tiene_integraciones = true;
        const radioSi = document.querySelector('input[name="tiene-integraciones"][value="true"]');
        if (radioSi) {
            radioSi.checked = true;
        }
        const content = document.getElementById('integraciones-content');
        if (content) content.style.display = 'block';
    }

    actualizarTablaIntegraciones(sistemaEnEdicion.integraciones);
    cerrarModalIntegracion();
    actualizarResumen();
    alert('✅ Integración guardada correctamente.');
}

function eliminarIntegracion(index) {
    if (!sistemaEnEdicion || !sistemaEnEdicion.integraciones) return;

    if (confirm('¿Eliminar esta integración?')) {
        sistemaEnEdicion.integraciones.splice(index, 1);
        actualizarTablaIntegraciones(sistemaEnEdicion.integraciones);
        actualizarResumen();

        if (sistemaEnEdicion.integraciones.length === 0) {
            const radioNo = document.querySelector('input[name="tiene-integraciones"][value="false"]');
            if (radioNo) {
                radioNo.checked = true;
            }
            toggleIntegraciones(false);
        }
    }
}

function actualizarTablaIntegraciones(integraciones) {
    const container = document.getElementById('integraciones-lista');
    if (!container) return;

    if (!integraciones || integraciones.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);font-size:13px;" id="no-integraciones-msg">No hay integraciones registradas</p>';
        return;
    }

    const esSoloLectura = modoModal === 'ver';

    let html = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Sistema Destino</th>
                        <th>Método</th>
                        <th>Frecuencia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    integraciones.forEach((i, idx) => {
        html += `
            <tr data-index="${idx}">
                <td>${i.destino}</td>
                <td>${i.metodo}</td>
                <td>${i.frecuencia || '—'}</td>
                <td>
                    ${!esSoloLectura ? `
                        <button class="btn btn-ghost btn-sm" onclick="editarIntegracion(${idx})">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarIntegracion(${idx})">🗑️</button>
                    ` : ''}
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================================
// RENDERIZAR CONTENIDO DEL MODAL
// ============================================================
function renderizarModalContenido(sistema, soloLectura = false, modoCorregir = false) {
    const container = document.getElementById('modal-body-sistema');
    const isNew = !sistema;
    const data = sistema || {};

    if (!isNew && !data.id) {
        cerrarModalSistema();
        return;
    }

    const codigo = data.codigo || 'SIS' + String(sistemas.length + 1).padStart(3, '0');
    const estado = data.estado || 'Borrador';
    const estadoClase = estado === 'Validado' ? 'validado' :
        estado === 'Observado' ? 'observado' :
            estado === 'Enviado' ? 'enviado' : 'borrador';

    const camposObservados = {};
    if (modoCorregir && data.observaciones_validador) {
        data.observaciones_validador.forEach(obs => {
            camposObservados[obs.campo] = obs.mensaje;
        });
    }

    const tabLabels = ['1. General', '2. Tipo', '3. Desarrollo', '4. Arquitectura', '5. BD', '6. Integraciones', '7. Evidencias', '8. Resumen'];

    let html = `
        <div class="modal-tabs" id="modal-tabs">
            ${tabLabels.map((label, i) => `
                <button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="tab-${tabs[i]}" onclick="cambiarTab(${i})">
                    ${label}
                </button>
            `).join('')}
        </div>
        <div id="modal-tab-content">
    `;

    // ===== PESTAÑA 1: GENERAL =====
    html += `
        <div class="tab-content ${tabActual === 0 ? 'active' : ''}" id="tab-general">
            <div class="form-group" data-campo="codigo">
                <label>Código <span class="required">*</span></label>
                <input type="text" value="${codigo}" disabled style="background:#f2f4f7;color:#64757a;">
                <div class="field-hint">El código se genera automáticamente</div>
            </div>
            <div class="form-group" data-campo="nombre">
                <label>Nombre del sistema <span class="required">*</span></label>
                <input type="text" id="campo-nombre" value="${data.nombre || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ingrese el nombre del sistema" oninput="actualizarResumen()">
                <div class="field-error" id="error-nombre">Este campo es obligatorio</div>
                ${camposObservados['nombre'] ? `<div class="observacion-validador">🔴 ${camposObservados['nombre']}</div>` : ''}
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea id="campo-descripcion" ${soloLectura ? 'disabled' : ''} placeholder="Descripción del sistema" oninput="actualizarResumen()">${data.descripcion || ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group" data-campo="area">
                    <label>Área usuaria <span class="required">*</span></label>
                    <select id="campo-area" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="">Seleccionar</option>
                        <option value="Académico" ${data.area === 'Académico' ? 'selected' : ''}>Académico</option>
                        <option value="Biblioteca" ${data.area === 'Biblioteca' ? 'selected' : ''}>Biblioteca</option>
                        <option value="Finanzas" ${data.area === 'Finanzas' ? 'selected' : ''}>Finanzas</option>
                        <option value="Recursos Humanos" ${data.area === 'Recursos Humanos' ? 'selected' : ''}>Recursos Humanos</option>
                        <option value="Investigación" ${data.area === 'Investigación' ? 'selected' : ''}>Investigación</option>
                        <option value="Logística" ${data.area === 'Logística' ? 'selected' : ''}>Logística</option>
                        <option value="Tesorería" ${data.area === 'Tesorería' ? 'selected' : ''}>Tesorería</option>
                    </select>
                    <div class="field-error" id="error-area">Este campo es obligatorio</div>
                    ${camposObservados['area'] ? `<div class="observacion-validador">🔴 ${camposObservados['area']}</div>` : ''}
                </div>
                <div class="form-group" data-campo="responsable_tecnico">
                    <label>Responsable técnico <span class="required">*</span></label>
                    <input type="text" id="campo-responsable-tecnico" value="${data.responsable_tecnico || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Nombre del responsable técnico" oninput="actualizarResumen()">
                    <div class="field-error" id="error-responsable">Este campo es obligatorio</div>
                    ${camposObservados['responsable_tecnico'] ? `<div class="observacion-validador">🔴 ${camposObservados['responsable_tecnico']}</div>` : ''}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Responsable funcional</label>
                    <input type="text" id="campo-responsable-funcional" value="${data.responsable_funcional || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Nombre del responsable funcional" oninput="actualizarResumen()">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <div class="estado-automatico ${estadoClase}">${estado}</div>
                    <div class="field-hint">El estado se actualiza automáticamente</div>
                </div>
            </div>
            <div class="form-group" data-campo="criticidad">
                <label>Criticidad <span class="required">*</span></label>
                <select id="campo-criticidad" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                    <option value="">Seleccionar</option>
                    <option value="Baja" ${data.criticidad === 'Baja' ? 'selected' : ''}>Baja</option>
                    <option value="Media" ${data.criticidad === 'Media' ? 'selected' : ''}>Media</option>
                    <option value="Alta" ${data.criticidad === 'Alta' ? 'selected' : ''}>Alta</option>
                    <option value="Crítica" ${data.criticidad === 'Crítica' ? 'selected' : ''}>Crítica / Misión Crítica</option>
                </select>
                <div class="field-error" id="error-criticidad">Este campo es obligatorio</div>
                ${camposObservados['criticidad'] ? `<div class="observacion-validador">🔴 ${camposObservados['criticidad']}</div>` : ''}
            </div>
            <div class="form-group">
                <label>Estado operativo</label>
                <select id="campo-estado-operativo" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                    <option value="En Desarrollo" ${data.estado_operativo === 'En Desarrollo' ? 'selected' : ''}>En Desarrollo</option>
                    <option value="Activo / En Producción" ${data.estado_operativo === 'Activo / En Producción' ? 'selected' : ''}>Activo / En Producción</option>
                    <option value="Inactivo" ${data.estado_operativo === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                    <option value="Obsoleto" ${data.estado_operativo === 'Obsoleto' ? 'selected' : ''}>Obsoleto</option>
                    <option value="Retirado" ${data.estado_operativo === 'Retirado' ? 'selected' : ''}>Retirado</option>
                </select>
            </div>
        </div>
    `;

    // ===== PESTAÑA 2: TIPO =====
    html += `
        <div class="tab-content ${tabActual === 1 ? 'active' : ''}" id="tab-tipo">
            <div class="checkbox-group">
                ${['Web', 'Desktop', 'API', 'Mobile', 'Legacy', 'Batch', 'IoT', 'Otro'].map(t => `
                    <label>
                        <input type="radio" name="tipo-sistema" value="${t}" ${data.tipo === t ? 'checked' : ''} ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        ${t}
                    </label>
                `).join('')}
            </div>
            <div class="form-group" style="margin-top:12px;">
                <label>Especificar (si seleccionó Otro)</label>
                <input type="text" id="campo-tipo-otro" value="${data.tipo_otro || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Especificar tipo" oninput="actualizarResumen()">
            </div>
            <div class="field-error" id="error-tipo">Debe seleccionar un tipo de sistema</div>
        </div>
    `;

    // ===== PESTAÑA 3: DESARROLLO =====
    html += `
        <div class="tab-content ${tabActual === 2 ? 'active' : ''}" id="tab-desarrollo">
            <div class="form-row">
                <div class="form-group">
                    <label>Año de desarrollo</label>
                    <input type="number" id="campo-anio" value="${data.anio_desarrollo || ''}" ${soloLectura ? 'disabled' : ''} placeholder="2024" oninput="actualizarResumen()">
                </div>
                <div class="form-group">
                    <label>Forma de adquisición</label>
                    <select id="campo-adquisicion" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="">Seleccionar</option>
                        <option value="Desarrollo interno CTIC" ${data.adquisicion === 'Desarrollo interno CTIC' ? 'selected' : ''}>Desarrollo interno CTIC</option>
                        <option value="Proveedor externo" ${data.adquisicion === 'Proveedor externo' ? 'selected' : ''}>Proveedor externo</option>
                        <option value="Convenio" ${data.adquisicion === 'Convenio' ? 'selected' : ''}>Convenio</option>
                        <option value="Compra directa" ${data.adquisicion === 'Compra directa' ? 'selected' : ''}>Compra directa</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Empresa desarrolladora</label>
                    <input type="text" id="campo-empresa" value="${data.empresa || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Nombre de la empresa" oninput="actualizarResumen()">
                </div>
                <div class="form-group">
                    <label>Contrato vigente</label>
                    <select id="campo-contrato" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="Si" ${data.contrato === 'Si' ? 'selected' : ''}>Si</option>
                        <option value="No" ${data.contrato === 'No' ? 'selected' : ''}>No</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Fecha de soporte</label>
                    <input type="date" id="campo-soporte" value="${data.fecha_soporte || ''}" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                </div>
                <div class="form-group">
                    <label>Observaciones</label>
                    <textarea id="campo-obs-desarrollo" ${soloLectura ? 'disabled' : ''} placeholder="Observaciones adicionales" oninput="actualizarResumen()">${data.observaciones || ''}</textarea>
                </div>
            </div>
        </div>
    `;

    // ===== PESTAÑA 4: ARQUITECTURA =====
    html += `
        <div class="tab-content ${tabActual === 3 ? 'active' : ''}" id="tab-arquitectura">
            <div class="form-row">
                <div class="form-group" data-campo="lenguaje">
                    <label>Lenguaje</label>
                    <input type="text" id="campo-lenguaje" value="${data.lenguaje || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ej. PHP, Java, Python" oninput="actualizarResumen()">
                </div>
                <div class="form-group">
                    <label>Versión lenguaje</label>
                    <input type="text" id="campo-version-lenguaje" value="${data.version_lenguaje || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ej. 8.2" oninput="actualizarResumen()">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Framework</label>
                    <input type="text" id="campo-framework" value="${data.framework || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ej. Laravel, Spring Boot" oninput="actualizarResumen()">
                </div>
                <div class="form-group">
                    <label>Versión framework</label>
                    <input type="text" id="campo-version-framework" value="${data.version_framework || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ej. 10.0" oninput="actualizarResumen()">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" data-campo="arquitectura">
                    <label>Arquitectura <span class="required">*</span></label>
                    <input type="text" id="campo-arquitectura" value="${data.arquitectura || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ej. MVC, Hexagonal" oninput="actualizarResumen()">
                    <div class="field-error" id="error-arquitectura">Este campo es obligatorio</div>
                    ${camposObservados['arquitectura'] ? `<div class="observacion-validador">🔴 ${camposObservados['arquitectura']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label>Patrón</label>
                    <input type="text" id="campo-patron" value="${data.patron || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ej. Repository, Factory" oninput="actualizarResumen()">
                </div>
            </div>
            <div class="form-group" data-campo="repositorio">
                <label>Repositorio Git</label>
                <input type="text" id="campo-repositorio" value="${data.repositorio || ''}" ${soloLectura ? 'disabled' : ''} placeholder="URL del repositorio Git" oninput="actualizarResumen()">
                ${camposObservados['repositorio'] ? `<div class="observacion-validador">🔴 ${camposObservados['repositorio']}</div>` : ''}
            </div>
            <div class="form-group">
                <label>Tecnologías complementarias</label>
                <textarea id="campo-tecnologias" ${soloLectura ? 'disabled' : ''} placeholder="Ej. Redis, Elasticsearch, Kafka" oninput="actualizarResumen()">${data.tecnologias || ''}</textarea>
            </div>
        </div>
    `;

    // ===== PESTAÑA 5: BASE DE DATOS =====
    html += `
        <div class="tab-content ${tabActual === 4 ? 'active' : ''}" id="tab-bd">
            <div class="form-row">
                <div class="form-group" data-campo="motor_bd">
                    <label>Motor de Base de Datos <span class="required">*</span></label>
                    <select id="campo-motor-bd" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="">Seleccionar</option>
                        <option value="PostgreSQL" ${data.motor_bd === 'PostgreSQL' ? 'selected' : ''}>PostgreSQL</option>
                        <option value="MySQL" ${data.motor_bd === 'MySQL' ? 'selected' : ''}>MySQL</option>
                        <option value="SQL Server" ${data.motor_bd === 'SQL Server' ? 'selected' : ''}>SQL Server</option>
                        <option value="Oracle" ${data.motor_bd === 'Oracle' ? 'selected' : ''}>Oracle</option>
                        <option value="Access" ${data.motor_bd === 'Access' ? 'selected' : ''}>Access</option>
                    </select>
                    <div class="field-error" id="error-motor-bd">Este campo es obligatorio</div>
                    ${camposObservados['motor_bd'] ? `<div class="observacion-validador">🔴 ${camposObservados['motor_bd']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label>Versión</label>
                    <input type="text" id="campo-version-bd" value="${data.version_bd || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Ej. 15.0" oninput="actualizarResumen()">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Tipo de BD</label>
                    <select id="campo-tipo-bd" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="Relacional" ${data.tipo_bd === 'Relacional' ? 'selected' : ''}>Relacional</option>
                        <option value="NoSQL" ${data.tipo_bd === 'NoSQL' ? 'selected' : ''}>NoSQL</option>
                        <option value="Documental" ${data.tipo_bd === 'Documental' ? 'selected' : ''}>Documental</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Servidor</label>
                    <input type="text" id="campo-servidor" value="${data.servidor || ''}" ${soloLectura ? 'disabled' : ''} placeholder="IP o nombre del servidor" oninput="actualizarResumen()">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Esquema</label>
                    <input type="text" id="campo-esquema" value="${data.esquema || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Nombre del esquema" oninput="actualizarResumen()">
                </div>
                <div class="form-group">
                    <label>Backup</label>
                    <select id="campo-backup" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="Si" ${data.backup === 'Si' ? 'selected' : ''}>Si</option>
                        <option value="No" ${data.backup === 'No' ? 'selected' : ''}>No</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Frecuencia Backup</label>
                    <select id="campo-frecuencia" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="Diario" ${data.frecuencia_backup === 'Diario' ? 'selected' : ''}>Diario</option>
                        <option value="Semanal" ${data.frecuencia_backup === 'Semanal' ? 'selected' : ''}>Semanal</option>
                        <option value="Quincenal" ${data.frecuencia_backup === 'Quincenal' ? 'selected' : ''}>Quincenal</option>
                        <option value="Mensual" ${data.frecuencia_backup === 'Mensual' ? 'selected' : ''}>Mensual</option>
                        <option value="No aplica" ${data.frecuencia_backup === 'No aplica' ? 'selected' : ''}>No aplica</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Cifrado</label>
                    <select id="campo-cifrado" ${soloLectura ? 'disabled' : ''} onchange="actualizarResumen()">
                        <option value="Si" ${data.cifrado === 'Si' ? 'selected' : ''}>Si</option>
                        <option value="No" ${data.cifrado === 'No' ? 'selected' : ''}>No</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Responsable BD</label>
                <input type="text" id="campo-responsable-bd" value="${data.responsable_bd || ''}" ${soloLectura ? 'disabled' : ''} placeholder="Nombre del responsable" oninput="actualizarResumen()">
            </div>
        </div>
    `;

    // ===== PESTAÑA 6: INTEGRACIONES =====
    const integs = data.integraciones || [];
    let tieneIntegracionesValor = data.tiene_integraciones;
    if (tieneIntegracionesValor === undefined || tieneIntegracionesValor === null) {
        tieneIntegracionesValor = false;
    }

    html += `
        <div class="tab-content ${tabActual === 5 ? 'active' : ''}" id="tab-integraciones">
            <div class="form-group" data-campo="tiene_integraciones">
                <label>¿Tiene integraciones? <span class="required">*</span></label>
                <div class="radio-group" style="display:flex;gap:20px;margin-top:6px;">
                    <label style="display:flex;align-items:center;gap:6px;font-weight:400;cursor:pointer;">
                        <input type="radio" name="tiene-integraciones" value="true" ${tieneIntegracionesValor ? 'checked' : ''} ${soloLectura ? 'disabled' : ''} onchange="toggleIntegraciones(true)">
                        Sí
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;font-weight:400;cursor:pointer;">
                        <input type="radio" name="tiene-integraciones" value="false" ${!tieneIntegracionesValor ? 'checked' : ''} ${soloLectura ? 'disabled' : ''} onchange="toggleIntegraciones(false)">
                        No
                    </label>
                </div>
                <div class="field-error" id="error-integraciones">Este campo es obligatorio</div>
            </div>

            <div id="integraciones-content" style="${tieneIntegracionesValor ? 'display:block;' : 'display:none;'}">
                ${!soloLectura ? `<button class="btn btn-verde btn-sm" onclick="abrirModalIntegracion()" style="margin-bottom:12px;">➕ Agregar Integración</button>` : ''}
                
                <div id="integraciones-lista">
                    ${integs.length > 0 ? `
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sistema Destino</th>
                                        <th>Método</th>
                                        <th>Frecuencia</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${integs.map((i, idx) => `
                                        <tr data-index="${idx}">
                                            <td>${i.destino}</td>
                                            <td>${i.metodo}</td>
                                            <td>${i.frecuencia || '—'}</td>
                                            <td>
                                                ${!soloLectura ? `
                                                    <button class="btn btn-ghost btn-sm" onclick="editarIntegracion(${idx})">✏️</button>
                                                    <button class="btn btn-danger btn-sm" onclick="eliminarIntegracion(${idx})">🗑️</button>
                                                ` : ''}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p style="color:var(--muted);font-size:13px;">No hay integraciones registradas</p>'}
                </div>
            </div>
        </div>

        <!-- MODAL PARA AGREGAR/EDITAR INTEGRACIÓN -->
        <div class="modal-overlay" id="modal-integracion">
            <div class="modal" style="width:min(550px,100%);">
                <div class="modal-head">
                    <h3 id="modal-integracion-titulo">Agregar Integración</h3>
                    <button class="modal-close" onclick="cerrarModalIntegracion()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Sistema Origen</label>
                        <input type="text" id="integracion-origen" value="Este sistema" readonly style="background:#f2f4f7;color:#64757a;">
                    </div>
                    <div class="form-group">
                        <label>Sistema Destino <span class="required">*</span></label>
                        <input type="text" id="integracion-destino" placeholder="Ej. ERP Financiero">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Protocolo <span class="required">*</span></label>
                            <select id="integracion-protocolo">
                                <option value="HTTP/REST">HTTP/REST</option>
                                <option value="HTTPS/REST">HTTPS/REST</option>
                                <option value="SOAP">SOAP</option>
                                <option value="GraphQL">GraphQL</option>
                                <option value="WebSocket">WebSocket</option>
                                <option value="FTP">FTP</option>
                                <option value="SMTP">SMTP</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Método de intercambio <span class="required">*</span></label>
                            <select id="integracion-metodo">
                                <option value="API REST">API REST</option>
                                <option value="SOAP">SOAP</option>
                                <option value="JSON">JSON</option>
                                <option value="XML">XML</option>
                                <option value="BD Directa">BD Directa</option>
                                <option value="Archivo">Archivo</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Frecuencia</label>
                            <select id="integracion-frecuencia">
                                <option value="En tiempo real">En tiempo real</option>
                                <option value="Diario">Diario</option>
                                <option value="Semanal">Semanal</option>
                                <option value="Quincenal">Quincenal</option>
                                <option value="Mensual">Mensual</option>
                                <option value="Por evento">Por evento</option>
                                <option value="Bajo demanda">Bajo demanda</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado</label>
                            <select id="integracion-estado">
                                <option value="Activo">Activo</option>
                                <option value="En desarrollo">En desarrollo</option>
                                <option value="Inactivo">Inactivo</option>
                                <option value="Obsoleto">Obsoleto</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Responsable <span class="required">*</span></label>
                        <input type="text" id="integracion-responsable" placeholder="Nombre del responsable o área">
                    </div>
                </div>
                <div class="modal-foot">
                    <button class="btn btn-secondary" onclick="cerrarModalIntegracion()">Cancelar</button>
                    <button class="btn btn-verde" id="btn-guardar-integracion" onclick="guardarIntegracion()">Guardar Integración</button>
                </div>
            </div>
        </div>
    `;

    // ===== PESTAÑA 7: EVIDENCIAS =====
    html += `
        <div class="tab-content ${tabActual === 6 ? 'active' : ''}" id="tab-evidencias">
            <div class="form-group" data-campo="evidencias">
                <label>Evidencias <span class="required">*</span></label>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:12px;">
                    ${['Manual', 'Documento técnico', 'Contrato', 'Capturas', 'Certificados'].map(t => `
                        <div style="border:1px dashed var(--border);border-radius:10px;padding:12px;text-align:center;">
                            <label style="display:block;font-weight:600;font-size:13px;">${t}</label>
                            <input type="file" ${soloLectura ? 'disabled' : ''} style="margin-top:8px;font-size:12px;width:100%;" 
                                   onchange="subirEvidencia('${t}', this)">
                        </div>
                    `).join('')}
                </div>
                <div class="field-error" id="error-evidencias">Debe subir al menos una evidencia</div>
                ${camposObservados['evidencias'] ? `<div class="observacion-validador">🔴 ${camposObservados['evidencias']}</div>` : ''}
            </div>
            <div style="margin-bottom:12px;">
                <h4 style="margin-bottom:6px;font-size:14px;">Archivos subidos</h4>
                <div class="archivos-subidos-lista">
                    ${evidenciasSubidas.length > 0 ? evidenciasSubidas.map(e => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
                            <span>📄 <strong>${e.tipo}:</strong> ${e.nombre} (${(e.size / 1024).toFixed(1)} KB)</span>
                            ${!soloLectura ? `<button class="btn btn-danger btn-sm" onclick="eliminarEvidencia('${e.tipo}')">✕</button>` : ''}
                        </div>
                    `).join('') : '<p style="color:var(--muted);font-size:13px;">No hay archivos subidos</p>'}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>URL</label>
                    <input type="text" id="campo-url" ${soloLectura ? 'disabled' : ''} placeholder="https://ejemplo.com">
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <input type="text" id="campo-url-desc" ${soloLectura ? 'disabled' : ''} placeholder="Descripción de la URL">
                </div>
            </div>
            ${!soloLectura ? `<button class="btn btn-verde btn-sm" onclick="agregarUrl()" style="margin-bottom:12px;">➕ Agregar URL</button>` : ''}
            <div>
                <h4 style="margin-bottom:6px;font-size:14px;">URLs agregadas</h4>
                <div class="urls-agregadas-lista">
                    ${urlsAgregadas.length > 0 ? urlsAgregadas.map(u => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
                            <span>🔗 <strong>${u.desc}:</strong> <a href="${u.url}" target="_blank" style="color:var(--color-azul-ctic);">${u.url}</a></span>
                            ${!soloLectura ? `<button class="btn btn-danger btn-sm" onclick="eliminarUrl('${u.url}')">✕</button>` : ''}
                        </div>
                    `).join('') : '<p style="color:var(--muted);font-size:13px;">No hay URLs agregadas</p>'}
                </div>
            </div>
        </div>
    `;

    // ===== PESTAÑA 8: RESUMEN =====
    const porcentaje = calcularPorcentaje(data);
    const secciones = {
        'General': !!(data.nombre && data.nombre.trim() !== '' && data.area && data.responsable_tecnico && data.responsable_tecnico.trim() !== '' && data.criticidad),
        'Tipo': !!data.tipo,
        'Desarrollo': true,
        'Arquitectura': !!(data.arquitectura && data.arquitectura.trim() !== ''),
        'BD': !!(data.motor_bd),
        'Integraciones': data.tiene_integraciones !== undefined && data.tiene_integraciones !== null && data.tiene_integraciones !== '',
        'Evidencias': evidenciasSubidas.length > 0 || (data.evidencias && data.evidencias.length > 0)
    };

    html += `
        <div class="tab-content ${tabActual === 7 ? 'active' : ''}" id="tab-resumen">
            <div class="porcentaje-completitud" id="resumen-porcentaje">
                <div class="numero" id="resumen-numero">${porcentaje}%</div>
                <div class="label">Completitud del sistema</div>
            </div>
            <div class="resumen-secciones" id="resumen-secciones">
                ${Object.keys(secciones).map(key => {
        const ok = secciones[key];
        return `
                        <div class="item">
                            ${ok ? '<span class="check">✔</span>' : '<span class="cross">✖</span>'}
                            ${key}
                            ${ok ? '' : '<span class="pendiente"> (pendiente)</span>'}
                        </div>
                    `;
    }).join('')}
            </div>
            <div style="margin-top:16px;padding:12px;background:#f8fafa;border-radius:8px;font-size:13px;">
                <strong>Código:</strong> ${codigo} &nbsp;|&nbsp;
                <strong>Estado:</strong> ${estado}
            </div>
        </div>
    `;

    html += `</div>`;

    container.innerHTML = html;

    if (soloLectura) {
        // Deshabilitar inputs, selects y textareas
        container.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
        });
        
        // Deshabilitar botones de acciones (agregar integración, agregar URL, etc.)
        // PERO NO deshabilitar los botones de las pestañas (.tab-btn)
        container.querySelectorAll('button:not(.tab-btn)').forEach(el => {
            // No deshabilitar el botón de cerrar del modal (está fuera del modal-body)
            if (!el.closest('.modal-close')) {
                el.disabled = true;
            }
        });
    }
    actualizarBotonEnviar(); // <--- SOLO LA LLAMADA
    actualizarResumen();
}

// ============================================================
// CAMBIAR PESTAÑA
// ============================================================
function cambiarTab(index) {
    const container = document.getElementById('modal-body-sistema');
    if (!container) return;

    tabActual = index;

    const tabsContainer = container.querySelector('.modal-tabs');
    if (tabsContainer) {
        tabsContainer.querySelectorAll('.tab-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === tabActual);
        });
    }

    container.querySelectorAll('.tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === tabActual);
    });

    actualizarBotonEnviar(); // <--- Reemplazado
    actualizarResumen();
}

// ============================================================
// ACTUALIZAR NAVEGACIÓN (Footer del modal) - OBSOLETO, ya no se usa
// ============================================================
// function actualizarNavegacion() { ... } // ELIMINADA

// ============================================================
// VALIDAR SECCIÓN ACTUAL - OBSOLETO, ya no se usa
// ============================================================
// function validarSeccionActual() { ... } // ELIMINADA

// ============================================================
// ACTUALIZAR RESUMEN EN TIEMPO REAL
// ============================================================
function actualizarResumen() {
    const container = document.getElementById('modal-body-sistema');
    if (!container) return;

    const nombre = document.getElementById('campo-nombre')?.value?.trim() || '';
    const area = document.getElementById('campo-area')?.value || '';
    const responsable_tecnico = document.getElementById('campo-responsable-tecnico')?.value?.trim() || '';
    const criticidad = document.getElementById('campo-criticidad')?.value || '';

    const tipoRadio = container.querySelector('input[name="tipo-sistema"]:checked');
    const tipo = tipoRadio ? tipoRadio.value : '';

    const arquitectura = document.getElementById('campo-arquitectura')?.value?.trim() || '';
    const motor_bd = document.getElementById('campo-motor-bd')?.value || '';

    const tieneIntegracionesRadio = document.querySelector('input[name="tiene-integraciones"]:checked');
    const tieneIntegraciones = tieneIntegracionesRadio ? tieneIntegracionesRadio.value === 'true' : false;

    const data = {
        nombre,
        area,
        responsable_tecnico,
        criticidad,
        tipo,
        arquitectura,
        motor_bd,
        tiene_integraciones: tieneIntegraciones,
        evidencias: evidenciasSubidas
    };

    const porcentaje = calcularPorcentaje(data);
    const secciones = {
        'General': !!(nombre && area && responsable_tecnico && criticidad),
        'Tipo': !!tipo,
        'Desarrollo': true,
        'Arquitectura': !!arquitectura,
        'BD': !!motor_bd,
        'Integraciones': tieneIntegraciones,
        'Evidencias': evidenciasSubidas.length > 0
    };

    const numeroEl = document.getElementById('resumen-numero');
    if (numeroEl) numeroEl.textContent = porcentaje + '%';

    const seccionesEl = document.getElementById('resumen-secciones');
    if (seccionesEl) {
        seccionesEl.innerHTML = Object.keys(secciones).map(key => {
            const ok = secciones[key];
            return `
                <div class="item">
                    ${ok ? '<span class="check">✔</span>' : '<span class="cross">✖</span>'}
                    ${key}
                    ${ok ? '' : '<span class="pendiente"> (pendiente)</span>'}
                </div>
            `;
        }).join('');
    }
}

// ============================================================
// GUARDAR SISTEMA MODAL (SIN VALIDACIONES)
// ============================================================
function guardarSistemaModal() {
    if (modoModal === 'ver') {
        cerrarModalSistema();
        return;
    }

    // --- Recoger datos del formulario (sin validar nada) ---
    const container = document.getElementById('modal-body-sistema');

    const nombre = document.getElementById('campo-nombre')?.value?.trim() || 'Sistema sin nombre';
    const descripcion = document.getElementById('campo-descripcion')?.value?.trim() || '';
    const area = document.getElementById('campo-area')?.value || '';
    const responsable_tecnico = document.getElementById('campo-responsable-tecnico')?.value?.trim() || '';
    const responsable_funcional = document.getElementById('campo-responsable-funcional')?.value?.trim() || '';
    const criticidad = document.getElementById('campo-criticidad')?.value || '';
    const estado_operativo = document.getElementById('campo-estado-operativo')?.value || 'En Desarrollo';

    const tipoRadio = container.querySelector('input[name="tipo-sistema"]:checked');
    const tipo = tipoRadio ? tipoRadio.value : '';
    const tipo_otro = document.getElementById('campo-tipo-otro')?.value?.trim() || '';

    const anio_desarrollo = document.getElementById('campo-anio')?.value || '';
    const adquisicion = document.getElementById('campo-adquisicion')?.value || '';
    const empresa = document.getElementById('campo-empresa')?.value?.trim() || '';
    const contrato = document.getElementById('campo-contrato')?.value || 'No';
    const fecha_soporte = document.getElementById('campo-soporte')?.value || '';
    const observaciones = document.getElementById('campo-obs-desarrollo')?.value?.trim() || '';

    const lenguaje = document.getElementById('campo-lenguaje')?.value?.trim() || '';
    const version_lenguaje = document.getElementById('campo-version-lenguaje')?.value?.trim() || '';
    const framework = document.getElementById('campo-framework')?.value?.trim() || '';
    const version_framework = document.getElementById('campo-version-framework')?.value?.trim() || '';
    const arquitectura = document.getElementById('campo-arquitectura')?.value?.trim() || '';
    const patron = document.getElementById('campo-patron')?.value?.trim() || '';
    const repositorio = document.getElementById('campo-repositorio')?.value?.trim() || '';
    const tecnologias = document.getElementById('campo-tecnologias')?.value?.trim() || '';

    const motor_bd = document.getElementById('campo-motor-bd')?.value || '';
    const version_bd = document.getElementById('campo-version-bd')?.value?.trim() || '';
    const tipo_bd = document.getElementById('campo-tipo-bd')?.value || 'Relacional';
    const servidor = document.getElementById('campo-servidor')?.value?.trim() || '';
    const esquema = document.getElementById('campo-esquema')?.value?.trim() || '';
    const backup = document.getElementById('campo-backup')?.value || 'No';
    const frecuencia_backup = document.getElementById('campo-frecuencia')?.value || '';
    const cifrado = document.getElementById('campo-cifrado')?.value || 'No';
    const responsable_bd = document.getElementById('campo-responsable-bd')?.value?.trim() || '';

    const tieneIntegracionesRadio = document.querySelector('input[name="tiene-integraciones"]:checked');
    const tiene_integraciones = tieneIntegracionesRadio ? tieneIntegracionesRadio.value === 'true' : false;

    const fecha = new Date().toLocaleDateString('es-PE');

    // --- Guardar ---
    if (modoModal === 'registrar') {
        const nuevoId = 'SIS' + String(sistemas.length + 1).padStart(3, '0');
        const nuevoSistema = {
            id: nuevoId,
            codigo: nuevoId,
            nombre,
            descripcion,
            area,
            responsable_tecnico,
            responsable_funcional,
            estado: 'Borrador',
            criticidad,
            fecha,
            tipo,
            tipo_otro,
            anio_desarrollo,
            adquisicion,
            empresa,
            contrato,
            fecha_soporte,
            observaciones,
            lenguaje,
            version_lenguaje,
            framework,
            version_framework,
            arquitectura,
            patron,
            repositorio,
            tecnologias,
            motor_bd,
            version_bd,
            tipo_bd,
            servidor,
            esquema,
            backup,
            frecuencia_backup,
            cifrado,
            responsable_bd,
            integraciones: sistemaEnEdicion?.integraciones || [],
            evidencias: evidenciasSubidas,
            urls: urlsAgregadas,
            tiene_integraciones: tiene_integraciones,
            observaciones_validador: [],
            estado_operativo
        };
        sistemas.push(nuevoSistema);
        guardarSistemas(sistemas);
        alert('✅ Sistema registrado correctamente como BORRADOR.');
    } else if (modoModal === 'editar' || modoModal === 'corregir') {
        const index = sistemas.findIndex(s => s.id === sistemaEnEdicion.id);
        if (index !== -1) {
            sistemas[index] = {
                ...sistemas[index],
                nombre,
                descripcion,
                area,
                responsable_tecnico,
                responsable_funcional,
                criticidad,
                tipo,
                tipo_otro,
                anio_desarrollo,
                adquisicion,
                empresa,
                contrato,
                fecha_soporte,
                observaciones,
                lenguaje,
                version_lenguaje,
                framework,
                version_framework,
                arquitectura,
                patron,
                repositorio,
                tecnologias,
                motor_bd,
                version_bd,
                tipo_bd,
                servidor,
                esquema,
                backup,
                frecuencia_backup,
                cifrado,
                responsable_bd,
                integraciones: sistemaEnEdicion?.integraciones || [],
                tiene_integraciones: tiene_integraciones,
                evidencias: evidenciasSubidas,
                urls: urlsAgregadas,
                estado_operativo
            };
            if (modoModal === 'corregir') {
                sistemas[index].estado = 'Subsanado';
                sistemas[index].observaciones_validador = [];
            }
            guardarSistemas(sistemas);
            alert('✅ Cambios guardados correctamente.');
        }
    }

    cerrarModalSistema();
    sistemas = getSistemas();
    renderizarTabla();
}

// ============================================================
// VALIDACIÓN FINAL PARA ENVIAR A VALIDACIÓN
// ============================================================
function validateFinalSubmit() {
    // --- 1. Recoger datos del formulario ---
    const container = document.getElementById('modal-body-sistema');

    // Tab 1: General
    const codigo = document.querySelector('.form-group[data-campo="codigo"] input')?.value?.trim() || '';
    const nombre = document.getElementById('campo-nombre')?.value?.trim() || '';
    const areaUsuaria = document.getElementById('campo-area')?.value || '';
    const responsableTecnico = document.getElementById('campo-responsable-tecnico')?.value?.trim() || '';
    const criticidad = document.getElementById('campo-criticidad')?.value || '';

    // Tab 2: Tipo
    const tipoRadio = container.querySelector('input[name="tipo-sistema"]:checked');
    const tipoAplicativo = tipoRadio ? tipoRadio.value : '';

    // Tab 4: Arquitectura
    const arquitectura = document.getElementById('campo-arquitectura')?.value?.trim() || '';

    // Tab 5: Base de Datos
    const motorBD = document.getElementById('campo-motor-bd')?.value || '';

    // Tab 7: Evidencias
    const totalEvidencias = evidenciasSubidas.length + urlsAgregadas.length;

    // --- 2. Validación Tab 1: General ---
    if (!codigo || !nombre || !areaUsuaria || !responsableTecnico) {
        alert('⚠️ No se puede enviar. El código, nombre, área usuaria y responsable técnico son obligatorios.');
        cambiarTab(0);
        return;
    }

    // --- 3. Validación Tab 2: Tipo ---
    if (!tipoAplicativo) {
        alert('⚠️ No se puede enviar. Debes clasificar el sistema seleccionando un "Tipo" en la pestaña 2.');
        cambiarTab(1);
        return;
    }

    // --- 4. Validación Tab 4 y 5: Arquitectura y BD ---
    if (!arquitectura || !motorBD) {
        alert('⚠️ No se puede enviar. Faltan completar datos obligatorios en las pestañas de Arquitectura o Base de Datos.');
        if (!arquitectura) {
            cambiarTab(3);
        } else {
            cambiarTab(4);
        }
        return;
    }

    // --- 5. Validación Dinámica: Evidencias según criticidad ---
    // SOLO aplica si la criticidad es "Alta" o "Crítica / Misión Crítica"
    const criticidadAlta = criticidad === 'Alta' || criticidad === 'Crítica';
    if (criticidadAlta && totalEvidencias === 0) {
        alert('🛑 Acción bloqueada. Los sistemas con criticidad Alta o Crítica requieren obligatoriamente adjuntar al menos una evidencia técnica.');
        cambiarTab(6);
        return;
    }
    // Si la criticidad es Baja, Media o está vacía, NO se validan evidencias

    // --- 6. Todas las validaciones pasaron → Éxito ---
    // Cambiar estado del sistema a "Enviado"
    if (sistemaEnEdicion) {
        sistemaEnEdicion.estado = 'Enviado';
    }

    // Actualizar el estado en el DOM
    const estadoSelect = document.querySelector('.estado-automatico');
    if (estadoSelect) {
        estadoSelect.textContent = 'Enviado';
        estadoSelect.className = 'estado-automatico enviado';
    }

    // Mostrar mensaje de éxito
    alert('✅ El sistema ha sido enviado a revisión técnica correctamente.');

    // Cerrar el modal y refrescar la tabla
    cerrarModalSistema();
    sistemas = getSistemas();
    renderizarTabla();
}

// ============================================================
// CONTROLAR VISIBILIDAD DEL BOTÓN ENVIAR A VALIDACIÓN
// ============================================================
function actualizarBotonEnviar() {
    const btnEnviar = document.getElementById('btn-enviar-validacion');
    if (!btnEnviar) {
        console.warn('❌ Botón "btn-enviar-validacion" no encontrado en el DOM');
        return;
    }

    const esUltimaPestana = tabActual === tabs.length - 1; // Resumen (índice 7)
    const soloLectura = modoModal === 'ver';

    // Mostrar solo en la pestaña de Resumen y si NO es solo lectura
    btnEnviar.style.display = (esUltimaPestana && !soloLectura) ? 'inline-flex' : 'none';
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    sistemas = getSistemas();
    renderizarTabla();

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'mis-sistemas.html') {
            item.classList.add('active');
        }
    });

    document.getElementById('search-input').addEventListener('input', filtrarSistemas);
    document.getElementById('filter-estado').addEventListener('change', filtrarSistemas);
    document.getElementById('filter-area').addEventListener('change', filtrarSistemas);
    document.getElementById('filter-tipo').addEventListener('change', filtrarSistemas);
    document.getElementById('filter-criticidad').addEventListener('change', filtrarSistemas);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            cerrarModalSistema();
        }
    });
});