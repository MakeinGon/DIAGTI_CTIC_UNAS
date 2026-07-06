"use strict";

/* ============================================================
   DIAGTI CTIC UNAS
   Módulo Directivo
   Sidebar compartido
============================================================ */


/* ============================================================
   1. CONFIGURACIÓN GENERAL
============================================================ */

const DIRECTIVO_SIDEBAR = {
    storageKey: "sidebarCollapsed",
    mobileBreakpoint: 900,

    defaultUser: "Director CTIC",
    defaultRole: "Usuario Directivo"
};


/* ============================================================
   2. INICIALIZACIÓN
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    inicializarSidebar();
});


function inicializarSidebar() {
    const sidebarContainer = document.getElementById(
        "sidebar-container"
    );

    if (!sidebarContainer) {
        console.warn(
            "[DIAGTI] No se encontró #sidebar-container."
        );

        return;
    }

    renderizarSidebar(sidebarContainer);
    crearControlesMoviles(sidebarContainer);

    configurarPaginaActiva(sidebarContainer);
    configurarEstadoSidebar(sidebarContainer);
    configurarSidebarMovil(sidebarContainer);

    cargarInformacionUsuario();
    iniciarRelojSesion();

    configurarCerrarSesion();
}


/* ============================================================
   3. GENERAR SIDEBAR
============================================================ */

function renderizarSidebar(sidebarContainer) {

    sidebarContainer.innerHTML = `
        <div
            class="sidebar"
            id="sidebar"
        >

            <!-- =============================================
                 CABECERA INSTITUCIONAL
            ============================================== -->
            <header class="sidebar-header">

                <a
                    href="resumen-ejecutivo.html"
                    class="sidebar-brand"
                    aria-label="Ir al Resumen Ejecutivo"
                >

                    <div class="sidebar-brand__logo">

                        <img
                            src="../assets/LOGO-UNAS-removebg-preview.png"
                            alt=""
                            aria-hidden="true"
                        >

                    </div>


                    <div class="sidebar-brand__text">

                        <span class="sidebar-brand__title">
                            DIAGTI CTIC UNAS
                        </span>

                        <span class="sidebar-brand__subtitle">
                            Gestión del Inventario TI
                        </span>

                    </div>

                </a>


                <button
                    type="button"
                    class="sidebar-toggle"
                    id="sidebar-toggle"
                    aria-label="Plegar menú lateral"
                    aria-controls="sidebar-navigation"
                    aria-expanded="true"
                    title="Plegar o desplegar menú"
                >
                    ☰
                </button>

            </header>


            <!-- =============================================
                 USUARIO
            ============================================== -->
            <section
                class="sidebar-user"
                aria-label="Usuario autenticado"
            >

                <div
                    class="sidebar-user__avatar"
                    aria-hidden="true"
                >
                    DC
                </div>


                <div class="sidebar-user__details">

                    <strong
                        class="sidebar-user__name"
                        id="sidebar-user-name"
                    >
                        Director CTIC
                    </strong>

                    <span
                        class="sidebar-user__role"
                        id="sidebar-user-role"
                    >
                        Usuario Directivo
                    </span>

                </div>

            </section>


            <!-- =============================================
                 MÓDULO DIRECTIVO
            ============================================== -->
            <div class="sidebar-module">

                <div class="sidebar-module__title">
                    Módulo Directivo
                </div>


                <nav
                    class="sidebar-nav"
                    id="sidebar-navigation"
                    aria-label="Navegación del módulo directivo"
                >

                    <a
                        href="resumen-ejecutivo.html"
                        class="sidebar-nav__link"
                        data-page="resumen-ejecutivo.html"
                    >
                        <span class="sidebar-nav__text">
                            Resumen Ejecutivo
                        </span>
                    </a>


                    <a
                        href="inventario-sistemas.html"
                        class="sidebar-nav__link"
                        data-page="inventario-sistemas.html"
                    >
                        <span class="sidebar-nav__text">
                            Inventario de Sistemas
                        </span>
                    </a>


                    <a
                        href="riesgos-obsolescencia.html"
                        class="sidebar-nav__link"
                        data-page="riesgos-obsolescencia.html"
                    >
                        <span class="sidebar-nav__text">
                            Riesgos y Obsolescencia
                        </span>
                    </a>


                    <a
                        href="plan-modernizacion.html"
                        class="sidebar-nav__link"
                        data-page="plan-modernizacion.html"
                    >
                        <span class="sidebar-nav__text">
                            Plan de Modernización
                        </span>
                    </a>


                    <a
                        href="reportes-ejecutivos.html"
                        class="sidebar-nav__link"
                        data-page="reportes-ejecutivos.html"
                    >
                        <span class="sidebar-nav__text">
                            Reportes Ejecutivos
                        </span>
                    </a>

                </nav>

            </div>


            <!-- =============================================
                 ZONA INFERIOR
            ============================================== -->
            <div class="sidebar-bottom">

                <div
                    class="sidebar-divider"
                    aria-hidden="true"
                ></div>


                <!-- =========================================
                     CUENTA
                ========================================== -->
                <nav
                    class="sidebar-account-nav"
                    aria-label="Opciones de cuenta"
                >

                    <a
                        href="configuracion-cuenta.html"
                        class="sidebar-account-link"
                        data-page="configuracion-cuenta.html"
                    >
                        Configuración de Cuenta
                    </a>


                    <button
                        type="button"
                        class="sidebar-logout"
                        id="sidebar-logout"
                    >
                        Cerrar Sesión
                    </button>

                </nav>


                <!-- =========================================
                     FECHA Y HORA
                ========================================== -->
                <div
                    class="sidebar-session-time"
                    id="sidebar-session-time"
                    aria-live="off"
                >
                    Cargando fecha y hora...
                </div>


                <!-- =========================================
                     PIE INSTITUCIONAL
                ========================================== -->
                <footer class="sidebar-footer">

                    <span class="sidebar-footer__version">
                        DIAGTI v1.0 · CTIC UNAS
                    </span>

                    <span class="sidebar-footer__module">
                        Módulo Directivo
                    </span>

                </footer>

            </div>

        </div>
    `;
}


