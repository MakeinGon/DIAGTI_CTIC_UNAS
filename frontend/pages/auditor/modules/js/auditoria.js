const logsAuditoria = [
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
        modulo: "Auditoría",
        accion: "Consulta",
        descripcion: "El auditor consultó el historial de eventos del sistema.",
        fecha_evento: "2026-07-16 08:50:00",
        direccion_ip: "192.168.1.10"
    },
    {
        id_auditoria: 3,
        id_usuario: 1,
        usuario: "Auditor CTIC",
        correo: "auditor@unas.edu.pe",
        modulo: "Reportes",
        accion: "Exportación",
        descripcion: "El auditor exportó el reporte de inventario en Excel.",
        fecha_evento: "2026-07-16 09:10:00",
        direccion_ip: "192.168.1.10"
    },
    {
        id_auditoria: 4,
        id_usuario: null,
        usuario: "Usuario no registrado",
        correo: "Sin correo",
        modulo: "Acceso",
        accion: "Intento fallido",
        descripcion: "Intento fallido de inicio de sesión mediante LDAP.",
        fecha_evento: "2026-07-16 09:33:00",
        direccion_ip: "192.168.1.90"
    },
    {
        id_auditoria: 5,
        id_usuario: 2,
        usuario: "Administrador CTIC",
        correo: "admin@unas.edu.pe",
        modulo: "Sistemas",
        accion: "Registro",
        descripcion: "Se registró el sistema informático Sistema Académico.",
        fecha_evento: "2026-07-16 09:45:00",
        direccion_ip: "192.168.1.15"
    },
    {
        id_auditoria: 6,
        id_usuario: 3,
        usuario: "Área Desarrollo",
        correo: "desarrollo@unas.edu.pe",
        modulo: "Inventario",
        accion: "Actualización",
        descripcion: "Se actualizó información técnica del sistema Trámite Documentario.",
        fecha_evento: "2026-07-16 10:05:00",
        direccion_ip: "192.168.1.22"
    },
    {
        id_auditoria: 7,
        id_usuario: 4,
        usuario: "Validador CTIC",
        correo: "validador@unas.edu.pe",
        modulo: "Sistemas",
        accion: "Actualización",
        descripcion: "El sistema Trámite Documentario fue observado por falta de evidencias.",
        fecha_evento: "2026-07-16 10:20:00",
        direccion_ip: "192.168.1.30"
    },
    {
        id_auditoria: 8,
        id_usuario: 3,
        usuario: "Área Desarrollo",
        correo: "desarrollo@unas.edu.pe",
        modulo: "Evidencias",
        accion: "Registro",
        descripcion: "Se cargó evidencia técnica del Sistema Académico.",
        fecha_evento: "2026-07-16 10:35:00",
        direccion_ip: "192.168.1.22"
    },
    {
        id_auditoria: 9,
        id_usuario: 4,
        usuario: "Validador CTIC",
        correo: "validador@unas.edu.pe",
        modulo: "Sistemas",
        accion: "Actualización",
        descripcion: "El Sistema Académico fue validado correctamente.",
        fecha_evento: "2026-07-16 10:50:00",
        direccion_ip: "192.168.1.30"
    },
    {
        id_auditoria: 10,
        id_usuario: 1,
        usuario: "Auditor CTIC",
        correo: "auditor@unas.edu.pe",
        modulo: "Reportes",
        accion: "Exportación",
        descripcion: "El auditor exportó el reporte de auditoría en PDF.",
        fecha_evento: "2026-07-16 11:05:00",
        direccion_ip: "192.168.1.10"
    },
    {
        id_auditoria: 11,
        id_usuario: 2,
        usuario: "Administrador CTIC",
        correo: "admin@unas.edu.pe",
        modulo: "Administración",
        accion: "Actualización",
        descripcion: "Se actualizó el estado de un usuario interno.",
        fecha_evento: "2026-07-16 11:20:00",
        direccion_ip: "192.168.1.15"
    },
    {
        id_auditoria: 12,
        id_usuario: 5,
        usuario: "Infraestructura CTIC",
        correo: "infraestructura@unas.edu.pe",
        modulo: "Sistemas",
        accion: "Registro",
        descripcion: "Se registró información de servidor, dominio e IP del Sistema Financiero.",
        fecha_evento: "2026-07-16 11:40:00",
        direccion_ip: "192.168.1.35"
    },
    {
        id_auditoria: 13,
        id_usuario: null,
        usuario: "Usuario no registrado",
        correo: "Sin correo",
        modulo: "Acceso",
        accion: "Intento fallido",
        descripcion: "Intento fallido por contraseña incorrecta.",
        fecha_evento: "2026-07-16 12:05:00",
        direccion_ip: "192.168.1.91"
    },
    {
        id_auditoria: 14,
        id_usuario: 2,
        usuario: "Administrador CTIC",
        correo: "admin@unas.edu.pe",
        modulo: "Sistemas",
        accion: "Eliminación lógica",
        descripcion: "Se aplicó eliminación lógica al Sistema Antiguo de Biblioteca.",
        fecha_evento: "2026-07-16 12:30:00",
        direccion_ip: "192.168.1.15"
    },
    {
        id_auditoria: 15,
        id_usuario: 1,
        usuario: "Auditor CTIC",
        correo: "auditor@unas.edu.pe",
        modulo: "Reportes",
        accion: "Exportación",
        descripcion: "El auditor exportó el reporte de observaciones en Excel.",
        fecha_evento: "2026-07-16 12:45:00",
        direccion_ip: "192.168.1.10"
    },
    {
        id_auditoria: 16,
        id_usuario: 3,
        usuario: "Área Desarrollo",
        correo: "desarrollo@unas.edu.pe",
        modulo: "Sistemas",
        accion: "Registro",
        descripcion: "Se registró el Sistema de Investigación FIIS.",
        fecha_evento: "2026-07-16 13:05:00",
        direccion_ip: "192.168.1.22"
    },
    {
        id_auditoria: 17,
        id_usuario: 5,
        usuario: "Infraestructura CTIC",
        correo: "infraestructura@unas.edu.pe",
        modulo: "Seguridad",
        accion: "Actualización",
        descripcion: "Se actualizó información de SSL, backup y logs del Aula Virtual.",
        fecha_evento: "2026-07-16 13:25:00",
        direccion_ip: "192.168.1.35"
    },
    {
        id_auditoria: 18,
        id_usuario: 4,
        usuario: "Validador CTIC",
        correo: "validador@unas.edu.pe",
        modulo: "Sistemas",
        accion: "Actualización",
        descripcion: "El Sistema de Patrimonio fue observado por soporte vencido y riesgo crítico.",
        fecha_evento: "2026-07-16 13:50:00",
        direccion_ip: "192.168.1.30"
    },
    {
        id_auditoria: 19,
        id_usuario: 1,
        usuario: "Auditor CTIC",
        correo: "auditor@unas.edu.pe",
        modulo: "Auditoría",
        accion: "Consulta",
        descripcion: "El auditor filtró eventos por rango de fechas y módulo Reportes.",
        fecha_evento: "2026-07-16 14:10:00",
        direccion_ip: "192.168.1.10"
    },
    {
        id_auditoria: 20,
        id_usuario: 1,
        usuario: "Auditor CTIC",
        correo: "auditor@unas.edu.pe",
        modulo: "Reportes",
        accion: "Exportación",
        descripcion: "El auditor exportó el historial de auditoría en formato PDF.",
        fecha_evento: "2026-07-16 14:30:00",
        direccion_ip: "192.168.1.10"
    }
];

