(function () {
    function obtenerOverlay() {
        return document.getElementById("logout-confirm-overlay");
    }

    window.cerrarSesion = function () {
        const overlay = obtenerOverlay();
        if (overlay) overlay.classList.add("open");
    };

    window.cancelarCerrarSesion = function () {
        const overlay = obtenerOverlay();
        if (overlay) overlay.classList.remove("open");
    };

    window.confirmarCerrarSesion = function () {
        const overlay = obtenerOverlay();
        const loginUrl = overlay?.dataset.loginUrl || "../../../login/html/login.html";

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = loginUrl;
    };

    document.addEventListener("DOMContentLoaded", function () {
        const overlay = obtenerOverlay();

        document.querySelectorAll(".btn-logout").forEach(function (boton) {
            boton.addEventListener("click", function (event) {
                event.preventDefault();
                window.cerrarSesion();
            });
        });

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    window.cancelarCerrarSesion();
                }
            });
        }
    });
})();
