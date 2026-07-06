document.addEventListener('DOMContentLoaded', () => {
    cargarTablaDashboard();
});

function cargarTablaDashboard() {
    const sistemas = [
        {
            nombre: "SIGA - Sistema Integrado de Gestión Académica",
            estadoInfra: "Estable",
            despliegue: "OK",
            seguridad: "Cumple",
            ultima: "03 Jul 2026"
        },
        {
            nombre: "SIAF - Sistema Administrativo Financiero",
            estadoInfra: "Estable",
            despliegue: "OK",
            seguridad: "Cumple",
            ultima: "02 Jul 2026"
        },
        {
            nombre: "Plataforma de Matrícula en Línea",
            estadoInfra: "En Riesgo",
            despliegue: "Pendiente",
            seguridad: "Parcial",
            ultima: "30 Jun 2026"
        }
    ];

    const tbody = document.querySelector('#tabla-dashboard tbody');
    tbody.innerHTML = '';

    sistemas.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.nombre}</strong></td>
            <td><span class="badge ${s.estadoInfra === 'Estable' ? 'success' : 'warning'}">${s.estadoInfra}</span></td>
            <td><span class="badge success">${s.despliegue}</span></td>
            <td><span class="badge ${s.seguridad === 'Cumple' ? 'success' : 'warning'}">${s.seguridad}</span></td>
            <td>${s.ultima}</td>
        `;
        tbody.appendChild(tr);
    });
}