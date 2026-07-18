const sistemas = [
    {
        id_sistema: 1,
        codigo_unico: "SYS-001",
        nombre: "Sistema Académico",
        descripcion: "Matrícula, notas, cursos y currícula académica.",
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
        descripcion: "Gestión de documentos, expedientes y derivaciones internas.",
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
    },
    {
        id_sistema: 3,
        codigo_unico: "SYS-003",
        nombre: "Sistema de Biblioteca",
        descripcion: "Catálogo bibliográfico, préstamos y devoluciones.",
        id_area_usuario: 3,
        id_tipo_aplicativo: 1,
        id_criticidad: 2,
        forma_adquisicion: "Desarrollo interno",
        id_responsable_funcional: 5,
        id_responsable_tecnico: null,
        ano_adquisicion: 2015,
        desarrollador_nombre: "Equipo anterior CTIC",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: true,
        estado_flujo: "OBSERVADO",
        nivel_riesgo: "CRITICO",
        prioridad_migracion: "INMEDIATA",
        fecha_creacion: "2026-07-15 10:20:00",
        fecha_actualizacion: "2026-07-16 09:30:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 4,
        codigo_unico: "SYS-004",
        nombre: "Recursos Humanos",
        descripcion: "Gestión de personal, asistencia, contratos y planillas.",
        id_area_usuario: 4,
        id_tipo_aplicativo: 1,
        id_criticidad: 3,
        forma_adquisicion: "Compra",
        id_responsable_funcional: 6,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2019,
        desarrollador_nombre: "Proveedor RRHH",
        contrato_vigente: true,
        fecha_vencimiento_soporte: "2027-06-30",
        es_legacy: false,
        estado_flujo: "VALIDADO",
        nivel_riesgo: "BAJO",
        prioridad_migracion: "MONITOREO",
        fecha_creacion: "2026-07-15 11:00:00",
        fecha_actualizacion: "2026-07-16 10:00:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 5,
        codigo_unico: "SYS-005",
        nombre: "Sistema Financiero",
        descripcion: "Control de ingresos, egresos, pagos y reportes financieros.",
        id_area_usuario: 5,
        id_tipo_aplicativo: 1,
        id_criticidad: 4,
        forma_adquisicion: "Proveedor externo",
        id_responsable_funcional: 7,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2018,
        desarrollador_nombre: "Proveedor Financiero",
        contrato_vigente: false,
        fecha_vencimiento_soporte: "2025-12-31",
        es_legacy: false,
        estado_flujo: "ENVIADO",
        nivel_riesgo: "ALTO",
        prioridad_migracion: "CORTO PLAZO",
        fecha_creacion: "2026-07-15 12:10:00",
        fecha_actualizacion: "2026-07-16 10:20:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 6,
        codigo_unico: "SYS-006",
        nombre: "Mesa de Ayuda CTIC",
        descripcion: "Registro de incidencias, solicitudes y atención técnica.",
        id_area_usuario: 6,
        id_tipo_aplicativo: 1,
        id_criticidad: 2,
        forma_adquisicion: "Desarrollo CTIC",
        id_responsable_funcional: 8,
        id_responsable_tecnico: 9,
        ano_adquisicion: 2024,
        desarrollador_nombre: "CTIC UNAS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "SUBSANADO",
        nivel_riesgo: "MEDIO",
        prioridad_migracion: "MEDIANO PLAZO",
        fecha_creacion: "2026-07-15 13:00:00",
        fecha_actualizacion: "2026-07-16 10:50:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 7,
        codigo_unico: "SYS-007",
        nombre: "Portal de Transparencia",
        descripcion: "Publicación de documentos institucionales y reportes públicos.",
        id_area_usuario: 7,
        id_tipo_aplicativo: 1,
        id_criticidad: 2,
        forma_adquisicion: "Convenio",
        id_responsable_funcional: 10,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2022,
        desarrollador_nombre: "Equipo mixto",
        contrato_vigente: true,
        fecha_vencimiento_soporte: "2027-01-15",
        es_legacy: false,
        estado_flujo: "BORRADOR",
        nivel_riesgo: "MEDIO",
        prioridad_migracion: "MONITOREO",
        fecha_creacion: "2026-07-15 14:00:00",
        fecha_actualizacion: "2026-07-16 11:10:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 8,
        codigo_unico: "SYS-008",
        nombre: "Sistema de Investigación FIIS",
        descripcion: "Gestión de proyectos, propuestas, asesores, revisores y evidencias.",
        id_area_usuario: 8,
        id_tipo_aplicativo: 1,
        id_criticidad: 3,
        forma_adquisicion: "Desarrollo académico",
        id_responsable_funcional: 11,
        id_responsable_tecnico: 12,
        ano_adquisicion: 2026,
        desarrollador_nombre: "Equipo FIIS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "ENVIADO",
        nivel_riesgo: "BAJO",
        prioridad_migracion: "MONITOREO",
        fecha_creacion: "2026-07-15 15:00:00",
        fecha_actualizacion: "2026-07-16 11:25:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 9,
        codigo_unico: "SYS-009",
        nombre: "Sistema Antiguo de Biblioteca",
        descripcion: "Sistema anterior conservado por trazabilidad histórica.",
        id_area_usuario: 3,
        id_tipo_aplicativo: 8,
        id_criticidad: 2,
        forma_adquisicion: "Desarrollo antiguo",
        id_responsable_funcional: null,
        id_responsable_tecnico: null,
        ano_adquisicion: 2010,
        desarrollador_nombre: "No identificado",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: true,
        estado_flujo: "CERRADO",
        nivel_riesgo: "CRITICO",
        prioridad_migracion: "INMEDIATA",
        fecha_creacion: "2026-07-15 16:00:00",
        fecha_actualizacion: "2026-07-16 11:40:00",
        fecha_eliminacion: "2026-07-16 11:45:00"
    },
    {
        id_sistema: 10,
        codigo_unico: "SYS-010",
        nombre: "Sistema de Egresados",
        descripcion: "Seguimiento de egresados, empleabilidad y encuestas.",
        id_area_usuario: 9,
        id_tipo_aplicativo: 1,
        id_criticidad: 2,
        forma_adquisicion: "Desarrollo CTIC",
        id_responsable_funcional: 13,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2023,
        desarrollador_nombre: "CTIC UNAS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "RECHAZADO",
        nivel_riesgo: "MEDIO",
        prioridad_migracion: "MEDIANO PLAZO",
        fecha_creacion: "2026-07-15 17:00:00",
        fecha_actualizacion: "2026-07-16 12:00:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 11,
        codigo_unico: "SYS-011",
        nombre: "Sistema de Admisión",
        descripcion: "Registro de postulantes, pagos, aulas y resultados de admisión.",
        id_area_usuario: 10,
        id_tipo_aplicativo: 1,
        id_criticidad: 4,
        forma_adquisicion: "Desarrollo CTIC",
        id_responsable_funcional: 14,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2022,
        desarrollador_nombre: "CTIC UNAS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "VALIDADO",
        nivel_riesgo: "MEDIO",
        prioridad_migracion: "MEDIANO PLAZO",
        fecha_creacion: "2026-07-15 17:30:00",
        fecha_actualizacion: "2026-07-16 12:20:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 12,
        codigo_unico: "SYS-012",
        nombre: "Control de Laboratorios",
        descripcion: "Reserva de laboratorios, equipos y horarios de prácticas.",
        id_area_usuario: 11,
        id_tipo_aplicativo: 1,
        id_criticidad: 2,
        forma_adquisicion: "Desarrollo académico",
        id_responsable_funcional: 15,
        id_responsable_tecnico: 12,
        ano_adquisicion: 2025,
        desarrollador_nombre: "Equipo FIIS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "BORRADOR",
        nivel_riesgo: "BAJO",
        prioridad_migracion: "MONITOREO",
        fecha_creacion: "2026-07-15 18:00:00",
        fecha_actualizacion: "2026-07-16 12:40:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 13,
        codigo_unico: "SYS-013",
        nombre: "Sistema de Almacén",
        descripcion: "Control de bienes, entradas, salidas y kardex institucional.",
        id_area_usuario: 12,
        id_tipo_aplicativo: 1,
        id_criticidad: 3,
        forma_adquisicion: "Compra",
        id_responsable_funcional: 16,
        id_responsable_tecnico: 5,
        ano_adquisicion: 2017,
        desarrollador_nombre: "Proveedor Logístico",
        contrato_vigente: false,
        fecha_vencimiento_soporte: "2024-12-31",
        es_legacy: true,
        estado_flujo: "OBSERVADO",
        nivel_riesgo: "ALTO",
        prioridad_migracion: "CORTO PLAZO",
        fecha_creacion: "2026-07-15 18:20:00",
        fecha_actualizacion: "2026-07-16 13:00:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 14,
        codigo_unico: "SYS-014",
        nombre: "Aula Virtual",
        descripcion: "Gestión de cursos virtuales, materiales, tareas y evaluaciones.",
        id_area_usuario: 13,
        id_tipo_aplicativo: 1,
        id_criticidad: 4,
        forma_adquisicion: "Software libre",
        id_responsable_funcional: 17,
        id_responsable_tecnico: 5,
        ano_adquisicion: 2020,
        desarrollador_nombre: "Comunidad Moodle",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "VALIDADO",
        nivel_riesgo: "BAJO",
        prioridad_migracion: "MONITOREO",
        fecha_creacion: "2026-07-15 18:40:00",
        fecha_actualizacion: "2026-07-16 13:20:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 15,
        codigo_unico: "SYS-015",
        nombre: "Sistema de Convenios",
        descripcion: "Registro de convenios, entidades cooperantes y vigencias.",
        id_area_usuario: 14,
        id_tipo_aplicativo: 1,
        id_criticidad: 2,
        forma_adquisicion: "Desarrollo CTIC",
        id_responsable_funcional: 18,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2024,
        desarrollador_nombre: "CTIC UNAS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "SUBSANADO",
        nivel_riesgo: "MEDIO",
        prioridad_migracion: "MEDIANO PLAZO",
        fecha_creacion: "2026-07-15 19:00:00",
        fecha_actualizacion: "2026-07-16 13:40:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 16,
        codigo_unico: "SYS-016",
        nombre: "Sistema de Bienestar Universitario",
        descripcion: "Gestión de becas, comedor, salud y atención estudiantil.",
        id_area_usuario: 15,
        id_tipo_aplicativo: 1,
        id_criticidad: 3,
        forma_adquisicion: "Proveedor externo",
        id_responsable_funcional: 19,
        id_responsable_tecnico: 5,
        ano_adquisicion: 2019,
        desarrollador_nombre: "Proveedor Bienestar",
        contrato_vigente: true,
        fecha_vencimiento_soporte: "2027-08-30",
        es_legacy: false,
        estado_flujo: "ENVIADO",
        nivel_riesgo: "MEDIO",
        prioridad_migracion: "MEDIANO PLAZO",
        fecha_creacion: "2026-07-15 19:20:00",
        fecha_actualizacion: "2026-07-16 14:00:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 17,
        codigo_unico: "SYS-017",
        nombre: "Sistema de Activos TI",
        descripcion: "Inventario de computadoras, impresoras, servidores y periféricos.",
        id_area_usuario: 6,
        id_tipo_aplicativo: 1,
        id_criticidad: 3,
        forma_adquisicion: "Desarrollo CTIC",
        id_responsable_funcional: 8,
        id_responsable_tecnico: 9,
        ano_adquisicion: 2026,
        desarrollador_nombre: "CTIC UNAS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "VALIDADO",
        nivel_riesgo: "BAJO",
        prioridad_migracion: "MONITOREO",
        fecha_creacion: "2026-07-15 19:40:00",
        fecha_actualizacion: "2026-07-16 14:20:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 18,
        codigo_unico: "SYS-018",
        nombre: "Sistema de Patrimonio",
        descripcion: "Registro patrimonial, asignaciones, bajas y transferencias.",
        id_area_usuario: 16,
        id_tipo_aplicativo: 1,
        id_criticidad: 3,
        forma_adquisicion: "Compra",
        id_responsable_funcional: 20,
        id_responsable_tecnico: 5,
        ano_adquisicion: 2016,
        desarrollador_nombre: "Proveedor Patrimonio",
        contrato_vigente: false,
        fecha_vencimiento_soporte: "2023-12-31",
        es_legacy: true,
        estado_flujo: "OBSERVADO",
        nivel_riesgo: "CRITICO",
        prioridad_migracion: "INMEDIATA",
        fecha_creacion: "2026-07-15 20:00:00",
        fecha_actualizacion: "2026-07-16 14:40:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 19,
        codigo_unico: "SYS-019",
        nombre: "Sistema de Gestión Documental Interna",
        descripcion: "Administración de documentos internos, archivos y expedientes.",
        id_area_usuario: 2,
        id_tipo_aplicativo: 1,
        id_criticidad: 3,
        forma_adquisicion: "Desarrollo CTIC",
        id_responsable_funcional: 4,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2026,
        desarrollador_nombre: "CTIC UNAS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "BORRADOR",
        nivel_riesgo: "BAJO",
        prioridad_migracion: "MONITOREO",
        fecha_creacion: "2026-07-15 20:20:00",
        fecha_actualizacion: "2026-07-16 15:00:00",
        fecha_eliminacion: null
    },
    {
        id_sistema: 20,
        codigo_unico: "SYS-020",
        nombre: "Sistema de Reportes Rectorado",
        descripcion: "Reportes ejecutivos para indicadores institucionales.",
        id_area_usuario: 17,
        id_tipo_aplicativo: 1,
        id_criticidad: 4,
        forma_adquisicion: "Desarrollo CTIC",
        id_responsable_funcional: 21,
        id_responsable_tecnico: 3,
        ano_adquisicion: 2026,
        desarrollador_nombre: "CTIC UNAS",
        contrato_vigente: false,
        fecha_vencimiento_soporte: null,
        es_legacy: false,
        estado_flujo: "ENVIADO",
        nivel_riesgo: "MEDIO",
        prioridad_migracion: "MEDIANO PLAZO",
        fecha_creacion: "2026-07-15 20:40:00",
        fecha_actualizacion: "2026-07-16 15:20:00",
        fecha_eliminacion: null
    }
];

