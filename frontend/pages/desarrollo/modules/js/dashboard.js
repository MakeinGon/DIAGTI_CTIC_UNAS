// ============================================================
// DIAGTI · CTIC UNAS — Dashboard Desarrollo
// ============================================================

function cerrarSesion() {
    document.getElementById('logout-confirm-overlay')?.classList.add('open');
}

function cancelarCerrarSesion() {
    document.getElementById('logout-confirm-overlay')?.classList.remove('open');
}

function confirmarCerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../../login/html/login.html";
}

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
});

function getSistemas() {
    const stored = localStorage.getItem('diagti_sistemas');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) { }
    }
    return [
        {
            id: 'SIS001',
            codigo: 'SIS001',
            nombre: 'Sistema Académico',
            tipo: 'Web',
            estado: 'Validado',
            criticidad: 'Media',
            fecha: '08/07/2026',
            area: 'Académico',
            responsable_tecnico: 'Ing. María Gómez',
            observaciones_validador: [],
            arquitectura: 'MVC',
            motor_bd: 'PostgreSQL',
            evidencias: [{ tipo: 'Manual', nombre: 'manual.pdf' }],
            urls: [{ desc: 'Git', url: 'https://github.com' }],
            tiene_integraciones: true
        },
        {
            id: 'SIS002',
            codigo: 'SIS002',
            nombre: 'Sistema Biblioteca',
            tipo: 'Web',
            estado: 'Observado',
            criticidad: 'Alta',
            fecha: '05/07/2026',
            area: 'Biblioteca',
            responsable_tecnico: 'Ing. Luis Torres',
            observaciones_validador: [
                { campo: 'motor_bd', mensaje: 'Debe indicar versión PostgreSQL.' },
                { campo: 'repositorio', mensaje: 'Debe indicar repositorio Git.' }
            ],
            arquitectura: 'Microservicios',
            motor_bd: 'MySQL',
            evidencias: [],
            urls: [],
            tiene_integraciones: false
        },
        {
            id: 'SIS003',
            codigo: 'SIS003',
            nombre: 'Sistema Finanzas',
            tipo: 'Desktop',
            estado: 'Borrador',
            criticidad: 'Crítica',
            fecha: '03/07/2026',
            area: 'Finanzas',
            responsable_tecnico: 'Ing. Pedro Ramírez',
            observaciones_validador: [],
            arquitectura: '',
            motor_bd: '',
            evidencias: [],
            urls: [],
            tiene_integraciones: false
        },
        {
            id: 'SIS004',
            codigo: 'SIS004',
            nombre: 'SV',
            tipo: 'Web',
            estado: 'Borrador',
            criticidad: 'Baja',
            fecha: '13/07/2026',
            area: 'Investigación',
            responsable_tecnico: 'Ing. Carlos Ruiz',
            observaciones_validador: [],
            arquitectura: '',
            motor_bd: '',
            evidencias: [],
            urls: [],
            tiene_integraciones: false
        }
    ];
}

function calcularPorcentaje(sistema) {
    let completas = 0;
    let total = 6;
    if (sistema.nombre && sistema.area && sistema.responsable_tecnico && sistema.criticidad) completas++;
    if (sistema.tipo) completas++;
    if (sistema.arquitectura && sistema.arquitectura.trim() !== '') completas++;
    if (sistema.motor_bd) completas++;
    if (sistema.tiene_integraciones !== undefined && sistema.tiene_integraciones !== null && sistema.tiene_integraciones !== '') completas++;
    if ((sistema.evidencias && sistema.evidencias.length > 0) || (sistema.urls && sistema.urls.length > 0)) completas++;
    return Math.round((completas / total) * 100);
}