/* ============================================================
   4. PÁGINA ACTIVA
============================================================ */

function configurarPaginaActiva(sidebarContainer) {

    const paginaActual = obtenerPaginaActual();

    const enlaces = sidebarContainer.querySelectorAll(
        "[data-page]"
    );


    enlaces.forEach((enlace) => {

        const paginaEnlace = enlace.dataset.page;


        if (paginaEnlace === paginaActual) {

            enlace.classList.add("active");

            enlace.setAttribute(
                "aria-current",
                "page"
            );

        } else {

            enlace.classList.remove("active");

            enlace.removeAttribute(
                "aria-current"
            );

        }

    });
}


function obtenerPaginaActual() {

    const ruta = window.location.pathname;

    const pagina = ruta
        .split("/")
        .filter(Boolean)
        .pop();


    return pagina || "resumen-ejecutivo.html";
}


/* ============================================================
   5. ESTADO PLEGADO / DESPLEGADO
============================================================ */

function configurarEstadoSidebar(sidebarContainer) {

    const toggleButton = document.getElementById(
        "sidebar-toggle"
    );


    if (!toggleButton) {
        return;
    }


    const estadoGuardado = leerEstadoSidebar();


    if (estadoGuardado === true) {
        aplicarEstadoColapsado(
            sidebarContainer,
            toggleButton,
            true
        );
    }


    toggleButton.addEventListener("click", () => {

        /*
           En móvil el botón interno cierra el panel.
           En escritorio pliega o despliega.
        */

        if (esVistaMovil()) {

            cerrarSidebarMovil(
                sidebarContainer
            );

            return;
        }


        const estaColapsado =
            sidebarContainer.classList.contains(
                "is-collapsed"
            );


        const nuevoEstado = !estaColapsado;


        aplicarEstadoColapsado(
            sidebarContainer,
            toggleButton,
            nuevoEstado
        );


        guardarEstadoSidebar(
            nuevoEstado
        );

    });
}


