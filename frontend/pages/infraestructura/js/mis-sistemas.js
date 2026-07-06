document.addEventListener('DOMContentLoaded', () => {
    cargarTablaSistemas();
});

function cargarTablaSistemas() {
    const sistemas = [
        {
            nombre: "SIGA - Sistema Integrado de Gestión Académica",
            tipo: "Académico",
            estado: "Estable",
            ultimaActualizacion: "03 Jul 2026"
        },
        {
            nombre: "SIAF - Sistema de Administración Financiera",
            tipo: "Administrativo",
            estado: "Estable",
            ultimaActualizacion: "02 Jul 2026"
        },
        {
            nombre: "Plataforma de Matrícula en Línea",
            tipo: "Web / Estudiantes",
            estado: "En Riesgo",
            ultimaActualizacion: "30 Jun 2026"
        },
        {
            nombre: "Repositorio Institucional (DSPACE)",
            tipo: "Biblioteca",
            estado: "Estable",
            ultimaActualizacion: "01 Jul 2026"
        },
        {
            nombre: "Sistema de Control de Acceso y Asistencia",
            tipo: "Infraestructura",
            estado: "Estable",
            ultimaActualizacion: "04 Jul 2026"
        },
        {
            nombre: "Plataforma Virtual de Clases (Moodle)",
            tipo: "Educativo",
            estado: "Estable",
            ultimaActualizacion: "03 Jul 2026"
        }
    ];

    const tbody = document.querySelector('#tabla-mis-sistemas tbody');
    tbody.innerHTML = '';

    sistemas.forEach(s => {
        let badgeClass = s.estado === "Estable" ? "success" : "warning";
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${s.nombre}</strong></td>
            <td>${s.tipo}</td>
            <td><span class="badge ${badgeClass}">${s.estado}</span></td>
            <td>${s.ultimaActualizacion}</td>
            <td>
                <button onclick="verDetalleSistema('${s.nombre}')" 
                        style="padding:6px 14px; background:#1abb9c; color:white; border:none; border-radius:5px; cursor:pointer;">
                    Ver Detalle
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para ver detalle al hacer click
function verDetalleSistema(nombre) {
    alert(`📋 Abriendo detalle completo del sistema:\n\n${nombre}\n\n(En próximas versiones se abrirá una página dedicada con toda la información técnica, arquitectura, despliegue y evidencias).`);
    
    // Futuro: Redirección a página de detalle
    // window.location.href = `detalle-sistema.html?nombre=${encodeURIComponent(nombre)}`;
}