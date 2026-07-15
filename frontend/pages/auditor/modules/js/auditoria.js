const logsAuditoria = [
    {
        fecha: "2026-07-08",
        hora: "08:45",
        usuario: "Juan Perez",
        correo: "jperez@unas.edu.pe",
        rol: "Área Desarrollo",
        modulo: "Inventario",
        accion: "Actualización",
        entidad: "Sistema Académico",
        valorAnterior: "Estado: Borrador",
        valorNuevo: "Estado: Enviado",
        ip: "192.168.1.25",
        estado: "Registrado"
    },
    {
        fecha: "2026-07-08",
        hora: "08:12",
        usuario: "María Rojas",
        correo: "mrojas@unas.edu.pe",
        rol: "Área Infraestructura",
        modulo: "Seguridad",
        accion: "Registro",
        entidad: "Certificado SSL - Portal Institucional",
        valorAnterior: "No registrado",
        valorNuevo: "SSL vigente registrado",
        ip: "192.168.1.31",
        estado: "Correcto"
    },
    {
        fecha: "2026-07-07",
        hora: "17:40",
        usuario: "Validador CTIC",
        correo: "validador@unas.edu.pe",
        rol: "Validador Técnico CTIC",
        modulo: "Validación",
        accion: "Observación",
        entidad: "Sistema de Biblioteca",
        valorAnterior: "Pendiente de revisión",
        valorNuevo: "Observado por documentación incompleta",
        ip: "192.168.1.18",
        estado: "Observado"
    },
    {
        fecha: "2026-07-07",
        hora: "15:22",
        usuario: "Auditor CTIC",
        correo: "auditor@unas.edu.pe",
        rol: "Auditor / OCI",
        modulo: "Reportes",
        accion: "Exportación",
        entidad: "Reporte de Inventario",
        valorAnterior: "No aplica",
        valorNuevo: "Excel generado",
        ip: "192.168.1.10",
        estado: "Consultado"
    },
    {
        fecha: "2026-07-07",
        hora: "11:05",
        usuario: "Carlos Medina",
        correo: "cmedina@unas.edu.pe",
        rol: "Área Desarrollo",
        modulo: "Evidencias",
        accion: "Registro",
        entidad: "Manual técnico - Sistema Académico",
        valorAnterior: "Sin evidencia",
        valorNuevo: "Archivo adjuntado",
        ip: "192.168.1.26",
        estado: "Correcto"
    },
    {
        fecha: "2026-07-06",
        hora: "09:33",
        usuario: "Usuario LDAP",
        correo: "externo@unas.edu.pe",
        rol: "No autenticado",
        modulo: "Acceso",
        accion: "Intento fallido",
        entidad: "Login LDAP",
        valorAnterior: "Intento de ingreso",
        valorNuevo: "Credenciales inválidas",
        ip: "192.168.1.90",
        estado: "Fallido"
    },
    {
        fecha: "2026-07-05",
        hora: "16:18",
        usuario: "Admin CTIC",
        correo: "admin@unas.edu.pe",
        rol: "Administrador CTIC",
        modulo: "Administración",
        accion: "Eliminación lógica",
        entidad: "Sistema Antiguo de Biblioteca",
        valorAnterior: "Activo",
        valorNuevo: "Eliminado lógicamente",
        ip: "192.168.1.12",
        estado: "Crítico"
    }
];

const tablaAuditoria = document.getElementById("tabla-auditoria");
const searchInput = document.getElementById("search-input");
const filterModulo = document.getElementById("filter-modulo");
const filterAccion = document.getElementById("filter-accion");
const filterEstado = document.getElementById("filter-estado");
const filterDesde = document.getElementById("filter-desde");
const filterHasta = document.getElementById("filter-hasta");
const contadorRegistros = document.getElementById("contador-registros");

function formatearFecha(fechaISO, hora) {
    const partes = fechaISO.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]} ${hora}`;
}

function obtenerBadgeEstado(estado) {
    if (estado === "Correcto") return "status-success";
    if (estado === "Registrado") return "status-info";
    if (estado === "Observado") return "status-warning";
    if (estado === "Fallido") return "status-danger";
    if (estado === "Crítico") return "status-danger";
    if (estado === "Consultado") return "status-secondary";
    return "status-secondary";
}

function renderAuditoria(lista) {
    tablaAuditoria.innerHTML = "";

    if (lista.length === 0) {
        tablaAuditoria.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron eventos con los filtros seleccionados.
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 eventos";
        return;
    }

    lista.forEach(log => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><strong>${formatearFecha(log.fecha, log.hora)}</strong></td>
            <td>
                <div class="user-cell">
                    <b>${log.usuario}</b>
                    <span>${log.correo}</span>
                </div>
            </td>
            <td>${log.rol}</td>
            <td>${log.modulo}</td>
            <td>${log.accion}</td>
            <td><strong>${log.entidad}</strong></td>
            <td><div class="value-cell">${log.valorAnterior}</div></td>
            <td><div class="value-cell">${log.valorNuevo}</div></td>
            <td><span class="ip-cell">${log.ip}</span></td>
            <td><span class="badge ${obtenerBadgeEstado(log.estado)}">${log.estado}</span></td>
        `;

        tablaAuditoria.appendChild(fila);
    });

    contadorRegistros.textContent = `Mostrando ${lista.length} de ${logsAuditoria.length} eventos auditables`;
}

function filtrarAuditoria() {
    const texto = searchInput.value.toLowerCase();
    const modulo = filterModulo.value;
    const accion = filterAccion.value;
    const estado = filterEstado.value;
    const desde = filterDesde.value;
    const hasta = filterHasta.value;

    const filtrados = logsAuditoria.filter(log => {
        const contenido =
            `${log.fecha} ${log.hora} ${log.usuario} ${log.correo} ${log.rol} ${log.modulo} ${log.accion} ${log.entidad} ${log.valorAnterior} ${log.valorNuevo} ${log.ip} ${log.estado}`.toLowerCase();

        const coincideTexto = contenido.includes(texto);
        const coincideModulo = modulo === "" || log.modulo === modulo;
        const coincideAccion = accion === "" || log.accion === accion;
        const coincideEstado = estado === "" || log.estado === estado;
        const coincideDesde = desde === "" || log.fecha >= desde;
        const coincideHasta = hasta === "" || log.fecha <= hasta;

        return coincideTexto && coincideModulo && coincideAccion && coincideEstado && coincideDesde && coincideHasta;
    });

    renderAuditoria(filtrados);
}

function cerrarSesion() {
    const confirmar = confirm("¿Deseas cerrar sesión?");
    if (confirmar) {
        alert("Sesión cerrada correctamente");
    }
}

function exportarExcel() {
    alert("Reporte de auditoría en Excel generado correctamente.");
}

searchInput.addEventListener("input", filtrarAuditoria);
filterModulo.addEventListener("change", filtrarAuditoria);
filterAccion.addEventListener("change", filtrarAuditoria);
filterEstado.addEventListener("change", filtrarAuditoria);
filterDesde.addEventListener("change", filtrarAuditoria);
filterHasta.addEventListener("change", filtrarAuditoria);

renderAuditoria(logsAuditoria);