function aplicarEstadoColapsado(
    sidebarContainer,
    toggleButton,
    colapsado
) {

    sidebarContainer.classList.toggle(
        "is-collapsed",
        colapsado
    );


    document.body.classList.toggle(
        "sidebar-collapsed",
        colapsado
    );


    toggleButton.setAttribute(
        "aria-expanded",
        String(!colapsado)
    );


    toggleButton.setAttribute(
        "aria-label",
        colapsado
            ? "Desplegar menú lateral"
            : "Plegar menú lateral"
    );
}


/* ============================================================
   6. LOCAL STORAGE
============================================================ */

function leerEstadoSidebar() {

    try {

        return (
            localStorage.getItem(
                DIRECTIVO_SIDEBAR.storageKey
            ) === "true"
        );

    } catch (error) {

        console.warn(
            "[DIAGTI] No se pudo leer el estado del sidebar.",
            error
        );

        return false;

    }
}


function guardarEstadoSidebar(colapsado) {

    try {

        localStorage.setItem(
            DIRECTIVO_SIDEBAR.storageKey,
            String(colapsado)
        );

    } catch (error) {

        console.warn(
            "[DIAGTI] No se pudo guardar el estado del sidebar.",
            error
        );

    }
}


/* ============================================================
   7. CONTROLES MÓVILES
============================================================ */

function crearControlesMoviles(sidebarContainer) {

    /*
       Evita duplicados si el script fuese ejecutado
       accidentalmente más de una vez.
    */

    if (
        document.getElementById(
            "sidebar-mobile-toggle"
        )
    ) {
        return;
    }


    const mobileToggle =
        document.createElement("button");


    mobileToggle.type = "button";

    mobileToggle.id =
        "sidebar-mobile-toggle";

    mobileToggle.className =
        "sidebar-mobile-toggle";

    mobileToggle.setAttribute(
        "aria-label",
        "Abrir menú lateral"
    );

    mobileToggle.setAttribute(
        "aria-controls",
        "sidebar-container"
    );

    mobileToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    mobileToggle.textContent = "☰";


    const overlay =
        document.createElement("div");


    overlay.id = "sidebar-overlay";

    overlay.className =
        "sidebar-overlay";

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.append(
        mobileToggle,
        overlay
    );


    /*
       Garantiza un id estable para aria-controls.
    */

    if (!sidebarContainer.id) {
        sidebarContainer.id = "sidebar-container";
    }
}


/* ============================================================
   8. COMPORTAMIENTO MÓVIL
============================================================ */

function configurarSidebarMovil(sidebarContainer) {

    const mobileToggle =
        document.getElementById(
            "sidebar-mobile-toggle"
        );


    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    if (!mobileToggle || !overlay) {
        return;
    }


    mobileToggle.addEventListener("click", () => {

        const estaAbierto =
            sidebarContainer.classList.contains(
                "is-mobile-open"
            );


        if (estaAbierto) {

            cerrarSidebarMovil(
                sidebarContainer
            );

        } else {

            abrirSidebarMovil(
                sidebarContainer
            );

        }

    });


    overlay.addEventListener("click", () => {

        cerrarSidebarMovil(
            sidebarContainer
        );

    });


    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") {
            return;
        }


        if (
            sidebarContainer.classList.contains(
                "is-mobile-open"
            )
        ) {

            cerrarSidebarMovil(
                sidebarContainer
            );

        }

    });


    /*
       Cierra el menú móvil antes de cambiar de página.
    */

    const enlaces =
        sidebarContainer.querySelectorAll("a[href]");


    enlaces.forEach((enlace) => {

        enlace.addEventListener("click", () => {

            if (esVistaMovil()) {

                cerrarSidebarMovil(
                    sidebarContainer
                );

            }

        });

    });


    /*
       Sincroniza estado cuando cambia el ancho.
    */

    window.addEventListener("resize", () => {

        if (!esVistaMovil()) {

            cerrarSidebarMovil(
                sidebarContainer
            );

        }

    });
}


