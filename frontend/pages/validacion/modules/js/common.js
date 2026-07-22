export function configurarCerrarSesion() {
    const boton = document.querySelector(".btn-logout");
    if (!boton) return;
    boton.addEventListener("click", () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../../../login/html/login.html";
    });
}