let auditoriaActual = [...logsAuditoria];

let paginaActual = 1;
const registrosPorPagina = 5;

const tablaAuditoria = document.getElementById("tabla-auditoria");
const searchInput = document.getElementById("search-input");
const filterModulo = document.getElementById("filter-modulo");
const filterAccion = document.getElementById("filter-accion");
const filterDesde = document.getElementById("filter-desde");
const filterHasta = document.getElementById("filter-hasta");
const contadorRegistros = document.getElementById("contador-registros");
const paginacion = document.getElementById("paginacion");

const kpiTotal = document.getElementById("kpi-total");
const kpiConsultas = document.getElementById("kpi-consultas");
const kpiFallidos = document.getElementById("kpi-fallidos");
const kpiExportaciones = document.getElementById("kpi-exportaciones");

function formatearFecha(fechaEvento) {
    if (!fechaEvento) return "-";

    const fecha = new Date(fechaEvento.replace(" ", "T"));

    if (isNaN(fecha.getTime())) {
        return fechaEvento;
    }

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minuto = String(fecha.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
}

function obtenerFechaISO(fechaEvento) {
    if (!fechaEvento) return "";
    return fechaEvento.substring(0, 10);
}

function obtenerClaseAccion(accion) {
    if (accion === "Consulta") return "action-consulta";
    if (accion === "Exportación") return "action-exportacion";
    if (accion === "Intento fallido") return "action-fallido";
    if (accion === "Eliminación lógica") return "action-eliminacion";

    return "action-default";
}

function actualizarKPIs(lista) {
    const total = lista.length;
    const consultas = lista.filter(item => item.accion === "Consulta").length;
    const fallidos = lista.filter(item => item.accion === "Intento fallido").length;
    const exportaciones = lista.filter(item => item.accion === "Exportación").length;

    kpiTotal.textContent = total;
    kpiConsultas.textContent = consultas;
    kpiFallidos.textContent = fallidos;
    kpiExportaciones.textContent = exportaciones;
}

function renderAuditoria(lista) {
    tablaAuditoria.innerHTML = "";

    const totalRegistros = lista.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas || 1;
    }

    if (totalRegistros === 0) {
        tablaAuditoria.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron eventos con los filtros seleccionados.
                </td>
            </tr>
        `;

        contadorRegistros.textContent = "Mostrando 0 eventos";
        actualizarKPIs(lista);
        renderPaginacion(0);
        return;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = lista.slice(inicio, fin);

    registrosPagina.forEach(log => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><span class="id-cell">#${log.id_auditoria}</span></td>

            <td><strong>${formatearFecha(log.fecha_evento)}</strong></td>

            <td>
                <div class="user-cell">
                    <b>${log.usuario || "Usuario no registrado"}</b>
                </div>
            </td>

            <td><span class="email-cell">${log.correo || "Sin correo"}</span></td>

            <td>${log.modulo || "-"}</td>

            <td>
                <span class="action-badge ${obtenerClaseAccion(log.accion)}">
                    ${log.accion || "-"}
                </span>
            </td>

            <td><div class="desc-cell">${log.descripcion || "-"}</div></td>

            <td><span class="ip-cell">${log.direccion_ip || "-"}</span></td>
        `;

        tablaAuditoria.appendChild(fila);
    });

    const desde = inicio + 1;
    const hasta = Math.min(fin, totalRegistros);

    contadorRegistros.textContent = `Mostrando ${desde} - ${hasta} de ${totalRegistros} eventos auditables`;

    actualizarKPIs(lista);
    renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
    paginacion.innerHTML = "";

    if (totalPaginas <= 0) {
        return;
    }

    paginacion.innerHTML += `
        <button class="btn btn-ghost btn-sm" onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? "disabled" : ""}>
            Anterior
        </button>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        paginacion.innerHTML += `
            <button class="page ${i === paginaActual ? "active" : ""}" onclick="cambiarPagina(${i})">
                ${i}
            </button>
        `;
    }

    paginacion.innerHTML += `
        <button class="btn btn-ghost btn-sm" onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? "disabled" : ""}>
            Siguiente
        </button>
    `;
}

function cambiarPagina(numeroPagina) {
    const totalPaginas = Math.ceil(auditoriaActual.length / registrosPorPagina);

    if (numeroPagina < 1 || numeroPagina > totalPaginas) {
        return;
    }

    paginaActual = numeroPagina;
    renderAuditoria(auditoriaActual);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function filtrarAuditoria() {
    const texto = searchInput.value.toLowerCase();
    const modulo = filterModulo.value;
    const accion = filterAccion.value;
    const desde = filterDesde.value;
    const hasta = filterHasta.value;

    const filtrados = logsAuditoria.filter(log => {
        const contenido = `
            ${log.id_auditoria}
            ${log.usuario}
            ${log.correo}
            ${log.modulo}
            ${log.accion}
            ${log.descripcion}
            ${log.fecha_evento}
            ${log.direccion_ip}
        `.toLowerCase();

        const fechaLog = obtenerFechaISO(log.fecha_evento);

        const coincideTexto = contenido.includes(texto);
        const coincideModulo = modulo === "" || log.modulo === modulo;
        const coincideAccion = accion === "" || log.accion === accion;
        const coincideDesde = desde === "" || fechaLog >= desde;
        const coincideHasta = hasta === "" || fechaLog <= hasta;

        return coincideTexto && coincideModulo && coincideAccion && coincideDesde && coincideHasta;
    });

    auditoriaActual = filtrados;
    paginaActual = 1;
    renderAuditoria(filtrados);
}

function exportarExcel() {
    if (auditoriaActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const encabezados = [
        "ID",
        "Fecha y hora",
        "Usuario",
        "Correo",
        "Módulo",
        "Acción",
        "Descripción",
        "IP origen"
    ];

    const filas = auditoriaActual.map(log => [
        log.id_auditoria,
        formatearFecha(log.fecha_evento),
        log.usuario,
        log.correo,
        log.modulo,
        log.accion,
        log.descripcion,
        log.direccion_ip
    ]);

    const contenido = [encabezados, ...filas]
        .map(fila => fila.map(valor => `"${String(valor ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob(["\uFEFF" + contenido], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "auditoria_diagti.csv";
    enlace.click();

    URL.revokeObjectURL(url);
}

