const datosBD = {
    sistemas: [
        {
            id_sistema: 1,
            codigo_unico: "SYS-001",
            nombre: "Sistema Académico",
            descripcion: "Matrícula, notas y currícula.",
            id_area_usuario: 1,
            id_tipo_aplicativo: 1,
            id_criticidad: 3,
            forma_adquisicion: "Desarrollo CTIC",
            id_responsable_funcional: 2,
            id_responsable_tecnico: 3,
            ano_adquisicion: 2021,
            desarrollador_nombre: "CTIC UNAS",
            contrato_vigente: false,
            fecha_vencimiento_soporte: null,
            es_legacy: false,
            estado_flujo: "VALIDADO",
            nivel_riesgo: "MEDIO",
            prioridad_migracion: "MEDIANO PLAZO",
            fecha_creacion: "2026-07-15 08:00:00",
            fecha_actualizacion: "2026-07-16 08:45:00",
            fecha_eliminacion: null
        },
        {
            id_sistema: 2,
            codigo_unico: "SYS-002",
            nombre: "Trámite Documentario",
            descripcion: "Gestión de documentos internos.",
            id_area_usuario: 2,
            id_tipo_aplicativo: 1,
            id_criticidad: 3,
            forma_adquisicion: "Proveedor externo",
            id_responsable_funcional: 4,
            id_responsable_tecnico: 3,
            ano_adquisicion: 2020,
            desarrollador_nombre: "Proveedor externo",
            contrato_vigente: true,
            fecha_vencimiento_soporte: "2026-12-31",
            es_legacy: false,
            estado_flujo: "OBSERVADO",
            nivel_riesgo: "ALTO",
            prioridad_migracion: "CORTO PLAZO",
            fecha_creacion: "2026-07-15 09:10:00",
            fecha_actualizacion: "2026-07-16 09:00:00",
            fecha_eliminacion: null
        }
    ],

    auditoria: [
        {
            id_auditoria: 1,
            id_usuario: 1,
            usuario: "Auditor CTIC",
            correo: "auditor@unas.edu.pe",
            modulo: "Inventario",
            accion: "Consulta",
            descripcion: "El auditor consultó el inventario general de sistemas.",
            fecha_evento: "2026-07-16 08:45:00",
            direccion_ip: "192.168.1.10"
        },
        {
            id_auditoria: 2,
            id_usuario: 1,
            usuario: "Auditor CTIC",
            correo: "auditor@unas.edu.pe",
            modulo: "Reportes",
            accion: "Exportación",
            descripcion: "El auditor exportó el reporte de inventario en Excel.",
            fecha_evento: "2026-07-16 09:10:00",
            direccion_ip: "192.168.1.10"
        }
    ],

    evidencias: [
        {
            id_evidencia: 1,
            id_sistema: 1,
            tipo_evidencia: "Manual técnico",
            nombre_archivo: "manual_tecnico_sistema_academico.pdf",
            ruta_archivo: "/evidencias/manual_tecnico_sistema_academico.pdf",
            url_evidencia: null,
            descripcion: "Manual técnico del sistema académico.",
            tamano_archivo: 1024000,
            extension_archivo: "pdf",
            estado_evidencia: "ACTIVA",
            fecha_carga: "2026-07-16 10:00:00",
            id_usuario_carga: 1
        }
    ],

    validaciones: [
        {
            id_validacion: 1,
            id_sistema: 1,
            id_validador: 1,
            estado_validacion: "VALIDADO",
            resultado: "APROBADO",
            observacion_general: "Información revisada correctamente.",
            fecha_validacion: "2026-07-16 11:00:00",
            fecha_subsanacion: null,
            fecha_creacion: "2026-07-16 10:30:00",
            fecha_actualizacion: "2026-07-16 11:00:00"
        }
    ],

    observaciones: [
        {
            id_observacion: 1,
            id_sistema: 2,
            id_validacion: 1,
            descripcion: "Falta evidencia de backup actualizado.",
            estado_observacion: "PENDIENTE",
            respuesta_subsanacion: null,
            id_usuario_observa: 1,
            id_usuario_subsana: null,
            fecha_observacion: "2026-07-16 11:30:00",
            fecha_subsanacion: null
        }
    ]
};

const nombresReportes = {
    sistemas: "Inventario de sistemas",
    auditoria: "Auditoría y trazabilidad",
    evidencias: "Evidencias técnicas",
    validaciones: "Validaciones",
    observaciones: "Observaciones"
};

let reportesGenerados = [];
let reportesFiltrados = [];

const tablaReportes = document.getElementById("tabla-reportes");
const searchInput = document.getElementById("search-input");
const filterTipo = document.getElementById("filter-tipo");
const filterEstado = document.getElementById("filter-estado");
const contadorRegistros = document.getElementById("contador-registros");

