// ============================================================
// DIAGTI · CTIC UNAS — Registrar Sistema
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL = 'http://localhost:8080/api/desarrollador/registrar-sistema';

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

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error en API:', error);
        throw error;
    }
}

// ============================================================
// ESTADO GLOBAL
// ============================================================

let sistemaIdCreado = null;

// ============================================================
// FORZAR VALORES EN CAMPOS OBLIGATORIOS
// ============================================================

function forzarValoresObligatorios() {
    console.log('🔧 Forzando valores en campos obligatorios...');
    
    // ✅ Código - si está vacío, generar uno
    const codigoInput = document.getElementById('reg-codigo');
    if (codigoInput && (!codigoInput.value || codigoInput.value === '')) {
        const fecha = new Date();
        const numero = fecha.getTime().toString().slice(-4);
        codigoInput.value = 'SIS' + numero;
        console.log('📝 Código generado:', codigoInput.value);
    }
    
    // ✅ Área usuaria
    const areaSelect = document.getElementById('reg-area');
    if (areaSelect && (!areaSelect.value || areaSelect.value === '')) {
        areaSelect.value = 'Dirección Académica';
        console.log('📝 Área forzada a:', areaSelect.value);
    }
    
    // ✅ Responsable técnico
    const tecnicoInput = document.getElementById('reg-tecnico');
    if (tecnicoInput && (!tecnicoInput.value || tecnicoInput.value === '')) {
        tecnicoInput.value = 'desarrollador1';
        console.log('📝 Responsable técnico forzado a:', tecnicoInput.value);
    }
    
    // ✅ Tipo - seleccionar WEB si no hay ninguno seleccionado
    const tipoRadios = document.querySelectorAll('input[name="reg-tipo"]');
    let tipoSeleccionado = false;
    tipoRadios.forEach(radio => {
        if (radio.checked) {
            tipoSeleccionado = true;
        }
    });
    if (!tipoSeleccionado) {
        const radioWeb = document.querySelector('input[name="reg-tipo"][value="WEB"]');
        if (radioWeb) {
            radioWeb.checked = true;
            console.log('📝 Tipo forzado a: WEB');
        }
    }
}

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

    // ✅ Si es la pestaña de resumen, actualizar los datos
    if (tabId === 'tab-resumen') {
        setTimeout(actualizarResumen, 150);
    }
}

// ============================================================
// VALIDAR CÓDIGO EN TIEMPO REAL
// ============================================================

async function validarCodigoEnTiempoReal() {
    const codigoInput = document.getElementById('reg-codigo');
    const codigo = codigoInput?.value?.trim();
    const feedback = document.getElementById('codigo-feedback');

    if (!codigo || codigo.length < 3) {
        if (feedback) {
            feedback.textContent = '⚠️ Mínimo 3 caracteres';
            feedback.style.color = '#6b7280';
        }
        return;
    }

    try {
        const result = await consumirAPI(`/validar-codigo?codigo=${encodeURIComponent(codigo)}`, 'GET');
        
        if (feedback) {
            if (result === true) {
                feedback.textContent = '✅ Código disponible';
                feedback.style.color = '#059669';
                codigoInput.style.borderColor = '#059669';
            } else {
                feedback.textContent = '❌ Código ya existe';
                feedback.style.color = '#dc2626';
                codigoInput.style.borderColor = '#dc2626';
            }
        }
    } catch (error) {
        console.error('Error validando código:', error);
    }
}

// ============================================================
// ACTUALIZAR RESUMEN
// ============================================================

