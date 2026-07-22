// ============================================================
// DIAGTI · CTIC UNAS — Dashboard de Infraestructura
// ============================================================

const API_BASE_URL = 'http://localhost:8080/api/infraestructura';

// ============================================================
// CARGAR DATOS DEL DASHBOARD
// ============================================================

async function cargarDashboard() {
    try {
        console.log('🔄 Cargando dashboard...');
        
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos del dashboard:', data);
        
        // Actualizar la UI con los datos reales
        actualizarDashboard(data);
        
    } catch (error) {
        console.error('❌ Error al cargar dashboard:', error);
        console.log('📋 Usando datos de respaldo (locales)');
        
        // Usar datos de respaldo si la API falla
        const datosRespaldo = obtenerDatosRespaldo();
        actualizarDashboard(datosRespaldo);
    }
}

// ============================================================
// ACTUALIZAR UI
// ============================================================

function actualizarDashboard(data) {
    // 1. Estadísticas principales
    const stats = data.estadisticas || {};
    document.getElementById('kpiTotal').textContent = stats.totalSistemas || 0;
    document.getElementById('kpiNuevos').textContent = stats.nuevos || 0;
    document.getElementById('kpiBorradores').textContent = stats.borradores || 0;
    document.getElementById('kpiPendientes').textContent = stats.pendientesRegistro || 0;
    document.getElementById('kpiObservados').textContent = stats.observados || 0;
    document.getElementById('kpiValidados').textContent = stats.validados || 0;
    
    // 2. Prioridades de atención
    const prioridades = data.prioridades || [];
    const priorityList = document.getElementById('priorityList');
    
    if (prioridades.length === 0) {
        priorityList.innerHTML = '<div class="empty-state">No hay acciones pendientes.</div>';
    } else {
        priorityList.innerHTML = prioridades.map(p => `
            <div class="priority-item">
                <div class="priority-main">
                    <span class="priority-status ${p.estado}">${p.estado}</span>
                    <div class="priority-text">
                        <strong>${p.codigo} — ${p.nombre}</strong>
                        <small>${p.detalle}</small>
                    </div>
                </div>
                <a class="priority-action" href="${p.url}">${p.accion}</a>
            </div>
        `).join('');
    }
    
    // 3. Distribución por estado
    const estados = data.estados || [];
    const maxState = Math.max(1, ...estados.map(e => e.cantidad));
    const stateContainer = document.getElementById('stateBars');
    const stateOrder = ['Nuevo', 'Borrador', 'Enviado', 'Observado', 'Corregido', 'Validado'];
    
    stateContainer.innerHTML = stateOrder.map(nombre => {
        const encontrado = estados.find(e => e.nombre === nombre);
        const cantidad = encontrado ? encontrado.cantidad : 0;
        const porcentaje = (cantidad / maxState) * 100;
        
        return `
            <div class="bar-row">
                <span class="bar-label">${nombre}</span>
                <div class="bar-track">
                    <span class="bar-fill ${nombre.toLowerCase()}" style="width: ${porcentaje}%"></span>
                </div>
                <span class="bar-count">${cantidad}</span>
            </div>
        `;
    }).join('');
    
    // 4. Nivel de riesgo
    const riesgos = data.riesgos || [];
    const riskContainer = document.getElementById('riskSummary');
    const riskOrder = ['Bajo', 'Medio', 'Alto', 'Crítico'];
    
    riskContainer.innerHTML = riskOrder.map(nombre => {
        const encontrado = riesgos.find(r => r.nombre === nombre);
        const cantidad = encontrado ? encontrado.cantidad : 0;
        const clase = encontrado ? encontrado.clase : nombre.toLowerCase();
        
        return `
            <div class="risk-card ${clase}">
                <span>Riesgo ${nombre.toLowerCase()}</span>
                <strong>${cantidad}</strong>
            </div>
        `;
    }).join('');
}

// ============================================================
// DATOS DE RESPALDO (LOCALES)
// ============================================================

function obtenerDatosRespaldo() {
    return {
        estadisticas: {
            totalSistemas: 10,
            pendientesRegistro: 3,
            nuevos: 1,
            borradores: 2,
            observados: 4,
            validados: 1
        },
        prioridades: [
            {
                codigo: "SIS-MAT-01",
                nombre: "Sistema de Matrícula",
                estado: "Validado",
                detalle: "Registro técnico completado y aprobado.",
                accion: "Ver",
                url: "mis-sistemas.html?sistema=SIS-MAT-01"
            },
            {
                codigo: "SIS-DOC-02",
                nombre: "Documenta",
                estado: "Observado",
                detalle: "Tiene observaciones del Validador CTIC.",
                accion: "Subsanar",
                url: "mis-sistemas.html?estado=Observado&sistema=SIS-DOC-02"
            },
            {
                codigo: "SIS-VEN-03",
                nombre: "Registro de Ventas",
                estado: "Borrador",
                detalle: "El registro está incompleto.",
                accion: "Completar",
                url: "infraestructura.html?sistema=SIS-VEN-03"
            },
            {
                codigo: "SIS-BIB-04",
                nombre: "Biblioteca Virtual",
                estado: "Corregido",
                detalle: "La corrección está lista para revisión.",
                accion: "Revisar y enviar",
                url: "mis-sistemas.html?estado=Corregido&sistema=SIS-BIB-04"
            },
            {
                codigo: "SIS-RRH-05",
                nombre: "Control de Personal",
                estado: "Enviado",
                detalle: "Enviado a validación.",
                accion: "Ver",
                url: "mis-sistemas.html?sistema=SIS-RRH-05"
            },
            {
                codigo: "SIS-MSA-06",
                nombre: "Mesa de Servicios TI",
                estado: "Nuevo",
                detalle: "Aún no tiene registro técnico.",
                accion: "Registrar",
                url: "infraestructura.html?sistema=SIS-MSA-06"
            }
        ],
        riesgos: [
            { nombre: "Bajo", cantidad: 1, clase: "low" },
            { nombre: "Medio", cantidad: 4, clase: "medium" },
            { nombre: "Alto", cantidad: 3, clase: "high" },
            { nombre: "Crítico", cantidad: 1, clase: "critical" }
        ],
        estados: [
            { nombre: "Nuevo", cantidad: 1 },
            { nombre: "Borrador", cantidad: 2 },
            { nombre: "Enviado", cantidad: 1 },
            { nombre: "Observado", cantidad: 4 },
            { nombre: "Corregido", cantidad: 1 },
            { nombre: "Validado", cantidad: 1 }
        ]
    };
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard de Infraestructura - Inicializando...');
    cargarDashboard();
    
    // Auto-refresh cada 60 segundos
    setInterval(cargarDashboard, 60000);
});