function exportarPDF() {
    if (auditoriaActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const filas = auditoriaActual.map(log => `
        <tr>
            <td>${log.id_auditoria}</td>
            <td>${formatearFecha(log.fecha_evento)}</td>
            <td>${log.usuario || "Usuario no registrado"}</td>
            <td>${log.correo || "Sin correo"}</td>
            <td>${log.modulo || "-"}</td>
            <td>${log.accion || "-"}</td>
            <td>${log.descripcion || "-"}</td>
            <td>${log.direccion_ip || "-"}</td>
        </tr>
    `).join("");

    const html = `
        <html>
        <head>
            <title>Reporte de Auditoría - DIAGTI</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 30px;
                    color: #1f2a2e;
                }

                h1 {
                    color: #0f75bc;
                    margin-bottom: 4px;
                }

                .subtitulo {
                    color: #64757a;
                    margin-bottom: 20px;
                    font-size: 13px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }

                th {
                    background: #0f75bc;
                    color: white;
                    padding: 8px;
                    text-align: left;
                }

                td {
                    border: 1px solid #dfe6e5;
                    padding: 7px;
                    vertical-align: top;
                }

                .footer {
                    margin-top: 24px;
                    font-size: 11px;
                    color: #64757a;
                }
            </style>
        </head>

        <body>
            <h1>Reporte de Auditoría del Sistema</h1>
            <div class="subtitulo">
                DIAGTI · CTIC UNAS · Módulo Auditor
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha y hora</th>
                        <th>Usuario</th>
                        <th>Correo</th>
                        <th>Módulo</th>
                        <th>Acción</th>
                        <th>Descripción</th>
                        <th>IP origen</th>
                    </tr>
                </thead>

                <tbody>
                    ${filas}
                </tbody>
            </table>

            <div class="footer">
                Reporte generado por Auditor CTIC. Total de eventos: ${auditoriaActual.length}.
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

searchInput.addEventListener("input", filtrarAuditoria);
filterModulo.addEventListener("change", filtrarAuditoria);
filterAccion.addEventListener("change", filtrarAuditoria);
filterDesde.addEventListener("change", filtrarAuditoria);
filterHasta.addEventListener("change", filtrarAuditoria);

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

renderAuditoria(logsAuditoria);