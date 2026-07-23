// historial.js

import { obtenerHeaders } from './api-utils.js';
import { configurarCerrarSesion } from "./common.js";

// ============================================================
// 1. ESTADO DE LA APLICACIÓN
// ============================================================

let datosHistorial = [];
let datosFiltrados = [];

// ============================================================
// 2. CARGAR HISTORIAL
// ============================================================

async function cargarHistorial() {
    const tbody = document.getElementById('historial-body');
    
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: var(--muted);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                    Cargando historial...
                </td>
            </tr>
        `;
    }

    try {
        const response = await fetch('/api/flujo-validacion/historial', { headers: obtenerHeaders() });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const solicitudes = await response.json();
        datosHistorial = solicitudes
            .filter(item => item.estado !== 'PENDIENTE')
            .map(item => ({
                sistema: `${item.nombreSistema} (${item.areaOrigen})`,
                fecha: (item.fechaRevision || item.fechaEnvio || '').replace('T', ' ').slice(0, 16),
                accion: item.estado === 'VALIDADO' ? 'Validado' : item.estado === 'OBSERVADO' ? 'Observado' : 'Rechazado',
                observaciones: item.comentarioRevision || '--',
                claseEstado: item.estado === 'VALIDADO' ? 'success' : item.estado === 'OBSERVADO' ? 'warning' : 'danger'
            }));
        datosFiltrados = [...datosHistorial];
        renderizarTabla(datosFiltrados);
        mostrarNotificacion(`📋 ${datosHistorial.length} registros cargados`, 'info');
    } catch (error) {
        datosHistorial = [];
        datosFiltrados = [];
        renderizarTabla([]);
        mostrarNotificacion('No se pudo cargar el historial real: ' + error.message, 'error');
    }
}

// ============================================================
// 3. GENERAR DATOS DE EJEMPLO
// ============================================================

function generarDatosEjemplo() {
    return [
        { 
            sistema: 'Sistema Académico UNAS', 
            fecha: '2026-07-08', 
            accion: 'Aprobado', 
            observaciones: 'Documentación completa y correcta', 
            claseEstado: 'success' 
        },
        { 
            sistema: 'Sistema Financiero', 
            fecha: '2026-07-07', 
            accion: 'Observado', 
            observaciones: 'Falta documentación de respaldo', 
            claseEstado: 'warning' 
        },
        { 
            sistema: 'Portal Web Institucional', 
            fecha: '2026-07-06', 
            accion: 'Observado', 
            observaciones: 'No cumple con requisitos mínimos de seguridad', 
            claseEstado: 'warning' 
        },
        { 
            sistema: 'Sistema de Inventario', 
            fecha: '2026-07-05', 
            accion: 'Aprobado', 
            observaciones: 'Sistema operativo correctamente configurado', 
            claseEstado: 'success' 
        },
        { 
            sistema: 'Sistema de RRHH', 
            fecha: '2026-07-04', 
            accion: 'Observado', 
            observaciones: 'Revisar campos de seguridad y autenticación', 
            claseEstado: 'warning' 
        },
        { 
            sistema: 'Sistema de Biblioteca', 
            fecha: '2026-07-03', 
            accion: 'Aprobado', 
            observaciones: 'Todo en orden, validación completada', 
            claseEstado: 'success' 
        }
    ];
}

// ============================================================
// 4. RENDERIZAR TABLA
// ============================================================

function renderizarTabla(datos) {
    const tbody = document.getElementById('historial-body');
    
    if (!tbody) return;

    if (!datos || datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: var(--muted);">
                    <i class="fas fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                    No hay registros en el historial
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = datos.map(item => `
        <tr>
            <td><strong>${item.sistema || '--'}</strong></td>
            <td>${item.fecha || '--'}</td>
            <td><span class="badge ${item.claseEstado || getBadgeClass(item.accion)}">${item.accion || '--'}</span></td>
            <td>${item.observaciones || '--'}</td>
        </tr>
    `).join('');
}

// ============================================================
// 5. OBTENER CLASE DEL BADGE
// ============================================================

function getBadgeClass(accion) {
    const map = {
        'Aprobado': 'success',
        'Observado': 'warning',
        'Pendiente': 'warning'
    };
    return map[accion] || 'info';
}

// ============================================================
// 6. EXPORTAR HISTORIAL
// ============================================================

function exportarHistorial() {
    console.log('📤 Exportar historial clickeado');
    
    if (!datosFiltrados || datosFiltrados.length === 0) {
        mostrarNotificacion('⚠️ No hay datos para exportar', 'warning');
        return;
    }

    mostrarModalExportacion();
}

// ============================================================
// 7. MODAL DE EXPORTACIÓN
// ============================================================

function mostrarModalExportacion() {
    if (document.getElementById('modal-exportar')) {
        document.getElementById('modal-exportar').style.display = 'flex';
        return;
    }

    const modalHTML = `
        <div id="modal-exportar" class="modal-overlay" style="
            display: flex;
            position: fixed;
            inset: 0;
            background: rgba(15, 60, 90, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 20px;
            backdrop-filter: blur(4px);
        ">
            <div class="modal-content" style="
                background: white;
                border-radius: 16px;
                width: min(450px, 100%);
                max-height: 90vh;
                overflow: auto;
                box-shadow: 0 24px 60px rgba(0,0,0,0.25);
                padding: 0;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--border);
                ">
                    <h3 style="margin: 0; font-size: 16px;">
                        <i class="fas fa-file-export" style="color: var(--color-verde-ctic);"></i>
                        Exportar Historial
                    </h3>
                    <button onclick="window.cerrarModalExportacion()" style="
                        background: none;
                        border: none;
                        font-size: 22px;
                        cursor: pointer;
                        color: var(--muted);
                        transition: color 0.2s;
                    " onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--muted)'">×</button>
                </div>

                <div style="padding: 20px 24px;">
                    <p style="color: var(--muted); font-size: 13px; margin-bottom: 18px;">
                        Selecciona el formato para exportar los <strong>${datosFiltrados.length}</strong> registros del historial.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="window.exportarPDF()" style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            padding: 14px 18px;
                            border: 2px solid var(--border);
                            border-radius: 10px;
                            background: white;
                            cursor: pointer;
                            transition: all 0.2s;
                            width: 100%;
                            text-align: left;
                        " onmouseover="this.style.borderColor='var(--color-verde-ctic)'; this.style.background='var(--color-verde-light)'" onmouseout="this.style.borderColor='var(--border)'; this.style.background='white'">
                            <i class="fas fa-file-pdf" style="font-size: 28px; color: #dc2626;"></i>
                            <div>
                                <div style="font-weight: 700; font-size: 14px; color: var(--text);">Exportar como PDF</div>
                                <div style="font-size: 12px; color: var(--muted);">Documento PDF para impresión</div>
                            </div>
                        </button>

                        <button onclick="window.exportarCSV()" style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            padding: 14px 18px;
                            border: 2px solid var(--border);
                            border-radius: 10px;
                            background: white;
                            cursor: pointer;
                            transition: all 0.2s;
                            width: 100%;
                            text-align: left;
                        " onmouseover="this.style.borderColor='var(--color-verde-ctic)'; this.style.background='var(--color-verde-light)'" onmouseout="this.style.borderColor='var(--border)'; this.style.background='white'">
                            <i class="fas fa-file-csv" style="font-size: 28px; color: #16a34a;"></i>
                            <div>
                                <div style="font-weight: 700; font-size: 14px; color: var(--text);">Exportar como CSV</div>
                                <div style="font-size: 12px; color: var(--muted);">Archivo CSV para Excel</div>
                            </div>
                        </button>

                        <button onclick="window.exportarJSON()" style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            padding: 14px 18px;
                            border: 2px solid var(--border);
                            border-radius: 10px;
                            background: white;
                            cursor: pointer;
                            transition: all 0.2s;
                            width: 100%;
                            text-align: left;
                        " onmouseover="this.style.borderColor='var(--color-verde-ctic)'; this.style.background='var(--color-verde-light)'" onmouseout="this.style.borderColor='var(--border)'; this.style.background='white'">
                            <i class="fas fa-file-code" style="font-size: 28px; color: #3b82f6;"></i>
                            <div>
                                <div style="font-weight: 700; font-size: 14px; color: var(--text);">Exportar como JSON</div>
                                <div style="font-size: 12px; color: var(--muted);">Datos en formato JSON</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div style="
                    display: flex;
                    justify-content: flex-end;
                    padding: 16px 24px;
                    border-top: 1px solid var(--border);
                ">
                    <button onclick="window.cerrarModalExportacion()" style="
                        padding: 9px 18px;
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        background: transparent;
                        color: var(--text);
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    if (!document.getElementById('modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .modal-content {
                animation: fadeIn 0.3s ease;
            }
            .notification-toast {
                animation: slideInRight 0.4s ease;
            }
            @keyframes slideInRight {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// ============================================================
// 8. EXPORTAR COMO PDF
// ============================================================

function exportarPDF() {
    try {
        console.log('📄 Exportando PDF...');
        
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Historial de Validaciones</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; }
                    h1 { color: #0f75bc; text-align: center; border-bottom: 2px solid #0f75bc; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #0f75bc; color: white; padding: 12px; text-align: left; }
                    td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
                    .badge-success { color: #166534; background: #dcfce7; padding: 4px 8px; border-radius: 4px; }
                    .badge-warning { color: #92400e; background: #fef3c7; padding: 4px 8px; border-radius: 4px; }
                </style>
            </head>
            <body>
                <h1>📋 Historial de Validaciones</h1>
                <p style="text-align: center; color: #666;">Generado el ${new Date().toLocaleString()}</p>
                <p style="text-align: center; color: #666;">Total de registros: ${datosFiltrados.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Sistema</th>
                            <th>Fecha</th>
                            <th>Acción</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        datosFiltrados.forEach(item => {
            const badgeClass = item.claseEstado || getBadgeClass(item.accion);
            htmlContent += `
                <tr>
                    <td><strong>${item.sistema || '--'}</strong></td>
                    <td>${item.fecha || '--'}</td>
                    <td><span class="badge-${badgeClass}">${item.accion || '--'}</span></td>
                    <td>${item.observaciones || '--'}</td>
                </tr>
            `;
        });

        htmlContent += `
                    </tbody>
                </table>
                <div class="footer">
                    DIAGIT - CTIC UNAS © ${new Date().getFullYear()} | Módulo de Validación
                </div>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank', 'width=1000,height=800');
        if (ventana) {
            ventana.document.write(htmlContent);
            ventana.document.close();
            window.cerrarModalExportacion();
            mostrarNotificacion('✅ PDF generado correctamente', 'success');
            setTimeout(() => ventana.print(), 500);
        } else {
            mostrarNotificacion('❌ Error al abrir la ventana de PDF', 'error');
        }

    } catch (error) {
        console.error("Error al exportar PDF:", error);
        mostrarNotificacion('❌ Error al exportar PDF', 'error');
    }
}

// ============================================================
// 9. EXPORTAR COMO CSV
// ============================================================

function exportarCSV() {
    try {
        console.log('📊 Exportando CSV...');
        
        const headers = ['Sistema', 'Fecha', 'Acción', 'Observaciones'];
        const rows = datosFiltrados.map(item => [
            item.sistema || '--',
            item.fecha || '--',
            item.accion || '--',
            item.observaciones || '--'
        ]);

        const escapeCSV = (value) => {
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };

        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(escapeCSV).join(',') + '\n';
        });

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historial_validaciones_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        window.cerrarModalExportacion();
        mostrarNotificacion('✅ CSV exportado correctamente', 'success');

    } catch (error) {
        console.error("Error al exportar CSV:", error);
        mostrarNotificacion('❌ Error al exportar CSV', 'error');
    }
}

// ============================================================
// 10. EXPORTAR COMO JSON
// ============================================================

function exportarJSON() {
    try {
        console.log('📦 Exportando JSON...');
        
        const jsonData = {
            fechaExportacion: new Date().toISOString(),
            totalRegistros: datosFiltrados.length,
            registros: datosFiltrados
        };

        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historial_validaciones_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        window.cerrarModalExportacion();
        mostrarNotificacion('✅ JSON exportado correctamente', 'success');

    } catch (error) {
        console.error("Error al exportar JSON:", error);
        mostrarNotificacion('❌ Error al exportar JSON', 'error');
    }
}

// ============================================================
// 11. FUNCIONES PARA ABRIR/CERRAR MODAL
// ============================================================

function cerrarModalExportacion() {
    const modal = document.getElementById('modal-exportar');
    if (modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('modal-exportar');
    if (modal && modal.style.display === 'flex') {
        const content = modal.querySelector('.modal-content');
        if (content && !content.contains(event.target)) {
            cerrarModalExportacion();
        }
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarModalExportacion();
    }
});

// ============================================================
// 12. MOSTRAR NOTIFICACIONES
// ============================================================

function mostrarNotificacion(mensaje, tipo = 'success') {
    const existing = document.querySelectorAll('.notification-toast');
    existing.forEach(el => el.remove());

    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 380px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#dcfce7', border: '#16a34a', text: '#166534', icon: 'fa-check-circle' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: 'fa-exclamation-circle' },
        warning: { bg: '#fef3c7', border: '#ca8a04', text: '#92400e', icon: 'fa-triangle-exclamation' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'fa-info-circle' }
    };

    const style = colors[tipo] || colors.success;

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        background: ${style.bg};
        border-left: 4px solid ${style.border};
        border-radius: 10px;
        padding: 14px 18px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.4s ease;
        font-size: 13px;
        color: ${style.text};
        font-weight: 600;
        pointer-events: auto;
        min-width: 280px;
        transition: all 0.3s ease;
    `;

    notification.innerHTML = `
        <i class="fas ${style.icon}" style="font-size: 18px; color: ${style.border}; flex-shrink: 0;"></i>
        <span style="flex: 1;">${mensaje}</span>
        <button onclick="this.closest('.notification-toast').remove()" style="
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: ${style.text};
            opacity: 0.5;
            padding: 0 4px;
            transition: opacity 0.2s;
            flex-shrink: 0;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">×</button>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(120%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// ============================================================
// 13. EXPONER FUNCIONES GLOBALMENTE (¡IMPORTANTE!)
// ============================================================

// Estas funciones deben estar disponibles globalmente para los onclick del modal
window.exportarPDF = exportarPDF;
window.exportarCSV = exportarCSV;
window.exportarJSON = exportarJSON;
window.cerrarModalExportacion = cerrarModalExportacion;
window.exportarHistorial = exportarHistorial;

console.log('✅ Funciones de exportación expuestas globalmente');

// ============================================================
// 14. INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando historial...');
    
    const btnExportar = document.getElementById('btn-exportar');
    console.log('🔍 Botón exportar encontrado:', btnExportar ? '✅ Sí' : '❌ No');
    
    if (btnExportar) {
        const nuevoBtn = btnExportar.cloneNode(true);
        btnExportar.parentNode.replaceChild(nuevoBtn, btnExportar);
        nuevoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Click en exportar');
            exportarHistorial();
        });
        console.log('✅ Evento de exportar asignado');
    } else {
        console.error('❌ No se encontró el botón #btn-exportar');
    }

    cargarHistorial();
    configurarCerrarSesion();
});

console.log('✅ historial.js cargado correctamente');