function abrirSidebarMovil(sidebarContainer) {

    const mobileToggle =
        document.getElementById(
            "sidebar-mobile-toggle"
        );


    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    sidebarContainer.classList.add(
        "is-mobile-open"
    );


    overlay?.classList.add(
        "is-visible"
    );


    mobileToggle?.setAttribute(
        "aria-expanded",
        "true"
    );


    mobileToggle?.setAttribute(
        "aria-label",
        "Cerrar menú lateral"
    );


    document.body.style.overflow =
        "hidden";
}


function cerrarSidebarMovil(sidebarContainer) {

    const mobileToggle =
        document.getElementById(
            "sidebar-mobile-toggle"
        );


    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    sidebarContainer.classList.remove(
        "is-mobile-open"
    );


    overlay?.classList.remove(
        "is-visible"
    );


    mobileToggle?.setAttribute(
        "aria-expanded",
        "false"
    );


    mobileToggle?.setAttribute(
        "aria-label",
        "Abrir menú lateral"
    );


    document.body.style.overflow = "";
}


function esVistaMovil() {

    return (
        window.innerWidth <=
        DIRECTIVO_SIDEBAR.mobileBreakpoint
    );
}


/* ============================================================
   9. INFORMACIÓN DEL USUARIO
============================================================ */

function cargarInformacionUsuario() {

    const userNameElement =
        document.getElementById(
            "sidebar-user-name"
        );


    const userRoleElement =
        document.getElementById(
            "sidebar-user-role"
        );


    if (!userNameElement || !userRoleElement) {
        return;
    }


    let nombreUsuario =
        DIRECTIVO_SIDEBAR.defaultUser;


    let rolUsuario =
        DIRECTIVO_SIDEBAR.defaultRole;


    try {

        nombreUsuario =
            sessionStorage.getItem(
                "usuarioNombre"
            ) ||
            DIRECTIVO_SIDEBAR.defaultUser;


        rolUsuario =
            sessionStorage.getItem(
                "usuarioRol"
            ) ||
            DIRECTIVO_SIDEBAR.defaultRole;

    } catch (error) {

        console.warn(
            "[DIAGTI] No se pudo leer la información de sesión.",
            error
        );

    }


    /*
       textContent evita interpretar contenido como HTML.
    */

    userNameElement.textContent =
        nombreUsuario;


    userRoleElement.textContent =
        rolUsuario;
}


/* ============================================================
   10. FECHA Y HORA
============================================================ */

function iniciarRelojSesion() {

    const sessionTime =
        document.getElementById(
            "sidebar-session-time"
        );


    if (!sessionTime) {
        return;
    }


    const formatoFecha =
        new Intl.DateTimeFormat(
            "es-PE",
            {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    const formatoHora =
        new Intl.DateTimeFormat(
            "es-PE",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        );


    function actualizar() {

        const ahora = new Date();


        const fecha =
            formatoFecha.format(ahora);


        const hora =
            formatoHora.format(ahora);


        sessionTime.textContent =
            `${capitalizarPrimeraLetra(fecha)} · ${hora}`;

    }


    actualizar();


    window.setInterval(
        actualizar,
        1000
    );
}


function capitalizarPrimeraLetra(texto) {

    if (!texto) {
        return "";
    }


    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );
}


/* ============================================================
   11. CIERRE DE SESIÓN
============================================================ */

function configurarCerrarSesion() {

    const logoutButton =
        document.getElementById(
            "sidebar-logout"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener("click", () => {

        const confirmar = window.confirm(
            "¿Deseas cerrar la sesión actual?"
        );


        if (!confirmar) {
            return;
        }


        /*
           No se inventa una ruta de login ni un endpoint.

           Este evento deja preparado el sidebar para que
           el mecanismo real de autenticación del proyecto
           pueda escuchar la solicitud de cierre de sesión.
        */

        const logoutEvent =
            new CustomEvent(
                "directivo:logout-requested",
                {
                    bubbles: true
                }
            );


        document.dispatchEvent(
            logoutEvent
        );


        console.info(
            "[DIAGTI] Solicitud de cierre de sesión emitida. " +
            "Pendiente de integración con el mecanismo real de autenticación."
        );


        window.alert(
            "El cierre de sesión está pendiente de integración " +
            "con el mecanismo de autenticación del sistema."
        );

    });
}