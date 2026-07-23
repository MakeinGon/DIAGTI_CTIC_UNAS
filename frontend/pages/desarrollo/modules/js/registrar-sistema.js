// ============================================================
// DIAGTI · CTIC UNAS — Registrar Sistema
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
// CAMBIAR PESTAÑA
// ============================================================
function cambiarTab(tabId) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(function (content) {
        content.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });

    // Mostrar el contenido seleccionado
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');

    // Activar el botón correspondiente
    const btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

// ============================================================
// AGREGAR INTEGRACIÓN
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

    // Limpiar campos
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

    // Resetear input
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
// GUARDAR BORRADOR
// ============================================================
async function guardarBorrador() {
    const sistema = leerSistemaFormulario();
    if (!sistema.codigo || !sistema.nombre) {
        alert('Complete al menos el código y el nombre del sistema.');
        return;
    }
    sistema.estado = 'Borrador';
    guardarSistemaLocal(sistema);
    try {
        await window.DIAGTIFlujo.guardarBorrador({
            codigoSistema: sistema.codigo,
            nombreSistema: sistema.nombre,
            areaOrigen: 'DESARROLLO',
            areaUsuaria: sistema.area || 'CTIC UNAS',
            responsable: sistema.responsable_tecnico || 'Área de Desarrollo',
            comentario: 'Borrador guardado por Desarrollo',
            datos: sistema
        });
        alert('✅ Sistema guardado como BORRADOR en PostgreSQL.');
        window.location.href = 'mis-sistemas.html';
    } catch (error) {
        alert('❌ El borrador quedó temporalmente en este navegador, pero no se guardó en PostgreSQL: ' + error.message);
    }
}

// ============================================================
// ENVIAR VALIDACIÓN
// ============================================================
async function enviarValidacion() {
    if (confirm('¿Estás seguro de enviar este sistema a validación?')) {
        const sistema = leerSistemaFormulario();
        if (!sistema.codigo || !sistema.nombre || !sistema.area || !sistema.responsable_tecnico) {
            alert('Complete código, nombre, área usuaria y responsable técnico.');
            return;
        }
        try {
            await window.DIAGTIFlujo.enviar({
                codigoSistema: sistema.codigo,
                nombreSistema: sistema.nombre,
                areaOrigen: 'DESARROLLO',
                areaUsuaria: sistema.area,
                responsable: sistema.responsable_tecnico,
                comentario: 'Nuevo sistema registrado por Desarrollo',
                datos: sistema
            });
            sistema.estado = 'Enviado';
            guardarSistemaLocal(sistema);
            alert('✅ Sistema enviado al Validador y asignado a Infraestructura.');
            window.location.href = 'mis-sistemas.html';
        } catch (error) {
            alert('❌ No se pudo enviar. Puede reintentar: ' + error.message);
        }
    }
}

function valorPorEtiqueta(texto) {
    const grupo = [...document.querySelectorAll('#tab-general .form-group')]
        .find(g => g.querySelector('label')?.textContent.trim().toLowerCase().startsWith(texto.toLowerCase()));
    return grupo?.querySelector('input,select,textarea')?.value?.trim() || '';
}

function leerSistemaFormulario() {
    const codigo = valorPorEtiqueta('Código');
    const datos = {};
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.querySelectorAll('.form-group').forEach((grupo, indice) => {
            const etiqueta = grupo.querySelector('label')?.textContent.trim().replace(/\s*\*$/, '') || `campo_${indice}`;
            const control = grupo.querySelector('input:checked,input:not([type="file"]),select,textarea');
            if (control && control.value) datos[etiqueta] = control.value;
        });
    });
    return {
        id: codigo,
        codigo,
        nombre: valorPorEtiqueta('Nombre'),
        descripcion: valorPorEtiqueta('Descripción'),
        area: valorPorEtiqueta('Área usuaria'),
        responsable_funcional: valorPorEtiqueta('Responsable funcional'),
        responsable_tecnico: valorPorEtiqueta('Responsable técnico'),
        criticidad: valorPorEtiqueta('Criticidad'),
        tipo: document.querySelector('input[name="tipo"]:checked')?.value || '',
        fecha: new Date().toLocaleDateString('es-PE'),
        datosFormulario: datos,
        observaciones_validador: []
    };
}

function guardarSistemaLocal(sistema) {
    let lista=[];
    try{lista=JSON.parse(localStorage.getItem('diagti_sistemas')||'[]')}catch{}
    const index=lista.findIndex(s=>s.codigo===sistema.codigo);
    if(index>=0)lista[index]={...lista[index],...sistema};else lista.push(sistema);
    localStorage.setItem('diagti_sistemas',JSON.stringify(lista));
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
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'registrar-sistema.html') {
            item.classList.add('active');
        }
    });

    // Activar primera pestaña por defecto
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        const tabId = firstTab.getAttribute('data-tab');
        cambiarTab(tabId);
    }
});

// ============================================================
// BOTONES NAVEGACIÓN LATERAL (SIGUIENTE / ATRÁS)
// ============================================================
function siguientePantalla() {
    const pantallaActual = document.querySelector('.tab-content.active');
    if (pantallaActual) {
        const pantallaSiguiente = pantallaActual.nextElementSibling;
        
        // Validamos que exista y que sea un bloque de contenido con clase tab-content
        if (pantallaSiguiente && pantallaSiguiente.classList.contains('tab-content')) {
            // Reutilizamos tu función original pasándole el ID de la siguiente pantalla
            cambiarTab(pantallaSiguiente.id);
        }
    }
}

function anteriorPantalla() {
    const pantallaActual = document.querySelector('.tab-content.active');
    if (pantallaActual) {
        const pantallaAnterior = pantallaActual.previousElementSibling;
        
        // Validamos que exista y que sea un bloque de contenido con clase tab-content
        if (pantallaAnterior && pantallaAnterior.classList.contains('tab-content')) {
            // Reutilizamos tu función original pasándole el ID de la pantalla anterior
            cambiarTab(pantallaAnterior.id);
        }
    }
}
