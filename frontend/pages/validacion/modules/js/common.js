// common.js

export function configurarCerrarSesion() {

    const boton = document.querySelector(".btn-logout");

    if (!boton) return;

    boton.addEventListener("click", (event) => {

        event.preventDefault();
        cerrarSesion();

    });

}

export function cerrarSesion() {
    document.getElementById("logout-confirm-overlay")?.classList.add("open");
}

export function cancelarCerrarSesion() {
    document.getElementById("logout-confirm-overlay")?.classList.remove("open");
}

export function confirmarCerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../../login/html/login.html";
}

window.cerrarSesion = cerrarSesion;
window.cancelarCerrarSesion = cancelarCerrarSesion;
window.confirmarCerrarSesion = confirmarCerrarSesion;

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("logout-confirm-overlay");

    if (overlay) {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) cancelarCerrarSesion();
        });
    }
});