const kpiTablas = document.getElementById("kpi-tablas");
const kpiSistemas = document.getElementById("kpi-sistemas");
const kpiAuditoria = document.getElementById("kpi-auditoria");
const kpiExportaciones = document.getElementById("kpi-exportaciones");

function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minuto = String(fecha.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
}

function obtenerFechaISOActual() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function obtenerBadgeEstado(estado) {
    if (estado === "Generado") return "status-success";
    if (estado === "Descargado") return "status-info";

    return "status-secondary";
}

function obtenerBadgeFormato(formato) {
    if (formato === "PDF") return "status-info";
    if (formato === "Excel") return "status-success";

    return "status-secondary";
}

function normalizar(valor) {
    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function actualizarKPIs() {
    kpiTablas.textContent = Object.keys(datosBD).length;
    kpiSistemas.textContent = datosBD.sistemas.length;
    kpiAuditoria.textContent = datosBD.auditoria.length;
    kpiExportaciones.textContent = reportesGenerados.length;
}

function obtenerDatosFiltrados(tabla, desde, hasta) {
    const datos = datosBD[tabla] || [];

    if (!desde && !hasta) {
        return datos;
    }

    return datos.filter(item => {
        const fecha =
            item.fecha_actualizacion ||
            item.fecha_evento ||
            item.fecha_carga ||
            item.fecha_validacion ||
            item.fecha_observacion ||
            item.fecha_creacion ||
            "";

        const fechaISO = String(fecha).substring(0, 10);

        const coincideDesde = !desde || fechaISO >= desde;
        const coincideHasta = !hasta || fechaISO <= hasta;

        return coincideDesde && coincideHasta;
    });
}

function renderReportes(lista) {
    tablaReportes.innerHTML = "";

    if (lista.length === 0) {
        tablaReportes.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron reportes generados.
                </td>
            </tr>
        `;

        contadorRegistros.textContent = "Mostrando 0 reportes";
        actualizarKPIs();
        return;
    }

    lista.forEach((reporte, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><strong>${reporte.fecha}</strong></td>
            <td>${reporte.nombre}</td>
            <td>${reporte.tabla}</td>
            <td>${reporte.periodo}</td>
            <td>
                <span class="badge ${obtenerBadgeFormato(reporte.formato)}">
                    ${reporte.formato}
                </span>
            </td>
            <td>${reporte.registros}</td>
            <td>${reporte.usuario}</td>
            <td>
                <span class="badge ${obtenerBadgeEstado(reporte.estado)}">
                    ${reporte.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="descargarReporte(${index})">
                    Descargar
                </button>
            </td>
        `;

        tablaReportes.appendChild(fila);
    });

    contadorRegistros.textContent = `Mostrando ${lista.length} de ${reportesGenerados.length} reportes`;
    actualizarKPIs();
}

function filtrarReportes() {
    const texto = normalizar(searchInput.value);
    const tipo = filterTipo.value;
    const estado = filterEstado.value;

    const filtrados = reportesGenerados.filter(reporte => {
        const contenido = normalizar(`
            ${reporte.fecha}
            ${reporte.nombre}
            ${reporte.tabla}
            ${reporte.periodo}
            ${reporte.formato}
            ${reporte.usuario}
            ${reporte.estado}
        `);

        const coincideTexto = contenido.includes(texto);
        const coincideTipo = tipo === "" || reporte.tabla === tipo;
        const coincideEstado = estado === "" || reporte.estado === estado;

        return coincideTexto && coincideTipo && coincideEstado;
    });

    reportesFiltrados = filtrados;
    renderReportes(filtrados);
}

function generarReporte() {
    const tipo = document.getElementById("tipo-reporte").value;
    const desde = document.getElementById("fecha-desde").value;
    const hasta = document.getElementById("fecha-hasta").value;
    const formato = document.getElementById("formato-reporte").value;

    if (tipo === "") {
        alert("Selecciona un tipo de reporte.");
        return;
    }

    crearReporte(tipo, desde, hasta, formato);
}

function generarRapido(tipo, formato) {
    crearReporte(tipo, "", "", formato);
}

function crearReporte(tabla, desde, hasta, formato) {
    const datos = obtenerDatosFiltrados(tabla, desde, hasta);
    const periodo = desde && hasta ? `${desde} - ${hasta}` : "Todos los registros";

    if (datos.length === 0) {
        alert("No hay datos para generar el reporte.");
        return;
    }

    const nuevoReporte = {
        fecha: obtenerFechaActual(),
        fecha_iso: obtenerFechaISOActual(),
        nombre: nombresReportes[tabla],
        tabla: tabla,
        periodo: periodo,
        formato: formato,
        registros: datos.length,
        usuario: "Auditor CTIC",
        estado: "Generado",
        datos: datos
    };

    reportesGenerados.unshift(nuevoReporte);
    reportesFiltrados = [...reportesGenerados];

    descargarArchivoReporte(nuevoReporte);
    renderReportes(reportesGenerados);

    alert(`Reporte "${nombresReportes[tabla]}" generado correctamente en ${formato}.`);
}