function actualizarResumen() {
    try {
        console.log('🔄 Actualizando resumen...');
        
        const codigo = document.getElementById('reg-codigo')?.value?.trim() || '-';
        const nombre = document.getElementById('reg-nombre')?.value?.trim() || '-';
        const area = document.getElementById('reg-area')?.value || '-';
        const tecnico = document.getElementById('reg-tecnico')?.value?.trim() || '-';
        const criticidad = document.getElementById('reg-criticidad')?.value || 'MEDIA';
        
        const tipoRadio = document.querySelector('input[name="reg-tipo"]:checked');
        const tipo = tipoRadio ? tipoRadio.value : '-';
        
        const estadoSelect = document.getElementById('reg-estado');
        const estado = estadoSelect ? estadoSelect.value : 'BORRADOR';

        const resumenCodigo = document.getElementById('resumen-codigo');
        const resumenNombre = document.getElementById('resumen-nombre');
        const resumenArea = document.getElementById('resumen-area');
        const resumenTecnico = document.getElementById('resumen-tecnico');
        const resumenTipo = document.getElementById('resumen-tipo');

        if (resumenCodigo) resumenCodigo.textContent = codigo;
        if (resumenNombre) resumenNombre.textContent = nombre;
        if (resumenArea) resumenArea.textContent = area;
        if (resumenTecnico) resumenTecnico.textContent = tecnico;
        if (resumenTipo) resumenTipo.textContent = tipo;

        console.log('📝 Resumen actualizado:', { codigo, nombre, area, tecnico, tipo, estado });
    } catch (error) {
        console.error('❌ Error actualizando resumen:', error);
    }
}

// ============================================================
// RECOPILAR DATOS DEL FORMULARIO
// ============================================================

