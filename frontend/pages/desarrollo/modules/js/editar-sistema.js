document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-edicion");
    const btnRegresar = document.getElementById("btn-regresar");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("✅ Expediente actualizado correctamente en la bitácora de auditoría lúdica.");
        window.location.href = "mis-sistemas.html";
    });

    btnRegresar.addEventListener("click", () => {
        window.location.href = "mis-sistemas.html";
    });
});