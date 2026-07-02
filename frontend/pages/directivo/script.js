document.addEventListener("DOMContentLoaded", () => {
    cargarSidebar();
    activarPaginaActual();
    configurarSidebar();
    actualizarFechaSesion();
    configurarCerrarSesion();
});

/* Sidebar único para todas las páginas */
function cargarSidebar() {
    const sidebarContainer = document.getElementById("sidebar-container");

    if (!sidebarContainer) {
        return;
    }

    sidebarContainer.innerHTML = `
        <aside class="sidebar" id="sidebar">

            <div class="sidebar-header">
                <div class="brand">
                    <div class="brand-icon">D</div>
                    <span class="brand-text">DIAGTI CTIC</span>
                </div>

                <button class="sidebar-toggle" id="btnSidebar" title="Plegar o desplegar menú">
                    ☰
                </button>
            </div>

            <nav class="sidebar-menu">
                <a href="index.html" class="menu-item" data-page="index.html">
                    <span class="menu-icon">🏠</span>
                    <span class="menu-text">Inicio</span>
                </a>

                <a href="dashboard-ejecutivo.html" class="menu-item" data-page="dashboard-ejecutivo.html">
                    <span class="menu-icon">📊</span>
                    <span class="menu-text">Dashboard Ejecutivo</span>
                </a>

                <a href="dashboard-riesgos.html" class="menu-item" data-page="dashboard-riesgos.html">
                    <span class="menu-icon">⚠️</span>
                    <span class="menu-text">Dashboard Riesgos</span>
                </a>

                <a href="dashboard-obsolescencia.html" class="menu-item" data-page="dashboard-obsolescencia.html">
                    <span class="menu-icon">🧩</span>
                    <span class="menu-text">Dashboard Obsolescencia</span>
                </a>

                <a href="reportes-ejecutivos.html" class="menu-item" data-page="reportes-ejecutivos.html">
                    <span class="menu-icon">📄</span>
                    <span class="menu-text">Reportes Ejecutivos</span>
                </a>

                <a href="roadmap-migracion.html" class="menu-item" data-page="roadmap-migracion.html">
                    <span class="menu-icon">🗺️</span>
                    <span class="menu-text">Roadmap Migración</span>
                </a>
            </nav>

            <div class="sidebar-session">
                <div class="user-info">
                    <div class="user-avatar">👤</div>

                    <div class="user-detail">
                        <strong id="sessionUser">Director CTIC</strong>
                        <small>Usuario directivo</small>
                        <small id="sessionDate">Cargando fecha...</small>
                    </div>
                </div>

                <div class="session-actions">
                    <a href="configuracion-cuenta.html" class="config-btn">
                        ⚙️
                        <span class="menu-text">Configuración</span>
                    </a>

                    <button class="logout-btn" id="btnLogout">
                        ⏻
                        <span class="menu-text">Cerrar sesión</span>
                    </button>
                </div>
            </div>

        </aside>
    `;
}

/* Marcar opción activa según el archivo actual */
function activarPaginaActual() {
    const paginaActual = window.location.pathname.split("/").pop() || "index.html";
    const items = document.querySelectorAll(".menu-item");

    items.forEach(item => {
        if (item.dataset.page === paginaActual) {
            item.classList.add("active");
        }
    });
}

/* Plegar/desplegar sidebar */
function configurarSidebar() {
    const sidebar = document.getElementById("sidebar");
    const btnSidebar = document.getElementById("btnSidebar");

    if (!sidebar || !btnSidebar) {
        return;
    }

    const sidebarState = localStorage.getItem("sidebarCollapsed");

    if (sidebarState === "true") {
        sidebar.classList.add("collapsed");
    }

    btnSidebar.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");

        const isCollapsed = sidebar.classList.contains("collapsed");
        localStorage.setItem("sidebarCollapsed", isCollapsed);
    });
}

/* Fecha y hora real */
function actualizarFechaSesion() {
    const sessionDate = document.getElementById("sessionDate");
    const sessionUser = document.getElementById("sessionUser");

    if (!sessionDate || !sessionUser) {
        return;
    }

    const nombreUsuario = sessionStorage.getItem("usuarioNombre") || "Director CTIC";
    sessionUser.textContent = nombreUsuario;

    function actualizarFecha() {
        const ahora = new Date();

        const formato = ahora.toLocaleString("es-PE", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        sessionDate.textContent = formato;
    }

    actualizarFecha();
    setInterval(actualizarFecha, 1000);
}

/* Cerrar sesión simulado */
function configurarCerrarSesion() {
    const btnLogout = document.getElementById("btnLogout");

    if (!btnLogout) {
        return;
    }

    btnLogout.addEventListener("click", () => {
        const confirmar = confirm("¿Deseas cerrar sesión?");

        if (confirmar) {
            sessionStorage.clear();
            alert("Sesión cerrada correctamente.");

            /* Temporal: cuando exista login real, cambia esto por login.html */
            window.location.href = "index.html";
        }
    });
}