function recopilarDatosFormulario() {
    console.log('🔍 Recopilando datos del formulario...');
    
    // ✅ Obtener valores con validación
    const codigo = document.getElementById('reg-codigo')?.value?.trim() || '';
    const nombre = document.getElementById('reg-nombre')?.value?.trim() || '';
    const descripcion = document.getElementById('reg-descripcion')?.value?.trim() || '';
    
    // ✅ Área usuaria - SIEMPRE debe tener un valor
    const areaSelect = document.getElementById('reg-area');
    const area = areaSelect?.value || 'Dirección Académica';
    console.log('📝 Área seleccionada:', area);
    
    const funcional = document.getElementById('reg-funcional')?.value?.trim() || '';
    const tecnico = document.getElementById('reg-tecnico')?.value?.trim() || 'desarrollador1';
    const criticidad = document.getElementById('reg-criticidad')?.value || 'MEDIA';
    const esLegacy = document.getElementById('reg-legacy')?.checked || false;

    // ✅ Estado
    const estadoSelect = document.getElementById('reg-estado');
    const estado = estadoSelect ? estadoSelect.value : 'BORRADOR';

    // ✅ Tipo
    const tipoRadio = document.querySelector('input[name="reg-tipo"]:checked');
    const tipo = tipoRadio ? tipoRadio.value : 'WEB';
    console.log('📝 Tipo seleccionado:', tipo);

    // ✅ Desarrollo
    const anio = document.getElementById('reg-anio')?.value || '';
    const adquisicion = document.getElementById('reg-adquisicion')?.value || 'Desarrollo interno CTIC';
    const empresa = document.getElementById('reg-empresa')?.value || '';
    const contratoSelect = document.getElementById('reg-contrato');
    const contrato = contratoSelect ? contratoSelect.value === 'Si' : false;
    
    // ✅ FECHA DE SOPORTE - si está vacía, se envía null
    const soporte = document.getElementById('reg-soporte')?.value || '';
    let fechaVencimientoSoporte = null;
    if (soporte) {
        fechaVencimientoSoporte = soporte + 'T00:00:00';
        console.log('📅 Fecha de soporte:', fechaVencimientoSoporte);
    } else {
        console.log('📅 Sin fecha de soporte (null)');
    }
    
    const obsDesarrollo = document.getElementById('reg-obs-desarrollo')?.value || '';

    // ✅ Arquitectura
    const lenguaje = document.getElementById('reg-lenguaje')?.value || '';
    const versionLenguaje = document.getElementById('reg-version-lenguaje')?.value || '';
    const framework = document.getElementById('reg-framework')?.value || '';
    const versionFramework = document.getElementById('reg-version-framework')?.value || '';
    const arquitectura = document.getElementById('reg-arquitectura')?.value || '';
    const patron = document.getElementById('reg-patron')?.value || '';
    const repositorio = document.getElementById('reg-repositorio')?.value || '';
    const tecnologias = document.getElementById('reg-tecnologias')?.value || '';

    // ✅ Base de Datos
    const motor = document.getElementById('reg-motor')?.value || 'PostgreSQL';
    const versionBD = document.getElementById('reg-version-bd')?.value || '';
    const tipoBD = document.getElementById('reg-tipo-bd')?.value || 'Relacional';
    const servidor = document.getElementById('reg-servidor')?.value || '';
    const esquema = document.getElementById('reg-esquema')?.value || '';
    const backupSelect = document.getElementById('reg-backup');
    const backup = backupSelect ? backupSelect.value === 'Si' : false;
    const frecuencia = document.getElementById('reg-frecuencia')?.value || 'Diario';
    const cifradoSelect = document.getElementById('reg-cifrado');
    const cifrado = cifradoSelect ? cifradoSelect.value === 'Si' : false;
    const responsableBD = document.getElementById('reg-responsable-bd')?.value || '';

    // ✅ Seguridad
    const checkboxes = document.querySelectorAll('#tab-seguridad input[type="checkbox"]');
    const seguridad = {};
    checkboxes.forEach(cb => {
        const key = cb.value.toLowerCase().replace(/ /g, '');
        seguridad[key] = cb.checked;
    });

    // ✅ Construir objeto FINAL
    const data = {
        codigo,
        nombre,
        descripcion,
        tipoAplicativo: tipo,
        estado: estado,
        areaUsuaria: area,
        responsableFuncional: funcional,
        responsableTecnico: tecnico || 'desarrollador1',
        criticidad: criticidad,
        esLegacy: esLegacy,
        anioDesarrollo: anio ? parseInt(anio) : null,
        formaAdquisicion: adquisicion,
        empresaDesarrolladora: empresa,
        contratoVigente: contrato,
        fechaVencimientoSoporte: fechaVencimientoSoporte,
        observaciones: obsDesarrollo,
        
        arquitectura: {
            lenguajeProgramacion: lenguaje,
            versionLenguaje: versionLenguaje,
            framework: framework,
            versionFramework: versionFramework,
            arquitectura: arquitectura,
            patronDiseno: patron,
            repositorio: repositorio,
            tecnologiasComplementarias: tecnologias,
            motorBaseDatos: motor,
            versionBaseDatos: versionBD,
            tipoBaseDatos: tipoBD,
            servidorBaseDatos: servidor,
            esquemaBaseDatos: esquema,
            backupActivo: backup,
            frecuenciaBackup: frecuencia,
            cifradoBaseDatos: cifrado,
            responsableBaseDatos: responsableBD
        },
        
        infraestructura: {
            plataforma: document.getElementById('reg-plataforma')?.value || '',
            tipoServidor: document.getElementById('reg-tipo-servidor')?.value || '',
            sistemaOperativo: document.getElementById('reg-so')?.value || '',
            versionSO: document.getElementById('reg-version-so')?.value || '',
            ip: document.getElementById('reg-ip')?.value || '',
            puerto: document.getElementById('reg-puerto')?.value ? parseInt(document.getElementById('reg-puerto').value) : null,
            dominio: document.getElementById('reg-dominio')?.value || '',
            subdominio: document.getElementById('reg-subdominio')?.value || '',
            ambiente: document.getElementById('reg-ambiente')?.value || '',
            usoDocker: document.getElementById('reg-docker')?.checked || false,
            dockerCompose: document.getElementById('reg-docker-compose')?.checked || false,
            proxmox: document.getElementById('reg-proxmox')?.checked || false,
            proxyReverso: document.getElementById('reg-proxy')?.value || '',
            servidorWeb: document.getElementById('reg-servidor-web')?.value || '',
            ciCd: document.getElementById('reg-cicd')?.value || '',
            mecanismoPublicacion: document.getElementById('reg-publicacion')?.value || '',
            exposicion: document.getElementById('reg-exposicion')?.value || '',
            ipPublica: document.getElementById('reg-ip-publica')?.value || '',
            ipPrivada: document.getElementById('reg-ip-privada')?.value || '',
            subdominioInstitucional: document.getElementById('reg-subdominio-inst')?.value || '',
            observaciones: document.getElementById('reg-obs-infraestructura')?.value || ''
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
            backupSeguro: seguridad.backup || false,
            observaciones: document.getElementById('reg-obs-seguridad')?.value || ''
        },
        
        integraciones: obtenerIntegraciones()
    };

    console.log('📝 DATOS A ENVIAR:', JSON.stringify(data, null, 2));
    return data;
}

// ============================================================
// OBTENER INTEGRACIONES DE LA TABLA
// ============================================================

