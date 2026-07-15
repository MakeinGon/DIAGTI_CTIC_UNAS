const reportesGenerados = [
    {
        fecha: "08/07/2026 09:20",
        reporte: "Inventario general",
        modulo: "Inventario",
        periodo: "01/07/2026 - 08/07/2026",
        formato: "PDF",
        usuario: "Auditor CTIC",
        estado: "Generado"
    },
    {
        fecha: "08/07/2026 08:55",
        reporte: "Inventario general",
        modulo: "Inventario",
        periodo: "01/07/2026 - 08/07/2026",
        formato: "Excel",
        usuario: "Auditor CTIC",
        estado: "Descargado"
    },
    {
        fecha: "07/07/2026 15:22",
        reporte: "Auditoría y trazabilidad",
        modulo: "Auditoría",
        periodo: "01/07/2026 - 07/07/2026",
        formato: "PDF",
        usuario: "Auditor CTIC",
        estado: "Generado"
    },
    {
        fecha: "06/07/2026 11:40",
        reporte: "Evidencias técnicas",
        modulo: "Evidencias",
        periodo: "01/07/2026 - 06/07/2026",
        formato: "Excel",
        usuario: "Validador CTIC",
        estado: "Descargado"
    },
    {
        fecha: "05/07/2026 16:10",
        reporte: "Validaciones y observaciones",
        modulo: "Validación",
        periodo: "01/07/2026 - 05/07/2026",
        formato: "PDF",
        usuario: "Auditor CTIC",
        estado: "Pendiente"
    }
];

const tablaReportes = document.getElementById("tabla-reportes");
const searchInput = document.getElementById("search-input");
const filterTipo = document.getElementById("filter-tipo");
const filterFormato = document.getElementById("filter-formato");
const filterEstado = document.getElementById("filter-estado");
const contadorRegistros = document.getElementById("contador-registros");

function obtenerBadgeEstado(estado) {
    if (estado === "Generado") return "status-success";
    if (estado === "Descargado") return "status-info";
    if (estado === "Pendiente") return "status-warning";
    return "status-secondary";
}

function obtenerBadgeFormato(formato) {
    if (formato === "PDF") return "status-danger";
    if (formato === "Excel") return "status-success";
    return "status-secondary";
}

function renderReportes(lista) {
    tablaReportes.innerHTML = "";

    if (lista.length === 0) {
        tablaReportes.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron reportes con los filtros seleccionados.
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 reportes";
        return;
    }

    lista.forEach((reporte, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><strong>${reporte.fecha}</strong></td>
            <td>${reporte.reporte}</td>
            <td>${reporte.modulo}</td>
            <td>${reporte.periodo}</td>
            <td><span class="badge ${obtenerBadgeFormato(reporte.formato)}">${reporte.formato}</span></td>
            <td>${reporte.usuario}</td>
            <td><span class="badge ${obtenerBadgeEstado(reporte.estado)}">${reporte.estado}</span></td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="descargarReporte(${index})">
                    Descargar
                </button>
            </td>
        `;

        tablaReportes.appendChild(fila);
    });

    contadorRegistros.textContent = `Mostrando ${lista.length} de ${reportesGenerados.length} reportes`;
}

function filtrarReportes() {
    const texto = searchInput.value.toLowerCase();
    const tipo = filterTipo.value;
    const formato = filterFormato.value;
    const estado = filterEstado.value;

    const filtrados = reportesGenerados.filter(reporte => {
        const contenido =
            `${reporte.fecha} ${reporte.reporte} ${reporte.modulo} ${reporte.periodo} ${reporte.formato} ${reporte.usuario} ${reporte.estado}`.toLowerCase();

        const coincideTexto = contenido.includes(texto);
        const coincideTipo = tipo === "" || reporte.reporte === tipo;
        const coincideFormato = formato === "" || reporte.formato === formato;
        const coincideEstado = estado === "" || reporte.estado === estado;

        return coincideTexto && coincideTipo && coincideFormato && coincideEstado;
    });

    renderReportes(filtrados);
}

function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minuto = String(fecha.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
}

function generarReporte() {
    const tipo = document.getElementById("tipo-reporte").value;
    const modulo = document.getElementById("modulo-reporte").value || "Todos";
    const formato = document.getElementById("formato-reporte").value;
    const desde = document.getElementById("fecha-desde").value;
    const hasta = document.getElementById("fecha-hasta").value;

    if (tipo === "") {
        alert("Selecciona un tipo de reporte.");
        return;
    }

    const periodo = desde && hasta ? `${desde} - ${hasta}` : "Período no especificado";

    reportesGenerados.unshift({
        fecha: obtenerFechaActual(),
        reporte: tipo,
        modulo: modulo,
        periodo: periodo,
        formato: formato,
        usuario: "Auditor CTIC",
        estado: "Generado"
    });

    renderReportes(reportesGenerados);
    alert(`Reporte "${tipo}" generado correctamente en formato ${formato}.`);
}

function generarRapido(tipo, formato) {
    let modulo = "Inventario";

    if (tipo === "Auditoría y trazabilidad") {
        modulo = "Auditoría";
    }

    if (tipo === "Evidencias técnicas") {
        modulo = "Evidencias";
    }

    reportesGenerados.unshift({
        fecha: obtenerFechaActual(),
        reporte: tipo,
        modulo: modulo,
        periodo: "Período actual",
        formato: formato,
        usuario: "Auditor CTIC",
        estado: "Generado"
    });

    renderReportes(reportesGenerados);
    alert(`Reporte rápido "${tipo}" generado en formato ${formato}.`);
}

function descargarReporte(index) {
    const reporte = reportesGenerados[index];

    if (!reporte) {
        alert("No se encontró el reporte.");
        return;
    }

    reporte.estado = "Descargado";
    renderReportes(reportesGenerados);

    alert(`Descargando reporte: ${reporte.reporte} (${reporte.formato}).`);
}

function limpiarFormulario() {
    document.getElementById("tipo-reporte").value = "";
    document.getElementById("modulo-reporte").value = "";
    document.getElementById("area-reporte").value = "";
    document.getElementById("fecha-desde").value = "";
    document.getElementById("fecha-hasta").value = "";
    document.getElementById("formato-reporte").value = "PDF";
    document.getElementById("estado-reporte").value = "";
}

function cerrarSesion() {
    const confirmar = confirm("¿Deseas cerrar sesión?");
    if (confirmar) {
        alert("Sesión cerrada correctamente");
    }
}

searchInput.addEventListener("input", filtrarReportes);
filterTipo.addEventListener("change", filtrarReportes);
filterFormato.addEventListener("change", filtrarReportes);
filterEstado.addEventListener("change", filtrarReportes);

renderReportes(reportesGenerados);