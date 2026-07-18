/* ==========================================================================
   DIAGTI · CTIC UNAS — Login
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // ELEMENTOS DEL DOM
    // ============================================
    const loginForm = document.getElementById('loginForm');
    const codigoInput = document.getElementById('codigoUniversitario');
    const passwordInput = document.getElementById('password');
    const captchaInput = document.getElementById('captchaInput');
    const captchaText = document.getElementById('captchaText');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnSpinner = document.getElementById('btnSpinner');
    const loginError = document.getElementById('loginError');
    const errorMessage = document.getElementById('errorMessage');

    const modalSupport = document.getElementById('modalSupport');
    const linkSupport = document.getElementById('linkSupport');
    const linkForgot = document.getElementById('linkForgot');
    const closeModalSupport = document.getElementById('closeModalSupport');
    const btnSupportClose = document.getElementById('btnSupportClose');

    let currentCaptcha = '';
    let isSubmitting = false;

    // ============================================
    // USUARIOS Y ROLES (SIMULACIÓN)
    // ============================================
    const usuarios = {
        // ADMINISTRADOR
        '2020-12345': {
            password: 'admin123',
            rol: 'admin',
            nombre: 'Johan Alberto Vela Arevalo',
            redirect: '../../admin/modules/gestion-usuarios/gestion-usuarios.component.html'
        },
        // AUDITOR
        '2021-67890': {
            password: 'auditor456',
            rol: 'auditor',
            nombre: 'Carlos Ruiz',
            redirect: '../../auditor/modules/html/auditoria.html'
        },
        // DESARROLLO
        '2022-11111': {
            password: 'desarrollo789',
            rol: 'desarrollo',
            nombre: 'Juan Pérez',
            redirect: '../../desarrollo/modules/evidencias-obligatorias/evidencias-obligatorias.component.html'
        },
        // DIRECTIVO
        '2023-22222': {
            password: 'directivo321',
            rol: 'directivo',
            nombre: 'María Gómez',
            redirect: '../../director/modules/resumen-ejecutivo/resumen-ejecutivo.component.html'
        },
        // FUNCIONAL
        '2024-33333': {
            password: 'funcional654',
            rol: 'funcional',
            nombre: 'Laura García',
            redirect: '../../funcional/modules/gestion-catalogos/gestion-catalogos.component.html'
        },
        // INFRAESTRUCTURA
        '2025-44444': {
            password: 'infra987',
            rol: 'infraestructura',
            nombre: 'Ana Torres',
            redirect: '../../infraestructura/modules/roles-permisos/roles-permisos.component.html'
        },
        // VALIDACION
        '2026-55555': {
            password: 'validacion111',
            rol: 'validacion',
            nombre: 'Roberto Díaz',
            redirect: '../../validacion/modules/evidencias-obligatorias/evidencias-obligatorias.component.html'
        }
    };

    // ============================================
    // CAPTCHA
    // ============================================
    function generarCaptcha() {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let resultado = '';
        for (let i = 0; i < 4; i++) {
            resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return resultado;
    }

    function actualizarCaptcha() {
        currentCaptcha = generarCaptcha();
        captchaText.textContent = currentCaptcha;
        captchaInput.value = '';
        captchaInput.classList.remove('error');
        
        captchaText.style.transform = 'scale(0.8)';
        captchaText.style.opacity = '0.5';
        setTimeout(() => {
            captchaText.style.transform = 'scale(1)';
            captchaText.style.opacity = '1';
        }, 150);
    }

    // ============================================
    // VALIDACIONES
    // ============================================
    function validarCodigo(codigo) {
        const regex = /^\d{4}-\d{5}$/;
        return regex.test(codigo);
    }

    function validarPassword(password) {
        return password.length >= 6;
    }

    function validarCaptcha(input) {
        return input.toUpperCase() === currentCaptcha;
    }

    // ============================================
    // ERRORES
    // ============================================
    function mostrarError(mensaje) {
        errorMessage.textContent = mensaje;
        loginError.style.display = 'flex';
        clearTimeout(window.errorTimeout);
        window.errorTimeout = setTimeout(() => {
            loginError.style.display = 'none';
        }, 5000);
    }

    function ocultarError() {
        loginError.style.display = 'none';
        clearTimeout(window.errorTimeout);
    }

    function marcarError(input) {
        input.classList.add('error');
        setTimeout(() => {
            input.classList.remove('error');
        }, 3000);
    }

    // ============================================
    // MODAL DE SOPORTE
    // ============================================
    function abrirModalSoporte() {
        modalSupport.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function cerrarModalSoporte() {
        modalSupport.style.display = 'none';
        document.body.style.overflow = '';
    }

    linkSupport.addEventListener('click', function(e) {
        e.preventDefault();
        abrirModalSoporte();
    });

    linkForgot.addEventListener('click', function(e) {
        e.preventDefault();
        abrirModalSoporte();
    });

    closeModalSupport.addEventListener('click', cerrarModalSoporte);
    btnSupportClose.addEventListener('click', cerrarModalSoporte);

    modalSupport.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalSoporte();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalSupport.style.display === 'flex') {
            cerrarModalSoporte();
        }
    });

    // ============================================
    // TOGGLE CONTRASEÑA
    // ============================================
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    // ============================================
    // REFRESCAR CAPTCHA
    // ============================================
    refreshCaptchaBtn.addEventListener('click', function() {
        actualizarCaptcha();
        this.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 300);
    });

    // ============================================
    // ENVIAR FORMULARIO - CON REDIRECCIÓN POR ROL
    // ============================================
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        ocultarError();
        if (isSubmitting) return;

        const codigo = codigoInput.value.trim();
        if (!codigo) {
            mostrarError('El código universitario es obligatorio');
            marcarError(codigoInput);
            codigoInput.focus();
            return;
        }

        if (!validarCodigo(codigo)) {
            mostrarError('Formato inválido. Usa: AAAA-NNNNN (ej: 2020-12345)');
            marcarError(codigoInput);
            codigoInput.focus();
            return;
        }

        const password = passwordInput.value;
        if (!password) {
            mostrarError('La contraseña es obligatoria');
            marcarError(passwordInput);
            passwordInput.focus();
            return;
        }

        if (!validarPassword(password)) {
            mostrarError('La contraseña debe tener al menos 6 caracteres');
            marcarError(passwordInput);
            passwordInput.focus();
            return;
        }

        const captcha = captchaInput.value.trim();
        if (!captcha) {
            mostrarError('El código de verificación es obligatorio');
            marcarError(captchaInput);
            captchaInput.focus();
            return;
        }

        if (!validarCaptcha(captcha)) {
            mostrarError('El código de verificación es incorrecto');
            marcarError(captchaInput);
            captchaInput.value = '';
            captchaInput.focus();
            actualizarCaptcha();
            return;
        }

        // ============================================
        // AUTENTICACIÓN POR ROL
        // ============================================
        const usuario = usuarios[codigo];
        
        if (!usuario || usuario.password !== password) {
            mostrarError('Usuario o contraseña incorrectos');
            marcarError(codigoInput);
            marcarError(passwordInput);
            actualizarCaptcha();
            passwordInput.value = '';
            passwordInput.focus();
            return;
        }

        // Guardar datos de sesión
        const sessionData = {
            codigo: codigo,
            rol: usuario.rol,
            nombre: usuario.nombre,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('diagti_session', JSON.stringify(sessionData));
        sessionStorage.setItem('diagti_session', JSON.stringify(sessionData));

        // Mostrar feedback de éxito
        isSubmitting = true;
        loginBtn.disabled = true;
        btnText.textContent = `Bienvenido ${usuario.nombre}`;
        btnSpinner.style.display = 'none';
        loginBtn.style.background = '#1abb9c';

        // Redirigir según el rol
        setTimeout(function() {
            window.location.href = usuario.redirect;
        }, 1200);

    });

    // ============================================
    // VERIFICAR SESIÓN ACTIVA
    // ============================================
    function verificarSesion() {
        const session = localStorage.getItem('diagti_session');
        if (session) {
            try {
                const data = JSON.parse(session);
                // Si hay sesión activa, redirigir automáticamente
                const usuario = usuarios[data.codigo];
                if (usuario) {
                    window.location.href = usuario.redirect;
                }
            } catch (e) {
                localStorage.removeItem('diagti_session');
            }
        }
    }

    // ============================================
    // EVENTOS ADICIONALES
    // ============================================
    captchaInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    [codigoInput, passwordInput, captchaInput].forEach(input => {
        input.addEventListener('input', function() {
            ocultarError();
            this.classList.remove('error');
        });
    });

    codigoInput.addEventListener('input', function() {
        this.value = this.value.replace(/\s/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
        if (this.value.length === 4 && !this.value.includes('-')) {
            this.value = this.value + '-';
        }
    });

    // ============================================
    // INICIALIZAR
    // ============================================
    actualizarCaptcha();
    codigoInput.focus();

    // Verificar si ya hay sesión activa
    verificarSesion();

    console.log('Login DIAGTI CTIC UNAS inicializado');
    console.log('Usuarios disponibles:');
    Object.keys(usuarios).forEach(key => {
        console.log(`  ${key} → ${usuarios[key].rol} (${usuarios[key].nombre})`);
    });
});