function obtenerIntegraciones() {
    const integraciones = [];
    const rows = document.querySelectorAll('#tabla-integraciones tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
            integraciones.push({
                sistemaDestino: cells[0].textContent.trim(),
                protocolo: cells[1].textContent.trim(),
                metodo: cells[2].textContent.trim(),
                responsable: cells[3].textContent.trim(),
                frecuencia: 'Tiempo real',
                estado: 'ACTIVO'
            });
        }
    });
    return integraciones;
}

// ============================================================
// GUARDAR BORRADOR
// ============================================================

async function guardarBorrador() {
    try {
        // ✅ FORZAR VALORES ANTES DE RECOPILAR
        forzarValoresObligatorios();
        
        actualizarResumen();

        const data = recopilarDatosFormulario();
        
        // ✅ Si data es null, detener
        if (!data) {
            console.error('❌ Datos inválidos');
            return;
        }
        
        console.log('📝 DATOS COMPLETOS:', data);
        
        const errores = [];
        if (!data.codigo || data.codigo.trim() === '') {
            errores.push('El código es obligatorio');
        }
        if (!data.nombre || data.nombre.trim() === '') {
            errores.push('El nombre es obligatorio');
        }
        if (!data.tipoAplicativo || data.tipoAplicativo === '') {
            errores.push('El tipo de aplicativo es obligatorio');
        }
        if (!data.responsableTecnico || data.responsableTecnico.trim() === '') {
            errores.push('El responsable técnico es obligatorio');
        }
        if (!data.areaUsuaria || data.areaUsuaria.trim() === '') {
            errores.push('El área usuaria es obligatoria');
        }

        if (errores.length > 0) {
            alert('⚠️ Por favor completa los siguientes campos:\n\n• ' + errores.join('\n• '));
            return;
        }

        mostrarLoading();

        const result = await consumirAPI('', 'POST', data);

        console.log('✅ Respuesta del backend:', result);

        if (result && result.exito) {
            sistemaIdCreado = result.id;
            alert('✅ ' + (result.mensaje || 'Sistema registrado exitosamente'));
            window.location.href = 'mis-sistemas.html';
        } else {
            const mensajeError = result?.mensaje || result?.errores || 'Error desconocido';
            alert('❌ Error: ' + mensajeError);
        }
    } catch (error) {
        console.error('❌ Error completo:', error);
        alert('❌ Error al guardar el sistema: ' + (error.message || 'Error desconocido'));
    } finally {
        ocultarLoading();
    }
}

// ============================================================
// ENVIAR VALIDACIÓN
// ============================================================

