document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-registro");
    const btnCancelar = document.getElementById("btn-cancelar");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("✅ Información del sistema guardada de manera lógica. Procediendo a registrar Arquitectura.");
        window.location.href = "arquitectura.html";
    });

    btnCancelar.addEventListener("click", () => {
        if(confirm("¿Está seguro de que desea salir? Los cambios no guardados se perderán.")) {
            window.location.href = "mis-sistemas.html";
        }
    });
});