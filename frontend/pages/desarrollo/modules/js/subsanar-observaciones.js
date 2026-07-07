function enviarSubsanacion() {
    const texto = document.getElementById("sustento").value.trim();
    
    if (texto === "") {
        alert("⚠️ Por favor, escriba el sustento de la corrección antes de enviar.");
        return;
    }

    // Simulación de envío exitoso
    document.getElementById("bloqueObservacionActiva").classList.add("d-none");
    document.getElementById("bloqueSinObservaciones").classList.remove("d-none");

    const badge = document.getElementById("estadoObs");
    badge.classList.remove("danger");
    badge.classList.add("success");
    badge.textContent = "0 OBSERVACIONES PENDIENTES";

    alert("✅ ¡Éxito!\n\nEl sustento fue enviado correctamente.\nEl estado cambió a 'SUBSANADO' y se notificó al evaluador.");
}

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        // Si agregas modales en el futuro
    }
});