async function enviarValidacion() {
    if (sistemaIdCreado) {
        try {
            const response = await fetch(`http://localhost:8080/api/desarrollador/editar-sistema/${sistemaIdCreado}/enviar-validacion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('✅ ' + (result.mensaje || 'Sistema enviado a validación correctamente.'));
                window.location.href = 'mis-sistemas.html';
            } else {
                const error = await response.text();
                alert('❌ Error al enviar a validación: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al enviar a validación');
        }
    } else {
        await guardarBorrador();
    }
}

// ============================================================
// CANCELAR
// ============================================================

function cancelarRegistro() {
    if (confirm('¿Estás seguro de cancelar el registro? Los datos no guardados se perderán.')) {
        window.location.href = 'mis-sistemas.html';
    }
}

// ============================================================
// AGREGAR INTEGRACIÓN (LOCAL)
// ============================================================

function agregarIntegracion() {
    const destino = document.getElementById('integracion-destino').value.trim();
    const protocolo = document.getElementById('integracion-protocolo').value;
    const metodo = document.getElementById('integracion-metodo').value.trim();
    const responsable = document.getElementById('integracion-responsable').value.trim();

    if (!destino || !protocolo || !metodo || !responsable) {
        alert('Completa todos los campos de la integración.');
        return;
    }

    const tabla = document.getElementById('tabla-integraciones').querySelector('tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${destino}</td>
        <td>${protocolo}</td>
        <td>${metodo}</td>
        <td>${responsable}</td>
        <td><button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">Eliminar</button></td>
    `;
    tabla.appendChild(row);
    document.getElementById('integracion-destino').value = '';
    document.getElementById('integracion-metodo').value = '';
    document.getElementById('integracion-responsable').value = '';
}

// ============================================================
// SUBIR EVIDENCIA
// ============================================================

function subirEvidencia(tipo) {
    const input = document.getElementById('evidencia-' + tipo);
    if (!input) return;

    const file = input.files[0];
    if (!file) {
        alert('Selecciona un archivo para ' + tipo);
        return;
    }

    const lista = document.getElementById('lista-evidencias');
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
// AGREGAR URL EVIDENCIA
// ============================================================

function agregarUrlEvidencia() {
    const url = document.getElementById('evidencia-url').value.trim();
    const desc = document.getElementById('evidencia-url-desc').value.trim();

    if (!url) {
        alert('Ingresa una URL válida.');
        return;
    }

    const lista = document.getElementById('lista-urls');
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
    item.innerHTML = `
        <span><strong>${desc || 'URL'}:</strong> <a href="${url}" target="_blank" style="color:var(--color-azul-ctic);">${url}</a></span>
        <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Eliminar</button>
    `;
    lista.appendChild(item);

    document.getElementById('evidencia-url').value = '';
    document.getElementById('evidencia-url-desc').value = '';
}

// ============================================================
// BOTONES NAVEGACIÓN LATERAL
// ============================================================

function siguientePantalla() {
    const pantallaActual = document.querySelector('.tab-content.active');
    if (pantallaActual) {
        const pantallaSiguiente = pantallaActual.nextElementSibling;
        if (pantallaSiguiente && pantallaSiguiente.classList.contains('tab-content')) {
            cambiarTab(pantallaSiguiente.id);
        }
    }
}

function anteriorPantalla() {
    const pantallaActual = document.querySelector('.tab-content.active');
    if (pantallaActual) {
        const pantallaAnterior = pantallaActual.previousElementSibling;
        if (pantallaAnterior && pantallaAnterior.classList.contains('tab-content')) {
            cambiarTab(pantallaAnterior.id);
        }
    }
}

// ============================================================
// UTILIDADES DE UI
// ============================================================

function mostrarLoading() {
    if (!document.querySelector('.loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
                <div class="spinner"></div>
                <span style="color:#1a1a2e;font-weight:500;">Guardando sistema...</span>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
    }
}

function ocultarLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ============================================================
// FUNCIÓN DE PRUEBA MANUAL (para consola)
// ============================================================

window.pruebaGuardar = async function() {
    console.log('🔍 Prueba manual de guardado');
    try {
        const data = {
            codigo: 'SIS999',
            nombre: 'Prueba Manual',
            tipoAplicativo: 'WEB',
            areaUsuaria: 'Dirección Académica',
            responsableTecnico: 'desarrollador1',
            estado: 'BORRADOR'
        };
        console.log('📝 Datos de prueba:', data);
        
        const response = await fetch('http://localhost:8080/api/desarrollador/registrar-sistema', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('✅ Resultado:', result);
        alert('✅ Prueba exitosa: ' + JSON.stringify(result));
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error: ' + error.message);
    }
};

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Registrar Sistema - Página cargada');
    console.log('📌 Para prueba manual ejecuta: pruebaGuardar()');
    
    // ✅ FORZAR VALORES AL CARGAR LA PÁGINA
    forzarValoresObligatorios();
    
    // ✅ Activar primera pestaña
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        const tabId = firstTab.getAttribute('data-tab');
        cambiarTab(tabId);
    }

    // ✅ Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'registrar-sistema.html') {
            item.classList.add('active');
        }
    });

    // ✅ Validación de código en tiempo real
    const codigoInput = document.getElementById('reg-codigo');
    if (codigoInput) {
        codigoInput.addEventListener('input', validarCodigoEnTiempoReal);
        codigoInput.addEventListener('blur', validarCodigoEnTiempoReal);
        codigoInput.addEventListener('input', actualizarResumen);
    }

    // ✅ Actualizar resumen al cambiar cualquier campo
    const camposParaResumen = [
        'reg-nombre',
        'reg-area',
        'reg-tecnico',
        'reg-criticidad',
        'reg-estado'
    ];

    camposParaResumen.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('change', actualizarResumen);
            campo.addEventListener('input', actualizarResumen);
        }
    });

    // ✅ Actualizar resumen al seleccionar un tipo
    const tipoRadios = document.querySelectorAll('input[name="reg-tipo"]');
    tipoRadios.forEach(radio => {
        radio.addEventListener('change', actualizarResumen);
    });

    // ✅ Actualizar resumen inicial
    setTimeout(actualizarResumen, 500);
});