// ============================================================
// DIAGTI · CTIC UNAS — Observaciones
// ============================================================

// ============================================================
// VARIABLES GLOBALES
// ============================================================
let sistemaCorrigiendo = null;
let evidenciasCorreccion = [];
let urlsCorreccion = [];

// ============================================================
// OBTENER SISTEMAS DESDE localStorage
// ============================================================
function getSistemas() {
    const stored = localStorage.getItem('diagti_sistemas');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.log('Error al parsear datos');
        }
    }
    return [];
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
// RENDERIZAR OBSERVACIONES
// ============================================================
function renderizarObservaciones() {
    const sistemas = getSistemas();
    const container = document.getElementById('observaciones-list');
    const totalBadge = document.getElementById('total-observaciones');

    const conObservaciones = sistemas.filter(s =>
        s.observaciones_validador && s.observaciones_validador.length > 0
    );

    totalBadge.textContent = conObservaciones.length + ' observaciones';

    if (conObservaciones.length === 0) {
        container.innerHTML = `<div class="empty-state">🎉 No hay observaciones pendientes. ¡Todo al día!</div>`;
        return;
    }

    let html = '';
    conObservaciones.forEach(s => {
        const totalObs = s.observaciones_validador.length;
        html += `
            <div class="obs-card">
                <div class="obs-header">
                    <div class="obs-title">
                        <h3>${s.nombre}</h3>
                        <span class="badge badge-status-danger">${s.estado}</span>
                        <span class="badge badge-status-warning">${totalObs} observación${totalObs > 1 ? 'es' : ''}</span>
                    </div>
                    <span class="obs-fecha">📅 ${s.fecha || 'Sin fecha'}</span>
                </div>

                <div class="obs-details">
                    ${s.observaciones_validador.map(obs => `
                        <div class="obs-item">${obs.mensaje}</div>
                    `).join('')}
                </div>

                <div class="obs-footer">
                    <button class="btn btn-warning" onclick="window.abrirModalCorreccion('${s.id}')">🔧 Corregir ahora</button>
                    <a href="mis-sistemas.html?action=editar&id=${s.id}" class="btn btn-ghost btn-sm">👁 Ver sistema completo</a>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================
// ABRIR MODAL DE CORRECCIÓN (DEFINIDA GLOBALMENTE)
// ============================================================
window.abrirModalCorreccion = function (id) {
    console.log('✅ abrirModalCorreccion ejecutada con id:', id);

    const sistemas = getSistemas();
    const sistema = sistemas.find(s => s.id === id);
    if (!sistema) {
        alert('Sistema no encontrado');
        return;
    }

    console.log('📦 Sistema encontrado:', sistema.nombre);
    console.log('📋 Observaciones:', sistema.observaciones_validador);

    sistemaCorrigiendo = JSON.parse(JSON.stringify(sistema));
    evidenciasCorreccion = sistema.evidencias ? [...sistema.evidencias] : [];
    urlsCorreccion = sistema.urls ? [...sistema.urls] : [];

    const modal = document.getElementById('modal-correccion');
    if (!modal) {
        console.error('❌ Modal no encontrado');
        alert('Error: el modal no existe.');
        return;
    }

    // Actualizar título
    document.getElementById('modal-correccion-titulo').textContent = '🔧 Corregir: ' + sistema.nombre;
    document.getElementById('modal-correccion-subtitulo').textContent = 'Corrija las observaciones del validador';

    // Renderizar contenido
    renderizarModalCorreccion(sistemaCorrigiendo);

    // Mostrar modal
    modal.classList.add('open');

    // Verificar que se haya añadido la clase
    console.log('Modal clases:', modal.className);
};

// ============================================================
// CERRAR MODAL DE CORRECCIÓN (DEFINIDA GLOBALMENTE)
// ============================================================
window.cerrarModalCorreccion = function () {
    console.log('🔒 cerrarModalCorreccion ejecutada');
    const modal = document.getElementById('modal-correccion');
    if (modal) modal.classList.remove('open');
    sistemaCorrigiendo = null;
    evidenciasCorreccion = [];
    urlsCorreccion = [];
};

// ============================================================
// GUARDAR CORRECCIÓN (DEFINIDA GLOBALMENTE)
// ============================================================
window.guardarCorreccion = function () {
    console.log('💾 guardarCorreccion ejecutada');

    if (!sistemaCorrigiendo) {
        alert('No hay sistema en edición.');
        return;
    }

    const lenguaje = document.getElementById('corr-lenguaje')?.value?.trim() || '';
    const version_lenguaje = document.getElementById('corr-version-lenguaje')?.value?.trim() || '';
    const framework = document.getElementById('corr-framework')?.value?.trim() || '';
    const version_framework = document.getElementById('corr-version-framework')?.value?.trim() || '';
    const arquitectura = document.getElementById('corr-arquitectura')?.value?.trim() || '';
    const patron = document.getElementById('corr-patron')?.value?.trim() || '';
    const repositorio = document.getElementById('corr-repositorio')?.value?.trim() || '';

    const motor_bd = document.getElementById('corr-motor-bd')?.value || '';
    const version_bd = document.getElementById('corr-version-bd')?.value?.trim() || '';
    const tipo_bd = document.getElementById('corr-tipo-bd')?.value || 'Relacional';

    const seguridadCheckboxes = document.querySelectorAll('#corregir-seguridad input[type="checkbox"]');
    const seguridad = [];
    seguridadCheckboxes.forEach(cb => { if (cb.checked) seguridad.push(cb.value); });

    sistemaCorrigiendo.lenguaje = lenguaje;
    sistemaCorrigiendo.version_lenguaje = version_lenguaje;
    sistemaCorrigiendo.framework = framework;
    sistemaCorrigiendo.version_framework = version_framework;
    sistemaCorrigiendo.arquitectura = arquitectura;
    sistemaCorrigiendo.patron = patron;
    sistemaCorrigiendo.repositorio = repositorio;
    sistemaCorrigiendo.motor_bd = motor_bd;
    sistemaCorrigiendo.version_bd = version_bd;
    sistemaCorrigiendo.tipo_bd = tipo_bd;
    sistemaCorrigiendo.seguridad = seguridad;
    sistemaCorrigiendo.evidencias = evidenciasCorreccion;
    sistemaCorrigiendo.urls = urlsCorreccion;
    sistemaCorrigiendo.observaciones_validador = [];
    sistemaCorrigiendo.estado = 'Subsanado';

    const sistemas = getSistemas();
    const index = sistemas.findIndex(s => s.id === sistemaCorrigiendo.id);
    if (index !== -1) {
        sistemas[index] = sistemaCorrigiendo;
        localStorage.setItem('diagti_sistemas', JSON.stringify(sistemas));
        alert('✅ Correcciones guardadas. El sistema ha sido marcado como Subsanado.');
        window.cerrarModalCorreccion();
        renderizarObservaciones();
    } else {
        alert('❌ Error al guardar.');
    }
};

// ============================================================
// RENDERIZAR MODAL DE CORRECCIÓN
// ============================================================
function renderizarModalCorreccion(sistema) {
    const container = document.getElementById('modal-correccion-body');
    if (!container) {
        console.error('❌ #modal-correccion-body no encontrado');
        return;
    }

    const tabs = [
        { id: 'corregir-arquitectura', label: 'Arquitectura' },
        { id: 'corregir-bd', label: 'Base de Datos' },
        { id: 'corregir-evidencias', label: 'Evidencias' },
        { id: 'corregir-seguridad', label: 'Seguridad' }
    ];

    let html = `
        <div class="modal-tabs" id="modal-correccion-tabs">
            ${tabs.map((t, i) => `
                <button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${t.id}" onclick="window.cambiarTabCorreccion('${t.id}')">
                    ${t.label}
                </button>
            `).join('')}
        </div>
        <div id="modal-correccion-content">
    `;

    // ===== Pestaña: Arquitectura =====
    html += `
        <div class="tab-content active" id="corregir-arquitectura">
            <div class="form-group">
                <label for="corr-lenguaje">Lenguaje</label>
                <input type="text" id="corr-lenguaje" value="${sistema.lenguaje || ''}" placeholder="Ej. PHP, Java">
            </div>
            <div class="form-group">
                <label for="corr-version-lenguaje">Versión lenguaje</label>
                <input type="text" id="corr-version-lenguaje" value="${sistema.version_lenguaje || ''}" placeholder="Ej. 8.2">
            </div>
            <div class="form-group">
                <label for="corr-framework">Framework</label>
                <input type="text" id="corr-framework" value="${sistema.framework || ''}" placeholder="Ej. Laravel">
            </div>
            <div class="form-group">
                <label for="corr-version-framework">Versión framework</label>
                <input type="text" id="corr-version-framework" value="${sistema.version_framework || ''}" placeholder="Ej. 10.0">
            </div>
            <div class="form-group">
                <label for="corr-arquitectura">Arquitectura <span class="required">*</span></label>
                <input type="text" id="corr-arquitectura" value="${sistema.arquitectura || ''}" placeholder="Ej. MVC, Hexagonal">
            </div>
            <div class="form-group">
                <label for="corr-patron">Patrón</label>
                <input type="text" id="corr-patron" value="${sistema.patron || ''}" placeholder="Ej. Repository">
            </div>
            <div class="form-group">
                <label for="corr-repositorio">Repositorio Git</label>
                <input type="text" id="corr-repositorio" value="${sistema.repositorio || ''}" placeholder="URL del repositorio Git">
            </div>
        </div>
    `;

    // ===== Pestaña: Base de Datos =====
    html += `
        <div class="tab-content" id="corregir-bd">
            <div class="form-group">
                <label for="corr-motor-bd">Motor de Base de Datos <span class="required">*</span></label>
                <select id="corr-motor-bd">
                    <option value="">Seleccionar</option>
                    <option value="PostgreSQL" ${sistema.motor_bd === 'PostgreSQL' ? 'selected' : ''}>PostgreSQL</option>
                    <option value="MySQL" ${sistema.motor_bd === 'MySQL' ? 'selected' : ''}>MySQL</option>
                    <option value="SQL Server" ${sistema.motor_bd === 'SQL Server' ? 'selected' : ''}>SQL Server</option>
                    <option value="Oracle" ${sistema.motor_bd === 'Oracle' ? 'selected' : ''}>Oracle</option>
                </select>
            </div>
            <div class="form-group">
                <label for="corr-version-bd">Versión</label>
                <input type="text" id="corr-version-bd" value="${sistema.version_bd || ''}" placeholder="Ej. 15.0">
            </div>
            <div class="form-group">
                <label for="corr-tipo-bd">Tipo de BD</label>
                <select id="corr-tipo-bd">
                    <option value="Relacional" ${sistema.tipo_bd === 'Relacional' ? 'selected' : ''}>Relacional</option>
                    <option value="NoSQL" ${sistema.tipo_bd === 'NoSQL' ? 'selected' : ''}>NoSQL</option>
                    <option value="Documental" ${sistema.tipo_bd === 'Documental' ? 'selected' : ''}>Documental</option>
                </select>
            </div>
        </div>
    `;

    // ===== Pestaña: Evidencias =====
    html += `
        <div class="tab-content" id="corregir-evidencias">
            <div class="form-group">
                <label>Evidencias</label>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:12px;">
                    ${['Manual', 'Documento técnico', 'Contrato', 'Capturas', 'Certificados'].map(t => `
                        <div style="border:1px dashed var(--border);border-radius:10px;padding:12px;text-align:center;">
                            <label style="display:block;font-weight:600;font-size:13px;">${t}</label>
                            <input type="file" style="margin-top:8px;font-size:12px;width:100%;" onchange="window.subirEvidenciaCorreccion('${t}', this)">
                        </div>
                    `).join('')}
                </div>
                <div id="corr-lista-evidencias">
                    ${evidenciasCorreccion.length > 0 ? evidenciasCorreccion.map(e => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
                            <span>📄 <strong>${e.tipo}:</strong> ${e.nombre}</span>
                            <button class="btn btn-danger btn-sm" onclick="window.eliminarEvidenciaCorreccion('${e.tipo}')">✕</button>
                        </div>
                    `).join('') : '<p style="color:var(--muted);font-size:13px;">No hay archivos subidos</p>'}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="corr-url">URL</label>
                    <input type="text" id="corr-url" placeholder="https://ejemplo.com">
                </div>
                <div class="form-group">
                    <label for="corr-url-desc">Descripción</label>
                    <input type="text" id="corr-url-desc" placeholder="Descripción de la URL">
                </div>
            </div>
            <button class="btn btn-verde btn-sm" onclick="window.agregarUrlCorreccion()">➕ Agregar URL</button>
            <div id="corr-lista-urls" style="margin-top:10px;">
                ${urlsCorreccion.length > 0 ? urlsCorreccion.map(u => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
                        <span>🔗 <strong>${u.desc}:</strong> <a href="${u.url}" target="_blank" style="color:var(--color-azul-ctic);">${u.url}</a></span>
                        <button class="btn btn-danger btn-sm" onclick="window.eliminarUrlCorreccion('${u.url}')">✕</button>
                    </div>
                `).join('') : '<p style="color:var(--muted);font-size:13px;">No hay URLs agregadas</p>'}
            </div>
        </div>
    `;

    // ===== Pestaña: Seguridad =====
    const seguridad = sistema.seguridad || [];
    html += `
        <div class="tab-content" id="corregir-seguridad">
            <div class="checkbox-group">
                ${['SSL', 'MFA', 'Logs', 'Auditoría', 'OWASP', 'Control de acceso', 'Restricción IP', 'Backup'].map(opt => `
                    <label>
                        <input type="checkbox" value="${opt}" ${seguridad.includes(opt) ? 'checked' : ''}> ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    html += `</div>`;
    container.innerHTML = html;

    const observacionesValidador = sistema.observaciones_validador || [];
    if (observacionesValidador.length > 0) {
        let obsHtml = `<div style="background:#fff5f5;padding:12px;border-radius:8px;margin-bottom:16px;border-left:4px solid #dc3545;">`;
        obsHtml += `<h4 style="color:#dc3545;margin-bottom:6px;">📋 Observaciones del validador:</h4>`;
        obsHtml += `<ul style="list-style:none;padding:0;margin:0;">`;
        observacionesValidador.forEach(o => {
            obsHtml += `<li style="padding:4px 0;font-size:14px;">• ${o.mensaje}</li>`;
        });
        obsHtml += `</ul></div>`;
        const contentDiv = document.getElementById('modal-correccion-content');
        if (contentDiv) {
            contentDiv.insertAdjacentHTML('afterbegin', obsHtml);
        }
    }

    document.querySelectorAll('#modal-correccion-tabs .tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('#modal-correccion-content .tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === 0);
    });
}

// ============================================================
// FUNCIONES PARA MANEJO DE EVIDENCIAS Y URLS
// ============================================================
window.subirEvidenciaCorreccion = function (tipo, input) {
    const file = input.files[0];
    if (!file) return;
    const existing = evidenciasCorreccion.findIndex(e => e.tipo === tipo);
    if (existing !== -1) {
        evidenciasCorreccion[existing] = { tipo, nombre: file.name, size: file.size };
    } else {
        evidenciasCorreccion.push({ tipo, nombre: file.name, size: file.size });
    }
    renderizarListaEvidenciasCorreccion();
    input.value = '';
};

window.eliminarEvidenciaCorreccion = function (tipo) {
    evidenciasCorreccion = evidenciasCorreccion.filter(e => e.tipo !== tipo);
    renderizarListaEvidenciasCorreccion();
};

function renderizarListaEvidenciasCorreccion() {
    const container = document.getElementById('corr-lista-evidencias');
    if (!container) return;
    if (evidenciasCorreccion.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);font-size:13px;">No hay archivos subidos</p>';
        return;
    }
    container.innerHTML = evidenciasCorreccion.map(e => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
            <span>📄 <strong>${e.tipo}:</strong> ${e.nombre}</span>
            <button class="btn btn-danger btn-sm" onclick="window.eliminarEvidenciaCorreccion('${e.tipo}')">✕</button>
        </div>
    `).join('');
}

window.agregarUrlCorreccion = function () {
    const url = document.getElementById('corr-url').value.trim();
    const desc = document.getElementById('corr-url-desc').value.trim() || 'URL';
    if (!url) { alert('Ingresa una URL válida.'); return; }
    try { new URL(url); } catch (e) { alert('URL inválida.'); return; }
    urlsCorreccion.push({ desc, url });
    document.getElementById('corr-url').value = '';
    document.getElementById('corr-url-desc').value = '';
    renderizarListaUrlsCorreccion();
};

window.eliminarUrlCorreccion = function (url) {
    urlsCorreccion = urlsCorreccion.filter(u => u.url !== url);
    renderizarListaUrlsCorreccion();
};

function renderizarListaUrlsCorreccion() {
    const container = document.getElementById('corr-lista-urls');
    if (!container) return;
    if (urlsCorreccion.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);font-size:13px;">No hay URLs agregadas</p>';
        return;
    }
    container.innerHTML = urlsCorreccion.map(u => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#f8fafa;border-radius:6px;margin-bottom:4px;">
            <span>🔗 <strong>${u.desc}:</strong> <a href="${u.url}" target="_blank" style="color:var(--color-azul-ctic);">${u.url}</a></span>
            <button class="btn btn-danger btn-sm" onclick="window.eliminarUrlCorreccion('${u.url}')">✕</button>
        </div>
    `).join('');
}

// ============================================================
// CAMBIAR PESTAÑA EN EL MODAL DE CORRECCIÓN
// ============================================================
window.cambiarTabCorreccion = function (tabId) {
    document.querySelectorAll('#modal-correccion-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#modal-correccion-content .tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Página de Observaciones cargada');
    renderizarObservaciones();

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'observaciones.html') {
            item.classList.add('active');
        }
    });
    // ============================================================
    // FUNCIÓN DE PRUEBA PARA VERIFICAR EL MODAL
    // ============================================================
    function probarModal() {
        console.log('🧪 Probando modal...');
        const modal = document.getElementById('modal-correccion');
        if (modal) {
            modal.classList.add('open');
            document.getElementById('modal-correccion-titulo').textContent = '🧪 Prueba del Modal';
            document.getElementById('modal-correccion-subtitulo').textContent = 'El modal funciona correctamente';
            document.getElementById('modal-correccion-body').innerHTML = `
            <div style="padding:20px;text-align:center;">
                <h3>✅ El modal se está mostrando correctamente</h3>
                <p style="color:var(--muted);">Si ves este mensaje, el modal funciona.</p>
            </div>
        `;
            console.log('✅ Modal abierto correctamente');
        } else {
            console.error('❌ Modal no encontrado');
        }
    }

    // Ejecutar prueba al cargar la página
    document.addEventListener('DOMContentLoaded', function () {
        console.log('🚀 Página de Observaciones cargada');
        renderizarObservaciones();

        // Agregar botón de prueba (opcional)
        const topbar = document.querySelector('.topbar');
        if (topbar) {
            const testBtn = document.createElement('button');
            testBtn.className = 'btn btn-ghost btn-sm';
            testBtn.textContent = '🧪 Probar Modal';
            testBtn.onclick = probarModal;
            topbar.appendChild(testBtn);
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('href') === 'observaciones.html') {
                item.classList.add('active');
            }
        });
    });
});