function descargarReporte(index) {
    const reporte = reportesFiltrados[index];

    if (!reporte) {
        alert("No se encontró el reporte.");
        return;
    }

    reporte.estado = "Descargado";
    descargarArchivoReporte(reporte);
    renderReportes(reportesFiltrados);
}

function descargarArchivoReporte(reporte) {
    if (reporte.formato === "PDF") {
        descargarPDF(reporte);
    } else {
        descargarCSV(`${reporte.tabla}_diagti.csv`, reporte.datos);
    }
}

function descargarCSV(nombreArchivo, datos) {
    if (!datos || datos.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const encabezados = Object.keys(datos[0]);

    const filas = datos.map(item =>
        encabezados.map(campo => item[campo])
    );

    const contenido = [encabezados, ...filas]
        .map(fila => fila.map(valor => `"${String(valor ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob(["\uFEFF" + contenido], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();

    URL.revokeObjectURL(url);
}

function descargarPDF(reporte) {
    if (!reporte.datos || reporte.datos.length === 0) {
        alert("No hay datos para exportar en PDF.");
        return;
    }

    const encabezados = Object.keys(reporte.datos[0]);

    const columnas = encabezados.map(campo => `
        <th>${escaparHTML(campo)}</th>
    `).join("");

    const filas = reporte.datos.map(item => `
        <tr>
            ${encabezados.map(campo => `
                <td>${escaparHTML(item[campo])}</td>
            `).join("")}
        </tr>
    `).join("");

    const html = `
        <html>
        <head>
            <title>${escaparHTML(reporte.nombre)} - DIAGTI</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #1f2a2e;
                }

                h1 {
                    color: #0f75bc;
                    margin-bottom: 4px;
                    font-size: 22px;
                }

                .subtitulo {
                    color: #64757a;
                    margin-bottom: 16px;
                    font-size: 12px;
                }

                .info {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                    font-size: 11px;
                }

                .info div {
                    border: 1px solid #dfe6e5;
                    padding: 8px;
                    border-radius: 6px;
                    background: #f8fafa;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9px;
                }

                th {
                    background: #0f75bc;
                    color: white;
                    padding: 6px;
                    text-align: left;
                    border: 1px solid #0f75bc;
                }

                td {
                    border: 1px solid #dfe6e5;
                    padding: 5px;
                    vertical-align: top;
                    word-break: break-word;
                }

                .footer {
                    margin-top: 18px;
                    font-size: 10px;
                    color: #64757a;
                }
            </style>
        </head>

        <body>
            <h1>${escaparHTML(reporte.nombre)}</h1>

            <div class="subtitulo">
                DIAGTI · CTIC UNAS · Módulo Auditor
            </div>

            <div class="info">
                <div><strong>Tabla:</strong><br>${escaparHTML(reporte.tabla)}</div>
                <div><strong>Período:</strong><br>${escaparHTML(reporte.periodo)}</div>
                <div><strong>Registros:</strong><br>${escaparHTML(reporte.registros)}</div>
                <div><strong>Generado por:</strong><br>${escaparHTML(reporte.usuario)}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        ${columnas}
                    </tr>
                </thead>

                <tbody>
                    ${filas}
                </tbody>
            </table>

            <div class="footer">
                Reporte generado el ${escaparHTML(reporte.fecha)} · Formato PDF.
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `;

    abrirVentanaPDF(html);
}

function abrirVentanaPDF(html) {
    const ventana = window.open("", "_blank");

    if (!ventana) {
        alert("El navegador bloqueó la ventana emergente. Permite pop-ups para generar el PDF.");
        return;
    }

    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
}

function limpiarFormulario() {
    document.getElementById("tipo-reporte").value = "";
    document.getElementById("fecha-desde").value = "";
    document.getElementById("fecha-hasta").value = "";
    document.getElementById("formato-reporte").value = "Excel";
}

function cerrarSesion() {
    document.getElementById("logout-confirm-overlay")?.classList.add("open");
}

function cancelarCerrarSesion() {
    document.getElementById("logout-confirm-overlay")?.classList.remove("open");
}

function confirmarCerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../../login/html/login.html";
}

searchInput.addEventListener("input", filtrarReportes);
filterTipo.addEventListener("change", filtrarReportes);
filterEstado.addEventListener("change", filtrarReportes);

document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.getElementById("logout-confirm-overlay");

    if (overlay) {
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                cancelarCerrarSesion();
            }
        });
    }
});

reportesFiltrados = [...reportesGenerados];
renderReportes(reportesGenerados);
actualizarKPIs();