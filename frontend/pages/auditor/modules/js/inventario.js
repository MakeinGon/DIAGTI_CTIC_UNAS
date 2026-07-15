const sistemas = [
    {
        codigo: "SYS-001",
        iniciales: "SA",
        nombre: "Sistema Académico",
        descripcion: "Matrícula, notas y currícula",
        area: "Dirección Académica",
        tipo: "Web",
        tecnologia: "Angular / Spring Boot",
        estado: "Validado",
        fecha: "08/07/2026",
        responsable: "Dirección de Asuntos Académicos",
        backend: "Spring Boot 3.5",
        bd: "PostgreSQL",
        repositorio: "GitHub institucional",
        servidor: "srv-academico-01",
        ambiente: "Producción",
        backup: "Diario",
        seguridad: [
            { nombre: "SSL/TLS", estado: "Cumple", clase: "ok" },
            { nombre: "Roles", estado: "Cumple", clase: "ok" },
            { nombre: "Logs", estado: "Cumple", clase: "ok" },
            { nombre: "MFA", estado: "Parcial", clase: "warn" }
        ],
        historial: [
            "Sistema validado por CTIC · 08/07/2026",
            "Evidencia SSL registrada · 07/07/2026",
            "Registro enviado a validación · 06/07/2026"
        ]
    },
    {
        codigo: "SYS-002",
        iniciales: "TD",
        nombre: "Trámite Documentario",
        descripcion: "Gestión de documentos internos",
        area: "Secretaría General",
        tipo: "Web",
        tecnologia: "PHP / PostgreSQL",
        estado: "Observado",
        fecha: "07/07/2026",
        responsable: "Secretaría General",
        backend: "PHP",
        bd: "PostgreSQL",
        repositorio: "Repositorio interno",
        servidor: "srv-documentos-01",
        ambiente: "Producción",
        backup: "Semanal",
        seguridad: [
            { nombre: "SSL/TLS", estado: "Cumple", clase: "ok" },
            { nombre: "Roles", estado: "Parcial", clase: "warn" },
            { nombre: "Logs", estado: "Cumple", clase: "ok" },
            { nombre: "Backup", estado: "Pendiente", clase: "warn" }
        ],
        historial: [
            "Observación registrada por CTIC · 07/07/2026",
            "Backup pendiente de evidencia · 07/07/2026",
            "Sistema actualizado por Desarrollo · 06/07/2026"
        ]
    },
    {
        codigo: "SYS-003",
        iniciales: "BI",
        nombre: "Sistema de Biblioteca",
        descripcion: "Catálogo y préstamos bibliográficos",
        area: "Biblioteca Central",
        tipo: "Web",
        tecnologia: "Java 8 / MySQL",
        estado: "Observado",
        fecha: "06/07/2026",
        responsable: "Biblioteca Central",
        backend: "Java 8",
        bd: "MySQL",
        repositorio: "No registrado",
        servidor: "srv-biblioteca-01",
        ambiente: "Producción",
        backup: "No evidenciado",
        seguridad: [
            { nombre: "SSL/TLS", estado: "Pendiente", clase: "warn" },
            { nombre: "Roles", estado: "Parcial", clase: "warn" },
            { nombre: "Logs", estado: "Pendiente", clase: "warn" },
            { nombre: "Backup", estado: "Pendiente", clase: "warn" }
        ],
        historial: [
            "Sistema observado por documentación incompleta · 06/07/2026",
            "Repositorio no registrado · 06/07/2026",
            "Pendiente de subsanación · 05/07/2026"
        ]
    },
    {
        codigo: "SYS-004",
        iniciales: "RR",
        nombre: "Recursos Humanos",
        descripcion: "Personal, asistencia y planillas",
        area: "Recursos Humanos",
        tipo: "Web",
        tecnologia: "Laravel / MariaDB",
        estado: "Validado",
        fecha: "05/07/2026",
        responsable: "Oficina de Recursos Humanos",
        backend: "Laravel",
        bd: "MariaDB",
        repositorio: "GitLab CTIC",
        servidor: "srv-rrhh-01",
        ambiente: "Producción",
        backup: "Diario",
        seguridad: [
            { nombre: "SSL/TLS", estado: "Cumple", clase: "ok" },
            { nombre: "Roles", estado: "Cumple", clase: "ok" },
            { nombre: "Logs", estado: "Cumple", clase: "ok" },
            { nombre: "Backup", estado: "Cumple", clase: "ok" }
        ],
        historial: [
            "Sistema validado por CTIC · 05/07/2026",
            "Evidencias revisadas correctamente · 05/07/2026",
            "Registro actualizado · 04/07/2026"
        ]
    },
    {
        codigo: "SYS-005",
        iniciales: "PI",
        nombre: "Portal Institucional",
        descripcion: "Página principal y servicios web",
        area: "Imagen Institucional",
        tipo: "Web",
        tecnologia: "WordPress / MySQL",
        estado: "Validado",
        fecha: "04/07/2026",
        responsable: "Imagen Institucional",
        backend: "WordPress",
        bd: "MySQL",
        repositorio: "Repositorio web",
        servidor: "srv-portal-01",
        ambiente: "Producción",
        backup: "Diario",
        seguridad: [
            { nombre: "SSL/TLS", estado: "Cumple", clase: "ok" },
            { nombre: "Roles", estado: "Cumple", clase: "ok" },
            { nombre: "Logs", estado: "Cumple", clase: "ok" },
            { nombre: "Backup", estado: "Cumple", clase: "ok" }
        ],
        historial: [
            "Sistema validado · 04/07/2026",
            "SSL registrado correctamente · 04/07/2026",
            "Backup evidenciado · 03/07/2026"
        ]
    },
    {
        codigo: "SYS-006",
        iniciales: "AF",
        nombre: "Sistema de Activos Fijos",
        descripcion: "Inventario físico institucional",
        area: "Economía y Finanzas",
        tipo: "Desktop",
        tecnologia: "Visual Basic / SQL Server",
        estado: "Pendiente",
        fecha: "03/07/2026",
        responsable: "Economía y Finanzas",
        backend: "Visual Basic",
        bd: "SQL Server",
        repositorio: "No registrado",
        servidor: "Equipo local",
        ambiente: "Producción",
        backup: "Pendiente",
        seguridad: [
            { nombre: "SSL/TLS", estado: "No aplica", clase: "warn" },
            { nombre: "Roles", estado: "Pendiente", clase: "warn" },
            { nombre: "Logs", estado: "Pendiente", clase: "warn" },
            { nombre: "Backup", estado: "Pendiente", clase: "warn" }
        ],
        historial: [
            "Sistema pendiente de revisión · 03/07/2026",
            "Falta registrar evidencias técnicas · 03/07/2026",
            "Pendiente de validación CTIC · 02/07/2026"
        ]
    }
];

