// common.js

export function configurarCerrarSesion() {

    const boton = document.querySelector(".btn-logout");

    if (!boton) return;

    boton.addEventListener("click", () => {

        window.location.href =
            "../../../login/html/login.html";

    });

}