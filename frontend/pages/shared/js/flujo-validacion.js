(function () {
    const API = '/api/flujo-validacion';

    function sesion() {
        try { return JSON.parse(localStorage.getItem('diagti_session') || '{}'); }
        catch (_) { return {}; }
    }

    function mensajeRespuestaError(detalle, estadoHttp) {
        const texto = String(detalle || '').trim();
        if (!texto) return `Error HTTP ${estadoHttp}`;
        try {
            const json = JSON.parse(texto);
            return json.message || json.error || texto;
        } catch (_) {
            return texto;
        }
    }

    async function peticion(url, opciones = {}) {
        const response = await fetch(url, {
            ...opciones,
            headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
        });
        if (!response.ok) {
            const detalle = await response.text();
            throw new Error(mensajeRespuestaError(detalle, response.status));
        }
        return response.status === 204 ? null : response.json();
    }

    /**
     * Sustituye los textos de demostración del menú de Desarrollo por los
     * datos de la cuenta que inició sesión. No modifica la propiedad de los
     * sistemas: esa autorización continúa validándose en PostgreSQL.
     */
    function actualizarPerfilDesarrollo() {
        if (!window.location.pathname.includes('/pages/desarrollo/')) return;
        const actual = sesion();
        const nombre = String(actual.nombreCompleto || actual.username || '').trim();
        if (!nombre) return;

        const partes = nombre.split(/\s+/).filter(Boolean);
        const iniciales = partes.length > 1
            ? `${partes[0][0]}${partes[partes.length - 1][0]}`
            : partes[0].slice(0, 2);

        document.querySelectorAll('.profile-name').forEach(elemento => {
            elemento.textContent = nombre;
        });
        document.querySelectorAll('.profile-avatar').forEach(elemento => {
            elemento.textContent = iniciales.toUpperCase();
        });
        document.querySelectorAll('.profile-role').forEach(elemento => {
            elemento.textContent = 'Área de Desarrollo';
        });
    }

    function datos(solicitud) {
        if (!solicitud) return {};
        try { return JSON.parse(solicitud.datosJson || '{}'); }
        catch (_) { return {}; }
    }

    function estadoPantalla(estado) {
        return ({
            NUEVO: 'Nuevo',
            BORRADOR: 'Borrador',
            ENVIADO: 'Enviado',
            PENDIENTE: 'Enviado',
            CORREGIDO: 'Corregido',
            SUBSANADO: 'Subsanado',
            VALIDADO: 'Validado',
            OBSERVADO: 'Observado',
            RECHAZADO: 'Rechazado'
        })[String(estado || '').toUpperCase()] || estado || 'Nuevo';
    }

    function observacion(solicitud) {
        if (!solicitud || !['OBSERVADO', 'RECHAZADO'].includes(solicitud.estado)) return null;
        return {
            campo: 'validacion',
            mensaje: solicitud.comentarioRevision || 'El Validador solicitó revisar la información.',
            fecha: solicitud.fechaRevision,
            validador: solicitud.revisadoPor || 'Validador CTIC'
        };
    }

    function aplicarSolicitud(sistema, solicitud) {
        const enviados = datos(solicitud);
        const hayCorreccionLocal = ['Subsanado', 'Corregido'].includes(sistema.estado)
            && solicitud.estado === 'OBSERVADO';
        const combinado = hayCorreccionLocal
            ? { ...enviados, ...sistema }
            : { ...sistema, ...enviados };
        combinado.id = sistema.id || enviados.id || solicitud.codigoSistema;
        combinado.codigo = sistema.codigo || enviados.codigo || solicitud.codigoSistema;
        combinado.nombre = sistema.nombre || enviados.nombre || solicitud.nombreSistema;
        combinado.area = sistema.area || enviados.area || enviados.area_usuaria || solicitud.areaUsuaria;
        const estadoServidor = estadoPantalla(solicitud.estado);
        const correccionLocal = hayCorreccionLocal && estadoServidor === 'Observado';
        combinado.estado = correccionLocal ? sistema.estado : estadoServidor;
        combinado.solicitud_validacion_id = solicitud.id;
        combinado.fecha_envio_validacion = solicitud.fechaEnvio;
        combinado.fecha_revision_validacion = solicitud.fechaRevision;
        combinado.respuesta_validacion = solicitud.comentarioRevision || '';
        combinado.revisado_por = solicitud.revisadoPor || '';
        const obs = observacion(solicitud);
        combinado.observaciones_validador = obs ? [obs] : [];
        return combinado;
    }

    async function listarPorOrigen(areaOrigen) {
        return peticion(`${API}/origen/${encodeURIComponent(areaOrigen)}`);
    }

    async function listarRegistros(areaOrigen, usuario) {
        const origen = String(areaOrigen || '').toUpperCase();
        const params = new URLSearchParams();
        if (usuario) params.set('usuario', usuario);
        if (origen === 'DESARROLLO') return peticion(`/api/desarrollador/flujo/sistemas?${params}`);
        if (origen === 'INFRAESTRUCTURA') return peticion(`/api/infraestructura/sistemas?${params}`);
        return [];
    }

    async function guardarRegistro({ codigoSistema, nombreSistema, areaOrigen, areaUsuaria, responsable, comentario, datos: contenido }, tipo) {
        const origen = String(areaOrigen || '').toUpperCase();
        const endpoint = origen === 'DESARROLLO'
            ? `/api/desarrollador/flujo/${tipo === 'correccion' ? 'correcciones' : 'borradores'}`
            : origen === 'INFRAESTRUCTURA'
                ? `/api/infraestructura/tecnico/${tipo === 'correccion' ? 'correcciones' : 'borradores'}`
                : null;
        if (!endpoint) throw new Error('El área no dispone de guardado de borradores');
        return peticion(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                codigoSistema,
                nombreSistema,
                areaUsuaria: areaUsuaria || origen,
                responsable: responsable || sesion().nombreCompleto || 'Usuario del sistema',
                usuarioOrigen: sesion().username || sesion().nombreCompleto || 'Usuario del sistema',
                comentario: comentario || '',
                datos: contenido || {}
            })
        });
    }

    function guardarBorrador(registro) { return guardarRegistro(registro, 'borrador'); }
    function guardarCorreccion(registro) { return guardarRegistro(registro, 'correccion'); }

    async function historial(areaOrigen, codigoSistema) {
        const params = new URLSearchParams();
        if (areaOrigen) params.set('areaOrigen', areaOrigen);
        if (codigoSistema) params.set('codigoSistema', codigoSistema);
        return peticion(`${API}/historial?${params}`);
    }

    async function enviar({ codigoSistema, nombreSistema, areaOrigen, areaUsuaria, responsable, comentario, datos: contenido }) {
        const origen = String(areaOrigen || '').toUpperCase();
        const endpoint = origen === 'DESARROLLO'
            ? '/api/desarrollador/flujo/enviar'
            : origen === 'INFRAESTRUCTURA'
                ? '/api/infraestructura/tecnico/enviar'
                : `${API}/solicitudes`;
        return peticion(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                codigoSistema,
                nombreSistema,
                areaOrigen: origen,
                areaUsuaria: areaUsuaria || origen,
                responsable: responsable || sesion().nombreCompleto || 'Usuario del sistema',
                usuarioOrigen: sesion().username || sesion().nombreCompleto || 'Usuario del sistema',
                comentario: comentario || 'Información enviada para validación',
                datos: contenido || {}
            })
        });
    }

    async function revisar(id, estado, comentario, observaciones = []) {
        return peticion(`${API}/solicitudes/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({
                estado,
                comentario,
                observaciones,
                revisadoPor: sesion().nombreCompleto || 'Validador CTIC',
                usuarioRevisor: sesion().username || sesion().nombreCompleto || 'Validador CTIC'
            })
        });
    }

    async function sincronizarColeccion(claveLocal, areaOrigen, base = []) {
        let locales = base;
        try {
            const guardados = JSON.parse(localStorage.getItem(claveLocal) || 'null');
            if (Array.isArray(guardados)) locales = guardados;
        } catch (_) { /* conservar base */ }

        const mapa = new Map(locales.map(s => [String(s.codigo || s.id), s]));
        let registros = [];
        let registrosSincronizados = false;
        if (String(areaOrigen).toUpperCase() === 'DESARROLLO') {
            try {
                registros = await listarRegistros(areaOrigen, sesion().username);
                registrosSincronizados = true;
            }
            catch (_) { registros = []; }
        }
        if (registrosSincronizados && sesion().username) mapa.clear();
        registros.forEach(registro => {
            const contenido = registro.datos || {};
            const codigo = String(registro.codigoSistema);
            mapa.set(codigo, {
                ...(mapa.get(codigo) || {}),
                ...contenido,
                id: contenido.id || codigo,
                codigo,
                nombre: registro.nombreSistema,
                area: registro.areaUsuaria,
                responsable_tecnico: registro.responsable,
                usuario_origen: registro.usuarioOrigen,
                propietario_area: registro.usuarioOrigen,
                estado: estadoPantalla(registro.estado),
                fecha: registro.fechaActualizacion
            });
        });
        const todasLasSolicitudes = await listarPorOrigen(areaOrigen);
        todasLasSolicitudes.forEach(solicitud => {
            const codigo = String(solicitud.codigoSistema);
            const actual = mapa.get(codigo) || datos(solicitud);
            mapa.set(codigo, aplicarSolicitud(actual, solicitud));
        });
        const resultado = [...mapa.values()];
        localStorage.setItem(claveLocal, JSON.stringify(resultado));
        return resultado;
    }

    window.DIAGTIFlujo = {
        aplicarSolicitud,
        datos,
        enviar,
        estadoPantalla,
        guardarBorrador,
        guardarCorreccion,
        historial,
        listarRegistros,
        listarPorOrigen,
        peticion,
        revisar,
        sesion,
        sincronizarColeccion
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', actualizarPerfilDesarrollo);
    } else {
        actualizarPerfilDesarrollo();
    }
})();