let inventarioActual = [...sistemas];
let sistemaSeleccionado = null;

let paginaActual = 1;
const registrosPorPagina = 5;

const tablaInventario = document.getElementById("tabla-inventario");
const searchInput = document.getElementById("search-input");
const filterEstado = document.getElementById("filter-estado");
const filterRiesgo = document.getElementById("filter-riesgo");
const filterLegacy = document.getElementById("filter-legacy");
const contadorRegistros = document.getElementById("contador-registros");
const modalDetalle = document.getElementById("modal-detalle");
const paginacion = document.getElementById("paginacion");

const kpiTotal = document.getElementById("kpi-total");
const kpiLegacy = document.getElementById("kpi-legacy");
const kpiRiesgo = document.getElementById("kpi-riesgo");
const kpiContrato = document.getElementById("kpi-contrato");

function texto(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";
    return valor;
}

function normalizar(valor) {
    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function formatearFecha(fecha) {
    if (!fecha) return "-";

    const fechaObj = new Date(String(fecha).replace(" ", "T"));

    if (isNaN(fechaObj.getTime())) {
        return fecha;
    }

    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getFullYear();
    const hora = String(fechaObj.getHours()).padStart(2, "0");
    const minuto = String(fechaObj.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
}

function obtenerIniciales(nombre) {
    return String(nombre || "SI")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(palabra => palabra[0])
        .join("")
        .toUpperCase();
}

function obtenerBadgeEstado(estado) {
    const valor = normalizar(estado);

    if (valor === "validado" || valor === "cerrado") return "status-success";
    if (valor === "observado" || valor === "subsanado") return "status-warning";
    if (valor === "rechazado") return "status-danger";
    if (valor === "enviado") return "status-info";

    return "status-secondary";
}

function obtenerBadgeRiesgo(riesgo) {
    const valor = normalizar(riesgo);

    if (valor === "critico" || valor === "alto") return "status-danger";
    if (valor === "medio") return "status-warning";
    if (valor === "bajo") return "status-success";

    return "status-secondary";
}

function obtenerBadgeLegacy(esLegacy) {
    return esLegacy ? "status-warning" : "status-success";
}

function textoBooleano(valor) {
    return valor ? "Sí" : "No";
}

function actualizarKPIs(lista) {
    const total = lista.length;

    const legacy = lista.filter(sistema => sistema.es_legacy === true).length;

    const riesgoAltoCritico = lista.filter(sistema => {
        const riesgo = normalizar(sistema.nivel_riesgo);
        return riesgo === "alto" || riesgo === "critico";
    }).length;

    const contrato = lista.filter(sistema => sistema.contrato_vigente === true).length;

    kpiTotal.textContent = total;
    kpiLegacy.textContent = legacy;
    kpiRiesgo.textContent = riesgoAltoCritico;
    kpiContrato.textContent = contrato;
}

function renderInventario(lista) {
    tablaInventario.innerHTML = "";

    const totalRegistros = lista.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas || 1;
    }

    if (totalRegistros === 0) {
        tablaInventario.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron sistemas con los filtros seleccionados.
                </td>
            </tr>
        `;

        contadorRegistros.textContent = "Mostrando 0 registros";
        actualizarKPIs(lista);
        renderPaginacion(0);
        return;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = lista.slice(inicio, fin);

    registrosPagina.forEach(sistema => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><strong>#${texto(sistema.id_sistema)}</strong></td>

            <td><strong>${texto(sistema.codigo_unico)}</strong></td>

            <td>
                <div class="cell-system">
                    <div class="system-avatar">${obtenerIniciales(sistema.nombre)}</div>
                    <div>
                        <div class="system-name">${texto(sistema.nombre)}</div>
                        <div class="system-desc">${texto(sistema.descripcion)}</div>
                    </div>
                </div>
            </td>

            <td>${texto(sistema.id_area_usuario)}</td>
            <td>${texto(sistema.id_tipo_aplicativo)}</td>

            <td>
                <span class="badge ${obtenerBadgeEstado(sistema.estado_flujo)}">
                    ${texto(sistema.estado_flujo)}
                </span>
            </td>

            <td>
                <span class="badge ${obtenerBadgeRiesgo(sistema.nivel_riesgo)}">
                    ${texto(sistema.nivel_riesgo)}
                </span>
            </td>

            <td>
                <span class="badge ${obtenerBadgeLegacy(sistema.es_legacy)}">
                    ${textoBooleano(sistema.es_legacy)}
                </span>
            </td>

            <td>${formatearFecha(sistema.fecha_actualizacion)}</td>

            <td>
                <button class="btn btn-ghost btn-sm" onclick="abrirModalDetalle(${sistema.id_sistema})">
                    Ver detalle
                </button>
            </td>
        `;

        tablaInventario.appendChild(fila);
    });

    const desde = inicio + 1;
    const hasta = Math.min(fin, totalRegistros);

    contadorRegistros.textContent = `Mostrando ${desde} - ${hasta} de ${totalRegistros} registros`;

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
    const totalPaginas = Math.ceil(inventarioActual.length / registrosPorPagina);

    if (numeroPagina < 1 || numeroPagina > totalPaginas) {
        return;
    }

    paginaActual = numeroPagina;
    renderInventario(inventarioActual);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function filtrarInventario() {
    const busqueda = normalizar(searchInput.value);
    const estado = normalizar(filterEstado.value);
    const riesgo = normalizar(filterRiesgo.value);
    const legacy = filterLegacy.value;

    const filtrados = sistemas.filter(sistema => {
        const contenido = normalizar(`
            ${sistema.id_sistema}
            ${sistema.codigo_unico}
            ${sistema.nombre}
            ${sistema.descripcion}
            ${sistema.id_area_usuario}
            ${sistema.id_tipo_aplicativo}
            ${sistema.id_criticidad}
            ${sistema.forma_adquisicion}
            ${sistema.desarrollador_nombre}
            ${sistema.estado_flujo}
            ${sistema.nivel_riesgo}
            ${sistema.prioridad_migracion}
            ${sistema.ano_adquisicion}
        `);

        const coincideTexto = contenido.includes(busqueda);
        const coincideEstado = estado === "" || normalizar(sistema.estado_flujo) === estado;
        const coincideRiesgo = riesgo === "" || normalizar(sistema.nivel_riesgo) === riesgo;
        const coincideLegacy = legacy === "" || String(sistema.es_legacy) === legacy;

        return coincideTexto && coincideEstado && coincideRiesgo && coincideLegacy;
    });

    inventarioActual = filtrados;
    paginaActual = 1;
    renderInventario(filtrados);
}

function abrirModalDetalle(idSistema) {
    const sistema = sistemas.find(item => item.id_sistema === idSistema);

    if (!sistema) {
        alert("No se encontró el detalle del sistema.");
        return;
    }

    sistemaSeleccionado = sistema;

    document.getElementById("modal-codigo").textContent = texto(sistema.codigo_unico);
    document.getElementById("modal-nombre").textContent = texto(sistema.nombre);
    document.getElementById("modal-descripcion").textContent = texto(sistema.descripcion);

    document.getElementById("modal-id").textContent = texto(sistema.id_sistema);
    document.getElementById("modal-codigo-detalle").textContent = texto(sistema.codigo_unico);
    document.getElementById("modal-area").textContent = texto(sistema.id_area_usuario);
    document.getElementById("modal-tipo").textContent = texto(sistema.id_tipo_aplicativo);
    document.getElementById("modal-criticidad").textContent = texto(sistema.id_criticidad);

    document.getElementById("modal-responsable-funcional").textContent = texto(sistema.id_responsable_funcional);
    document.getElementById("modal-responsable-tecnico").textContent = texto(sistema.id_responsable_tecnico);
    document.getElementById("modal-desarrollador").textContent = texto(sistema.desarrollador_nombre);

    document.getElementById("modal-forma").textContent = texto(sistema.forma_adquisicion);
    document.getElementById("modal-ano").textContent = texto(sistema.ano_adquisicion);
    document.getElementById("modal-contrato").textContent = textoBooleano(sistema.contrato_vigente);
    document.getElementById("modal-vencimiento").textContent = texto(sistema.fecha_vencimiento_soporte);

    document.getElementById("modal-estado").textContent = texto(sistema.estado_flujo);
    document.getElementById("modal-riesgo").textContent = texto(sistema.nivel_riesgo);
    document.getElementById("modal-prioridad").textContent = texto(sistema.prioridad_migracion);
    document.getElementById("modal-legacy").textContent = textoBooleano(sistema.es_legacy);

    document.getElementById("modal-fecha-creacion").textContent = formatearFecha(sistema.fecha_creacion);
    document.getElementById("modal-fecha-actualizacion").textContent = formatearFecha(sistema.fecha_actualizacion);
    document.getElementById("modal-fecha-eliminacion").textContent = formatearFecha(sistema.fecha_eliminacion);

    document.getElementById("modal-badges").innerHTML = `
        <span class="badge ${obtenerBadgeEstado(sistema.estado_flujo)}">${texto(sistema.estado_flujo)}</span>
        <span class="badge ${obtenerBadgeRiesgo(sistema.nivel_riesgo)}">${texto(sistema.nivel_riesgo)}</span>
        <span class="badge ${obtenerBadgeLegacy(sistema.es_legacy)}">Legacy: ${textoBooleano(sistema.es_legacy)}</span>
        <span class="badge status-secondary">Solo lectura</span>
    `;

    modalDetalle.classList.add("active");
    document.body.style.overflow = "hidden";
}

function cerrarModalDetalle() {
    modalDetalle.classList.remove("active");
    document.body.style.overflow = "";
}

function exportarExcel() {
    if (inventarioActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const encabezados = obtenerEncabezadosInventario();

    const filas = inventarioActual.map(sistema =>
        encabezados.map(campo => sistema[campo])
    );

    descargarCSV("inventario_sistemas_diagti.csv", encabezados, filas);
}

function exportarFichaSistema() {
    if (!sistemaSeleccionado) {
        alert("No hay sistema seleccionado.");
        return;
    }

    const encabezados = ["Campo", "Valor"];
    const filas = Object.entries(sistemaSeleccionado);

    descargarCSV(`ficha_${sistemaSeleccionado.codigo_unico}.csv`, encabezados, filas);
}

function exportarPDF() {
    if (inventarioActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const filas = inventarioActual.map(sistema => `
        <tr>
            <td>${texto(sistema.id_sistema)}</td>
            <td>${texto(sistema.codigo_unico)}</td>
            <td>${texto(sistema.nombre)}</td>
            <td>${texto(sistema.descripcion)}</td>
            <td>${texto(sistema.estado_flujo)}</td>
            <td>${texto(sistema.nivel_riesgo)}</td>
            <td>${textoBooleano(sistema.es_legacy)}</td>
            <td>${formatearFecha(sistema.fecha_actualizacion)}</td>
        </tr>
    `).join("");

    const html = `
        <html>
        <head>
            <title>Inventario de Sistemas - DIAGTI</title>
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
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
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
            <h1>Reporte de Inventario de Sistemas</h1>
            <div class="subtitulo">DIAGTI · CTIC UNAS · Módulo Auditor</div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Sistema</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Riesgo</th>
                        <th>Legacy</th>
                        <th>Actualización</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                </tbody>
            </table>

            <div class="footer">
                Reporte generado por Auditor CTIC. Total de registros: ${inventarioActual.length}.
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

function exportarFichaPDF() {
    if (!sistemaSeleccionado) {
        alert("No hay sistema seleccionado.");
        return;
    }

    const filas = Object.entries(sistemaSeleccionado).map(([campo, valor]) => `
        <tr>
            <td><strong>${campo}</strong></td>
            <td>${texto(valor)}</td>
        </tr>
    `).join("");

    const html = `
        <html>
        <head>
            <title>Ficha de Sistema - ${texto(sistemaSeleccionado.codigo_unico)}</title>
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
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                td {
                    border: 1px solid #dfe6e5;
                    padding: 8px;
                    vertical-align: top;
                }

                td:first-child {
                    background: #f3f6f6;
                    width: 35%;
                }

                .footer {
                    margin-top: 24px;
                    font-size: 11px;
                    color: #64757a;
                }
            </style>
        </head>

        <body>
            <h1>Ficha del Sistema</h1>
            <div class="subtitulo">
                ${texto(sistemaSeleccionado.codigo_unico)} · ${texto(sistemaSeleccionado.nombre)}
            </div>

            <table>
                <tbody>
                    ${filas}
                </tbody>
            </table>

            <div class="footer">
                Ficha generada por Auditor CTIC · DIAGTI CTIC UNAS.
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

function obtenerEncabezadosInventario() {
    return [
        "id_sistema",
        "codigo_unico",
        "nombre",
        "descripcion",
        "id_area_usuario",
        "id_tipo_aplicativo",
        "id_criticidad",
        "forma_adquisicion",
        "id_responsable_funcional",
        "id_responsable_tecnico",
        "ano_adquisicion",
        "desarrollador_nombre",
        "contrato_vigente",
        "fecha_vencimiento_soporte",
        "es_legacy",
        "estado_flujo",
        "nivel_riesgo",
        "prioridad_migracion",
        "fecha_creacion",
        "fecha_actualizacion",
        "fecha_eliminacion"
    ];
}

function descargarCSV(nombreArchivo, encabezados, filas) {
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

searchInput.addEventListener("input", filtrarInventario);
filterEstado.addEventListener("change", filtrarInventario);
filterRiesgo.addEventListener("change", filtrarInventario);
filterLegacy.addEventListener("change", filtrarInventario);

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

renderInventario(sistemas);