/* ==========================================================================
   DIAGTI · CTIC UNAS — Login con Redirección por Rol (DNI)
   Versión: DEFINITIVA - Usando proxy nginx
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // CONFIGURACIÓN DE LA API - USANDO PROXY NGINX
    // ============================================
    const API_AUTH_URL = '/auth/login';  // ✅ CORRECTO - Usa proxy nginx

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
    // LIMPIAR URL - ELIMINAR /DIAGTI_CTIC_UNAS/
    // ============================================
    function limpiarUrl(url) {
        if (!url) return '/pages/login/html/login.html';
        let cleanUrl = url;
        cleanUrl = cleanUrl.replace(/\/DIAGTI_CTIC_UNAS/g, '');
        cleanUrl = cleanUrl.replace(/\/frontend\/pages/g, '/pages');
        if (!cleanUrl || cleanUrl === '/' || cleanUrl === '') {
            return '/pages/login/html/login.html';
        }
        if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
            cleanUrl = '/' + cleanUrl;
        }
        return cleanUrl;
    }

    // ============================================
    // AUTENTICACIÓN CON BACKEND
    // ============================================
    async function autenticarUsuario(dni, password) {
        try {
            console.log('📡 Enviando petición a:', API_AUTH_URL);
            
            const response = await fetch(API_AUTH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: dni, password: password })
            });

            console.log('📥 Estado de la respuesta:', response.status);

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
            
            if (data.redirectUrl) {
                data.redirectUrl = limpiarUrl(data.redirectUrl);
            }
            
            return data;
        } catch (error) {
            console.error("❌ Error:", error);
            throw error;
        }
    }

    // ============================================
    // CAPTCHA
    // ============================================
    function generarCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let resultado = '';
        for (let i = 0; i < 4; i++) {
            resultado += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return resultado;
    }

    function actualizarCaptcha() {
        currentCaptcha = generarCaptcha();
        captchaText.textContent = currentCaptcha;
        captchaInput.value = '';
        captchaInput.classList.remove('error');
    }

    // ============================================
    // VALIDACIONES
    // ============================================
    function validarDNI(dni) { return /^\d{8}$/.test(dni); }
    function validarPassword(password) { return password.length >= 6; }
    function validarCaptcha(input) { return input.toUpperCase() === currentCaptcha; }

    // ============================================
    // ERRORES
    // ============================================
    function mostrarError(mensaje) {
        errorMessage.textContent = mensaje;
        loginError.style.display = 'flex';
        setTimeout(() => { loginError.style.display = 'none'; }, 5000);
    }

    function ocultarError() { loginError.style.display = 'none'; }
    function marcarError(input) {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 3000);
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

    linkSupport.addEventListener('click', (e) => { e.preventDefault(); abrirModalSoporte(); });
    linkForgot.addEventListener('click', (e) => { e.preventDefault(); abrirModalSoporte(); });
    closeModalSupport.addEventListener('click', cerrarModalSoporte);
    btnSupportClose.addEventListener('click', cerrarModalSoporte);
    modalSupport.addEventListener('click', (e) => { if (e.target === modalSupport) cerrarModalSoporte(); });

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
        setTimeout(() => { this.style.transform = 'rotate(0deg)'; }, 300);
    });

    // ============================================
    // ENVIAR FORMULARIO
    // ============================================
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        ocultarError();
        if (isSubmitting) return;

        const dni = codigoInput.value.trim();
        if (!dni) { mostrarError('El DNI es obligatorio'); marcarError(codigoInput); codigoInput.focus(); return; }
        if (!validarDNI(dni)) { mostrarError('DNI inválido. Debe tener 8 dígitos'); marcarError(codigoInput); codigoInput.focus(); return; }

        const password = passwordInput.value;
        if (!password) { mostrarError('La contraseña es obligatoria'); marcarError(passwordInput); passwordInput.focus(); return; }
        if (!validarPassword(password)) { mostrarError('La contraseña debe tener al menos 6 caracteres'); marcarError(passwordInput); passwordInput.focus(); return; }

        const captcha = captchaInput.value.trim();
        if (!captcha) { mostrarError('El código de verificación es obligatorio'); marcarError(captchaInput); captchaInput.focus(); return; }
        if (!validarCaptcha(captcha)) { mostrarError('El código de verificación es incorrecto'); marcarError(captchaInput); captchaInput.value = ''; captchaInput.focus(); actualizarCaptcha(); return; }

        isSubmitting = true;
        loginBtn.disabled = true;
        btnText.textContent = 'Validando...';
        btnSpinner.style.display = 'inline-block';

        try {
            const resultado = await autenticarUsuario(dni, password);

            const redirectUrl = limpiarUrl(resultado.redirectUrl);
            const nombreCompleto = resultado.nombreCompleto || resultado.nombre || dni;
            const rol = resultado.rol || 'usuario';

            console.log('🔀 Redirigiendo a:', redirectUrl);

            const sessionData = {
                username: dni,
                nombreCompleto: nombreCompleto,
                rol: rol,
                redirectUrl: redirectUrl,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('diagti_session', JSON.stringify(sessionData));

            btnText.textContent = `✅ Bienvenido ${nombreCompleto}`;
            btnSpinner.style.display = 'none';
            loginBtn.style.background = '#1abb9c';

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);

        } catch (error) {
            console.error('❌ Error:', error);
            mostrarError(error.message || 'Error de autenticación');
            
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
    // INICIALIZAR
    // ============================================
    // Limpiar sesión al cargar el login
    localStorage.removeItem('diagti_session');
    sessionStorage.removeItem('diagti_session');

    actualizarCaptcha();
    codigoInput.focus();

    console.log('========================================');
    console.log('✅ Login DIAGTI CTIC UNAS inicializado');
    console.log('========================================');
    console.log('🔗 API Endpoint:', API_AUTH_URL);
    console.log('ℹ️  Los usuarios se autentican contra la base de datos');
    console.log('========================================');
});