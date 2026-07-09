document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-arquitectura");
    const btnAtras = document.getElementById("btn-atras");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("✅ Especificación de arquitectura guardada correctamente. Siguiente paso: Base de Datos.");
        window.location.href = "base-datos.html";
    });

    btnAtras.addEventListener("click", () => {
        window.location.href = "registrar-sistema.html";
    });
    document.addEventListener("DOMContentLoaded", () => {
        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                if (confirm("¿Estás seguro de que deseas cerrar sesión en DIAGTI?")) {
                    // Redirección simulada al login institucional LDAP
                    window.location.href = "login.html";
                }
            });
        }
    });
});