const tablaInventario = document.getElementById("tabla-inventario");
const searchInput = document.getElementById("search-input");
const filterArea = document.getElementById("filter-area");
const filterEstado = document.getElementById("filter-estado");
const filterTipo = document.getElementById("filter-tipo");
const contadorRegistros = document.getElementById("contador-registros");
const modalDetalle = document.getElementById("modal-detalle");

function obtenerBadgeEstado(estado) {
    if (estado === "Validado") return "status-success";
    if (estado === "Observado") return "status-warning";
    if (estado === "Pendiente") return "status-info";
    return "status-secondary";
}

function obtenerBadgeTipo(tipo) {
    if (tipo === "Web") return "status-info";
    if (tipo === "Desktop") return "status-warning";
    if (tipo === "API") return "status-success";
    return "status-secondary";
}

function renderInventario(lista) {
    tablaInventario.innerHTML = "";

    if (lista.length === 0) {
        tablaInventario.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron sistemas con los filtros seleccionados.
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 registros";
        return;
    }

    lista.forEach(sistema => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><strong>${sistema.codigo}</strong></td>
            <td>
                <div class="cell-system">
                    <div class="system-avatar">${sistema.iniciales}</div>
                    <div>
                        <div class="system-name">${sistema.nombre}</div>
                        <div class="system-desc">${sistema.descripcion}</div>
                    </div>
                </div>
            </td>
            <td>${sistema.area}</td>
            <td><span class="badge ${obtenerBadgeTipo(sistema.tipo)}">${sistema.tipo}</span></td>
            <td>${sistema.tecnologia}</td>
            <td><span class="badge ${obtenerBadgeEstado(sistema.estado)}">${sistema.estado}</span></td>
            <td>${sistema.fecha}</td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="abrirModalDetalle('${sistema.codigo}')">
                    Ver detalle
                </button>
            </td>
        `;

        tablaInventario.appendChild(fila);
    });

    contadorRegistros.textContent = `Mostrando ${lista.length} de ${sistemas.length} registros`;
}

function filtrarInventario() {
    const texto = searchInput.value.toLowerCase();
    const area = filterArea.value;
    const estado = filterEstado.value;
    const tipo = filterTipo.value;

    const filtrados = sistemas.filter(sistema => {
        const coincideTexto =
            sistema.codigo.toLowerCase().includes(texto) ||
            sistema.nombre.toLowerCase().includes(texto) ||
            sistema.descripcion.toLowerCase().includes(texto) ||
            sistema.area.toLowerCase().includes(texto) ||
            sistema.tipo.toLowerCase().includes(texto) ||
            sistema.tecnologia.toLowerCase().includes(texto) ||
            sistema.estado.toLowerCase().includes(texto);

        const coincideArea = area === "" || sistema.area === area;
        const coincideEstado = estado === "" || sistema.estado === estado;
        const coincideTipo = tipo === "" || sistema.tipo === tipo;

        return coincideTexto && coincideArea && coincideEstado && coincideTipo;
    });

    renderInventario(filtrados);
}

function abrirModalDetalle(codigo) {
    const sistema = sistemas.find(item => item.codigo === codigo);

    if (!sistema) {
        alert("No se encontró el detalle del sistema.");
        return;
    }

    document.getElementById("modal-codigo").textContent = sistema.codigo;
    document.getElementById("modal-nombre").textContent = sistema.nombre;
    document.getElementById("modal-descripcion").textContent = sistema.descripcion;

    document.getElementById("modal-area").textContent = sistema.area;
    document.getElementById("modal-responsable").textContent = sistema.responsable;
    document.getElementById("modal-tipo").textContent = sistema.tipo;
    document.getElementById("modal-estado").textContent = sistema.estado;

    document.getElementById("modal-tecnologia").textContent = sistema.tecnologia;
    document.getElementById("modal-backend").textContent = sistema.backend;
    document.getElementById("modal-bd").textContent = sistema.bd;
    document.getElementById("modal-repositorio").textContent = sistema.repositorio;

    document.getElementById("modal-servidor").textContent = sistema.servidor;
    document.getElementById("modal-ambiente").textContent = sistema.ambiente;
    document.getElementById("modal-backup").textContent = sistema.backup;
    document.getElementById("modal-fecha").textContent = sistema.fecha;

    document.getElementById("modal-badges").innerHTML = `
        <span class="badge ${obtenerBadgeTipo(sistema.tipo)}">${sistema.tipo}</span>
        <span class="badge ${obtenerBadgeEstado(sistema.estado)}">${sistema.estado}</span>
        <span class="badge status-secondary">Solo lectura</span>
    `;

    const seguridad = document.getElementById("modal-seguridad");
    seguridad.innerHTML = "";

    sistema.seguridad.forEach(item => {
        seguridad.innerHTML += `
            <div class="security-item ${item.clase}">
                <b>${item.nombre}</b>
                <span>${item.estado}</span>
            </div>
        `;
    });

    const historial = document.getElementById("modal-historial");
    historial.innerHTML = "";

    sistema.historial.forEach(item => {
        historial.innerHTML += `
            <div class="timeline-item">
                <b>${item.split("·")[0]}</b>
                <span>${item.includes("·") ? item.split("·")[1].trim() : ""}</span>
            </div>
        `;
    });

    modalDetalle.classList.add("active");
    document.body.style.overflow = "hidden";
}

function cerrarModalDetalle() {
    modalDetalle.classList.remove("active");
    document.body.style.overflow = "";
}

function cerrarSesion() {
    const confirmar = confirm("¿Deseas cerrar sesión?");
    if (confirmar) {
        alert("Sesión cerrada correctamente");
    }
}

searchInput.addEventListener("input", filtrarInventario);
filterArea.addEventListener("change", filtrarInventario);
filterEstado.addEventListener("change", filtrarInventario);
filterTipo.addEventListener("change", filtrarInventario);

modalDetalle.addEventListener("click", function (e) {
    if (e.target === modalDetalle) {
        cerrarModalDetalle();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        cerrarModalDetalle();
    }
});

renderInventario(sistemas);