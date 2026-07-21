/* ==========================================================================
   DIAGTI · CTIC UNAS — Login con Redirección por Rol (DNI)
   Versión: Con integración Backend Spring Boot
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // CONFIGURACIÓN DE LA API - USANDO PROXY NGINX
    // ============================================
    const API_AUTH_URL = '/auth/login';
    const API_VERIFY_URL = '/auth/verify';

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
    // USUARIOS Y ROLES (RESPALDO LOCAL - FALLBACK)
    // ============================================
    const usuarios = {
        '76551691': {
            password: 'admin123',
            rol: 'admin',
            nombre: 'Johan Alberto Vela Arevalo',
            dni: '76551691',
            redirect: '/pages/admin/modules/gestion-usuarios/gestion-usuarios.component.html'
        },
        '74331380': {
            password: 'admin123',
            rol: 'auditor',
            nombre: 'Carlos Ruiz',
            dni: '74331380',
            redirect: '/pages/auditor/modules/html/inventario.html'
        },
        '71234567': {
            password: 'admin123',
            rol: 'desarrollo',
            nombre: 'Juan Pérez',
            dni: '71234567',
            redirect: '/pages/desarrollo/modules/html/dashboard.html'
        },
        '72345678': {
            password: 'admin123',
            rol: 'directivo',
            nombre: 'María Gómez',
            dni: '72345678',
            redirect: '/pages/directivo/modules/html/dashboard-riesgos.html'
        },
        '73456789': {
            password: 'admin123',
            rol: 'funcional',
            nombre: 'Laura García',
            dni: '73456789',
            redirect: '/pages/funcional/modules/gestion-catalogos/gestion-catalogos.component.html'
        },
        '74567890': {
            password: 'admin123',
            rol: 'infraestructura',
            nombre: 'Ana Torres',
            dni: '74567890',
            redirect: '/pages/infraestructura/html/dashboard.html'
        },
        '75678901': {
            password: 'admin123',
            rol: 'validacion',
            nombre: 'Roberto Díaz',
            dni: '75678901',
            redirect: '/pages/validacion/modules/html/dashboard.html'
        }
    };

    // ============================================
    // FUNCIÓN DE AUTENTICACIÓN CON BACKEND
    // ============================================
    async function autenticarUsuario(dni, password) {
        try {
            console.log('📡 Enviando petición a:', API_AUTH_URL);
            
            const response = await fetch(API_AUTH_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: dni, 
                    password: password 
                })
            });

            console.log('📥 Respuesta recibida:', response.status);

            if (!response.ok) {
                let errorMsg = 'Error de autenticación';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    errorMsg = `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            console.log('✅ Autenticación exitosa:', data);
            return data;
        } catch (error) {
            console.error("❌ Error conectando con backend:", error);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.warn('⚠️ Backend no disponible, usando autenticación local');
                return null;
            }
            
            throw error;
        }
    }

    // ============================================
    // FALLBACK: AUTENTICACIÓN LOCAL
    // ============================================
    function autenticarLocal(dni, password) {
        const usuario = usuarios[dni];
        
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        
        if (usuario.password !== password) {
            throw new Error('Contraseña incorrecta');
        }

        return {
            success: true,
            username: dni,
            nombreCompleto: usuario.nombre,
            rol: usuario.rol,
            redirectUrl: usuario.redirect,
            message: 'Autenticación local exitosa'
        };
    }

    // ============================================
    // FUNCIÓN PARA CORREGIR URL DE REDIRECCIÓN
    // ============================================
    function corregirUrlRedireccion(url) {
        if (!url) return '/pages/login/html/login.html';
        
        if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        if (url.startsWith('../') || url.startsWith('./')) {
            let cleanUrl = url.replace(/\.\.\//g, '').replace(/\.\//g, '');
            if (!cleanUrl.startsWith('pages/') && !cleanUrl.startsWith('/pages/')) {
                cleanUrl = '/pages/' + cleanUrl;
            }
            if (!cleanUrl.startsWith('/')) {
                cleanUrl = '/' + cleanUrl;
            }
            return cleanUrl;
        }
        
        if (!url.startsWith('/')) {
            return '/pages/' + url;
        }
        
        return url;
    }

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
    function validarDNI(dni) {
        return /^\d{8}$/.test(dni);
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
        loginError.style.opacity = '1';
        clearTimeout(window.errorTimeout);
        window.errorTimeout = setTimeout(() => {
            loginError.style.opacity = '0';
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 300);
        }, 5000);
    }

    function ocultarError() {
        loginError.style.display = 'none';
        loginError.style.opacity = '1';
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
        setTimeout(() => {
            modalSupport.style.opacity = '1';
        }, 10);
    }

    function cerrarModalSoporte() {
        modalSupport.style.opacity = '0';
        setTimeout(() => {
            modalSupport.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
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
    // ENVIAR FORMULARIO
    // ============================================
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        ocultarError();
        
        if (isSubmitting) return;

        const dni = codigoInput.value.trim();
        if (!dni) {
            mostrarError('El DNI es obligatorio');
            marcarError(codigoInput);
            codigoInput.focus();
            return;
        }

        if (!validarDNI(dni)) {
            mostrarError('DNI inválido. Debe tener 8 dígitos');
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
        // AUTENTICACIÓN
        // ============================================
        isSubmitting = true;
        loginBtn.disabled = true;
        btnText.textContent = 'Validando...';
        btnSpinner.style.display = 'inline-block';

        try {
            let resultado = await autenticarUsuario(dni, password);
            let redirectUrl = '';
            let nombreCompleto = '';
            let rol = '';

            if (!resultado || !resultado.success) {
                console.warn('⚠️ Usando autenticación local (fallback)');
                resultado = autenticarLocal(dni, password);
            }

            if (resultado.redirectUrl) {
                redirectUrl = resultado.redirectUrl;
                nombreCompleto = resultado.nombreCompleto || resultado.nombre || dni;
                rol = resultado.rol || 'usuario';
            } else {
                const usuarioLocal = usuarios[dni];
                if (usuarioLocal) {
                    redirectUrl = usuarioLocal.redirect;
                    nombreCompleto = usuarioLocal.nombre;
                    rol = usuarioLocal.rol;
                } else {
                    throw new Error('No se pudo determinar la redirección');
                }
            }

            redirectUrl = corregirUrlRedireccion(redirectUrl);
            console.log('🔀 Redirigiendo a:', redirectUrl);

            const sessionData = {
                username: dni,
                nombreCompleto: nombreCompleto,
                rol: rol,
                loginTime: new Date().toISOString(),
                token: resultado.token || null,
                authenticated: true
            };

            localStorage.setItem('diagti_session', JSON.stringify(sessionData));
            sessionStorage.setItem('diagti_session', JSON.stringify(sessionData));

            btnText.textContent = `✅ Bienvenido ${nombreCompleto}`;
            btnSpinner.style.display = 'none';
            loginBtn.style.background = '#1abb9c';

            setTimeout(function() {
                window.location.href = redirectUrl;
            }, 1500);

        } catch (error) {
            console.error('❌ Error:', error);
            
            try {
                const resultadoLocal = autenticarLocal(dni, password);
                let redirectUrl = corregirUrlRedireccion(resultadoLocal.redirectUrl);
                
                const sessionData = {
                    username: dni,
                    nombreCompleto: resultadoLocal.nombreCompleto,
                    rol: resultadoLocal.rol,
                    loginTime: new Date().toISOString(),
                    authenticated: true,
                    localAuth: true
                };
                
                localStorage.setItem('diagti_session', JSON.stringify(sessionData));
                sessionStorage.setItem('diagti_session', JSON.stringify(sessionData));
                
                btnText.textContent = `✅ Bienvenido ${resultadoLocal.nombreCompleto}`;
                btnSpinner.style.display = 'none';
                loginBtn.style.background = '#1abb9c';
                
                setTimeout(function() {
                    window.location.href = redirectUrl;
                }, 1500);
                
                return;
            } catch (localError) {
                mostrarError(localError.message || 'Error de autenticación');
            }
            
            isSubmitting = false;
            loginBtn.disabled = false;
            btnText.textContent = 'Ingresar al Sistema';
            btnSpinner.style.display = 'none';
            loginBtn.style.background = '';
            
            passwordInput.value = '';
            passwordInput.focus();
            actualizarCaptcha();
        }
    });

    // ============================================
    // VERIFICAR SESIÓN ACTIVA
    // ============================================
    async function verificarSesion() {
        const session = localStorage.getItem('diagti_session');
        if (session) {
            try {
                const data = JSON.parse(session);
                const loginTime = new Date(data.loginTime);
                const now = new Date();
                const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
                
                if (hoursDiff > 24) {
                    console.warn('⏰ Sesión expirada');
                    localStorage.removeItem('diagti_session');
                    sessionStorage.removeItem('diagti_session');
                    return;
                }
                
                const usuario = usuarios[data.username];
                if (usuario) {
                    const redirectUrl = corregirUrlRedireccion(usuario.redirect);
                    console.log('🔄 Sesión activa, redirigiendo a:', redirectUrl);
                    window.location.href = redirectUrl;
                }
            } catch (e) {
                localStorage.removeItem('diagti_session');
                sessionStorage.removeItem('diagti_session');
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
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 8) {
            this.value = this.value.slice(0, 8);
        }
    });

    // ============================================
    // INICIALIZAR
    // ============================================
    actualizarCaptcha();
    codigoInput.focus();
    verificarSesion();

    console.log('========================================');
    console.log('✅ Login DIAGTI CTIC UNAS inicializado');
    console.log('========================================');
    console.log('🔗 API Endpoint:', API_AUTH_URL);
    console.log('📋 Usuarios disponibles:');
    Object.keys(usuarios).forEach(key => {
        console.log(`  ${key} → ${usuarios[key].rol} (${usuarios[key].nombre})`);
    });
    console.log('ℹ️  Contraseña para todos: admin123');
    console.log('========================================');
});