function renderDashboard() {
    const sistemas = getSistemas();

    const total = sistemas.length;
    const borradores = sistemas.filter(s => s.estado === 'Borrador').length;
    const enviados = sistemas.filter(s => s.estado === 'Enviado').length;
    const observados = sistemas.filter(s => s.estado === 'Observado').length;
    const validados = sistemas.filter(s => s.estado === 'Validado').length;

    document.getElementById('total-sistemas').textContent = total;
    document.getElementById('total-borrador').textContent = borradores;
    document.getElementById('total-enviado').textContent = enviados;
    document.getElementById('total-observado').textContent = observados;
    document.getElementById('total-validado').textContent = validados;

    const enviadosParaValidacion = enviados + validados;
    const porcentajeProgreso = total > 0 ? Math.round((enviadosParaValidacion / total) * 100) : 0;
    document.getElementById('progress-percent').textContent = porcentajeProgreso + '%';
    document.getElementById('progress-fill').style.width = porcentajeProgreso + '%';
    const restantes = total - enviadosParaValidacion;
    document.getElementById('progress-message').textContent =
        `${enviadosParaValidacion} de ${total} sistemas enviados a validación. ${restantes > 0 ? `Solo falta${restantes > 1 ? 'n' : ''} enviar ${restantes} sistema${restantes > 1 ? 's' : ''} más.` : '🎉 ¡Todos los sistemas han sido enviados!'}`;

    const hora = new Date().getHours();
    let saludo = 'Buenos días';
    if (hora >= 12 && hora < 18) saludo = 'Buenas tardes';
    else if (hora >= 18) saludo = 'Buenas noches';

    const mensajes = [];
    if (observados > 0) mensajes.push(`• ${observados} observado${observados > 1 ? 's' : ''}`);
    if (borradores > 0) mensajes.push(`• ${borradores} borrador${borradores > 1 ? 'es' : ''}`);
    if (mensajes.length === 0) mensajes.push('• ¡Todo al día! 🎉');

    document.getElementById('greeting-message').textContent = `${saludo}, Desarrollador Demo. 👋`;
    document.getElementById('greeting-submessage').textContent = `📌 Tienes: ${mensajes.join(' ')}`;

    const greetingAction = document.getElementById('greeting-action');
    if (observados > 0 || borradores > 0) {
        greetingAction.style.display = 'inline-flex';
        greetingAction.textContent = observados > 0 ? '🔴 Ir a observaciones' : '📋 Ir a pendientes';
        greetingAction.href = observados > 0 ? 'observaciones.html' : '#pending-section';
    } else {
        greetingAction.style.display = 'none';
    }

    // Pendientes
    const pendingContainer = document.getElementById('pending-list');
    const pendientes = sistemas.filter(s => s.estado === 'Borrador' || s.estado === 'Observado');
    if (pendientes.length === 0) {
        pendingContainer.innerHTML = '<div class="empty-state">🎉 No hay pendientes, ¡todo al día!</div>';
    } else {
        let html = '';
        pendientes.forEach(s => {
            const porcentaje = calcularPorcentaje(s);
            let detalle = '', btnTexto = '', btnClase = '', btnUrl = '';
            if (s.estado === 'Borrador' && porcentaje < 100) {
                detalle = `⚠️ ${porcentaje}% completado - Faltan datos`;
                btnTexto = '📝 Completar';
                btnClase = 'btn-verde';
                btnUrl = `mis-sistemas.html?action=editar&id=${s.id}`;
            } else if (s.estado === 'Borrador' && porcentaje === 100) {
                detalle = '✅ Listo para enviar';
                btnTexto = '📤 Enviar a validación';
                btnClase = 'btn-azul';
                btnUrl = `mis-sistemas.html?action=enviar&id=${s.id}`;
            } else if (s.estado === 'Observado') {
                const obsCount = (s.observaciones_validador || []).length;
                detalle = `🔴 ${obsCount} observación${obsCount > 1 ? 'es' : ''} pendiente${obsCount > 1 ? 's' : ''}`;
                btnTexto = '🔴 Ir a Observaciones';
                btnClase = 'btn-warning';
                btnUrl = `observaciones.html`;
            }
            html += `
                <div class="pending-item">
                    <div class="pending-info">
                        <div class="name">${s.nombre} <span class="badge badge-status-secondary">${s.estado}</span></div>
                        <div class="detail">${detalle}</div>
                    </div>
                    <a href="${btnUrl}" class="btn ${btnClase} btn-sm">${btnTexto}</a>
                </div>
            `;
        });
        pendingContainer.innerHTML = html;
    }

    // Observaciones
    const obsContainer = document.getElementById('observations-list');
    const conObservaciones = sistemas.filter(s => s.observaciones_validador && s.observaciones_validador.length > 0);
    if (conObservaciones.length === 0) {
        obsContainer.innerHTML = '<div class="empty-state">✅ Sin observaciones pendientes</div>';
    } else {
        let html = '';
        conObservaciones.forEach(s => {
            const obs = s.observaciones_validador;
            html += `
                <div class="obs-item">
                    <div class="obs-header">
                        <span class="obs-name">🔴 ${s.nombre}</span>
                        <a href="observaciones.html" class="btn btn-warning btn-sm">🔴 Ir a Observaciones</a>
                    </div>
                    <ul class="obs-details">
                        ${obs.map(o => `<li>${o.mensaje}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        obsContainer.innerHTML = html;
    }

    // Últimos sistemas
    const recentContainer = document.getElementById('recent-list');
    const recientes = [...sistemas].sort((a, b) => {
        const da = a.fecha ? a.fecha.split('/').reverse().join('') : '0';
        const db = b.fecha ? b.fecha.split('/').reverse().join('') : '0';
        return db - da;
    }).slice(0, 5);
    if (recientes.length === 0) {
        recentContainer.innerHTML = '<li class="empty-state">No hay sistemas registrados aún.</li>';
    } else {
        let html = '';
        recientes.forEach(s => {
            const estadoClase = s.estado === 'Validado' ? 'badge-status-success' :
                s.estado === 'Observado' ? 'badge-status-danger' :
                    s.estado === 'Enviado' ? 'badge-status-info' : 'badge-status-secondary';
            html += `
                <li>
                    <span class="dot"></span>
                    ${s.nombre} 
                    <span class="badge ${estadoClase}" style="font-size:9px; padding:2px 6px; margin-left:4px;">${s.estado}</span>
                    <span style="color:var(--muted); font-size:11px; margin-left:auto;">${s.fecha || 'Sin fecha'}</span>
                </li>
            `;
        });
        recentContainer.innerHTML = html;
    }

    // Próximas acciones
    const actionsContainer = document.getElementById('next-actions-list');
    const acciones = [];
    const ultimoValidado = sistemas.filter(s => s.estado === 'Validado').sort((a, b) => {
        const da = a.fecha ? a.fecha.split('/').reverse().join('') : '0';
        const db = b.fecha ? b.fecha.split('/').reverse().join('') : '0';
        return db - da;
    })[0];
    if (ultimoValidado) acciones.push({ titulo: '✅ Último validado', desc: `${ultimoValidado.nombre} - ${ultimoValidado.fecha}` });
    const ultimoObservado = sistemas.filter(s => s.estado === 'Observado').sort((a, b) => {
        const da = a.fecha ? a.fecha.split('/').reverse().join('') : '0';
        const db = b.fecha ? b.fecha.split('/').reverse().join('') : '0';
        return db - da;
    })[0];
    if (ultimoObservado) {
        const count = (ultimoObservado.observaciones_validador || []).length;
        acciones.push({ titulo: '🔴 Última observación', desc: `${ultimoObservado.nombre} - ${count} observación${count > 1 ? 'es' : ''}` });
    }
    const ultimoEnviado = sistemas.filter(s => s.estado === 'Enviado').sort((a, b) => {
        const da = a.fecha ? a.fecha.split('/').reverse().join('') : '0';
        const db = b.fecha ? b.fecha.split('/').reverse().join('') : '0';
        return db - da;
    })[0];
    if (ultimoEnviado) acciones.push({ titulo: '📤 Último enviado', desc: `${ultimoEnviado.nombre} - ${ultimoEnviado.fecha}` });
    if (acciones.length === 0) {
        actionsContainer.innerHTML = '<div class="empty-state">🏆 ¡Sin acciones pendientes!</div>';
    } else {
        let html = '';
        acciones.forEach(a => {
            html += `
                <div class="action-item">
                    <div class="action-info">
                        <div class="action-title">${a.titulo}</div>
                        <div class="action-desc">${a.desc}</div>
                    </div>
                </div>
            `;
        });
        actionsContainer.innerHTML = html;
    }

    // Actividad reciente
    renderActividadReciente(sistemas);
}

function renderActividadReciente(sistemas) {
    const container = document.getElementById('actividad-reciente');
    if (!container) return;
    const accionesMap = {
        'Validado': 'Sistema validado',
        'Observado': 'Observaciones recibidas',
        'Enviado': 'Enviado a validación',
        'Borrador': 'Sistema registrado',
        'Subsanado': 'Observaciones corregidas'
    };
    const actividades = sistemas.map(s => ({
        nombre: s.nombre,
        accion: accionesMap[s.estado] || 'Información actualizada',
        estado: s.estado,
        fecha: s.fecha || new Date().toLocaleDateString('es-PE')
    }));
    const recientes = actividades.sort((a, b) => {
        const da = a.fecha.split('/').reverse().join('');
        const db = b.fecha.split('/').reverse().join('');
        return db - da;
    }).slice(0, 5);
    if (recientes.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay actividad reciente.</div>';
        return;
    }
    const estadoClaseMap = {
        'Validado': 'badge-status-success',
        'Observado': 'badge-status-danger',
        'Enviado': 'badge-status-info',
        'Borrador': 'badge-status-secondary',
        'Subsanado': 'badge-status-warning'
    };
    let html = `
        <table>
            <thead><tr><th>Sistema</th><th>Acción</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
    `;
    recientes.forEach(item => {
        const clase = estadoClaseMap[item.estado] || 'badge-status-secondary';
        html += `
            <tr>
                <td><strong>${item.nombre}</strong></td>
                <td>${item.accion}</td>
                <td><span class="badge ${clase}">${item.estado}</span></td>
                <td>${item.fecha}</td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function () {
    renderDashboard();
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'dashboard.html') item.classList.add('active');
    });
});