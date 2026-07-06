'use strict';

/**
 * DIAGTI CTIC UNAS
 * Módulo Directivo · Configuración de Cuenta
 *
 * Responsabilidades:
 * - Cargar y guardar preferencias locales del usuario.
 * - Mostrar u ocultar los campos de contraseña.
 * - Validar que la nueva contraseña y su confirmación coincidan.
 * - Informar con claridad que el cambio real de contraseña requiere backend.
 *
 * No contiene endpoints, APIs ni lógica real de autenticación.
 */

(() => {
    const PREFERENCES_STORAGE_KEY = 'directivoPreferences';
    const SIDEBAR_STORAGE_KEY = 'sidebarCollapsed';


    const preferencesForm = document.getElementById(
        'preferences-form'
    );


    const priorityAlertsInput = document.getElementById(
        'preference-priority-alerts'
    );


    const rememberSidebarInput = document.getElementById(
        'preference-sidebar-state'
    );


    const passwordForm = document.getElementById(
        'password-change-form'
    );


    const currentPasswordInput = document.getElementById(
        'current-password'
    );


    const newPasswordInput = document.getElementById(
        'new-password'
    );


    const confirmPasswordInput = document.getElementById(
        'confirm-password'
    );


    const passwordMessage = document.getElementById(
        'password-form-message'
    );


    const passwordToggleButtons = Array.from(
        document.querySelectorAll(
            '[data-action="toggle-password"][data-target]'
        )
    );


    /**
     * Lee un valor de localStorage de forma segura.
     *
     * @param {string} key
     * @returns {string|null}
     */
    const readLocalStorage = (key) => {

        try {

            return localStorage.getItem(key);

        } catch (error) {

            console.warn(
                '[DIAGTI] No se pudo leer el almacenamiento local.',
                error
            );


            return null;
        }
    };


    /**
     * Guarda un valor en localStorage de forma segura.
     *
     * @param {string} key
     * @param {string} value
     * @returns {boolean}
     */
    const writeLocalStorage = (
        key,
        value
    ) => {

        try {

            localStorage.setItem(
                key,
                value
            );


            return true;

        } catch (error) {

            console.warn(
                '[DIAGTI] No se pudo guardar en el almacenamiento local.',
                error
            );


            return false;
        }
    };


    /**
     * Elimina un valor de localStorage de forma segura.
     *
     * @param {string} key
     */
    const removeLocalStorage = (key) => {

        try {

            localStorage.removeItem(key);

        } catch (error) {

            console.warn(
                '[DIAGTI] No se pudo eliminar el valor del almacenamiento local.',
                error
            );
        }
    };


    /**
     * Crea, si hace falta, un mensaje accesible
     * para el formulario de preferencias.
     *
     * @returns {HTMLElement|null}
     */
    const getPreferencesMessage = () => {

        if (!preferencesForm) {
            return null;
        }


        const existingMessage = document.getElementById(
            'preferences-form-message'
        );


        if (existingMessage) {
            return existingMessage;
        }


        const message = document.createElement(
            'div'
        );


        message.id =
            'preferences-form-message';


        message.className =
            'form-message';


        message.setAttribute(
            'role',
            'status'
        );


        message.setAttribute(
            'aria-live',
            'polite'
        );


        message.hidden = true;


        preferencesForm.appendChild(
            message
        );


        return message;
    };


    /**
     * Muestra un mensaje de estado usando las clases
     * preparadas en configuracion-cuenta.css.
     *
     * @param {HTMLElement|null} element
     * @param {string} text
     * @param {'success'|'error'|'info'} type
     */
    const showMessage = (
        element,
        text,
        type
    ) => {

        if (!element) {
            return;
        }


        element.classList.remove(
            'is-success',
            'is-error',
            'is-info'
        );


        element.classList.add(
            `is-${type}`
        );


        element.textContent = text;

        element.hidden = false;
    };


    /**
     * Oculta y limpia un mensaje de estado.
     *
     * @param {HTMLElement|null} element
     */
    const clearMessage = (element) => {

        if (!element) {
            return;
        }


        element.hidden = true;

        element.textContent = '';


        element.classList.remove(
            'is-success',
            'is-error',
            'is-info'
        );
    };


    /* ========================================================
       PREFERENCIAS
    ======================================================== */

    const preferencesMessage =
        getPreferencesMessage();


    /**
     * Carga las preferencias guardadas previamente.
     *
     * Si no existen, conserva los valores
     * definidos originalmente en el HTML.
     */
    const loadPreferences = () => {

        if (
            !priorityAlertsInput
            || !rememberSidebarInput
        ) {
            return;
        }


        const storedValue =
            readLocalStorage(
                PREFERENCES_STORAGE_KEY
            );


        if (!storedValue) {
            return;
        }


        try {

            const preferences =
                JSON.parse(storedValue);


            if (
                typeof preferences.priorityAlerts
                === 'boolean'
            ) {

                priorityAlertsInput.checked =
                    preferences.priorityAlerts;
            }


            if (
                typeof preferences.rememberSidebarState
                === 'boolean'
            ) {

                rememberSidebarInput.checked =
                    preferences.rememberSidebarState;
            }

        } catch (error) {

            console.warn(
                '[DIAGTI] Las preferencias guardadas no tienen un formato válido.',
                error
            );
        }
    };


    if (
        preferencesForm
        && priorityAlertsInput
        && rememberSidebarInput
    ) {

        preferencesForm.addEventListener(
            'submit',

            (event) => {

                event.preventDefault();


                const preferences = {

                    priorityAlerts:
                        priorityAlertsInput.checked,


                    rememberSidebarState:
                        rememberSidebarInput.checked
                };


                const wasSaved =
                    writeLocalStorage(

                        PREFERENCES_STORAGE_KEY,

                        JSON.stringify(
                            preferences
                        )
                    );


                if (
                    !rememberSidebarInput.checked
                ) {

                    removeLocalStorage(
                        SIDEBAR_STORAGE_KEY
                    );
                }


                if (wasSaved) {

                    showMessage(

                        preferencesMessage,

                        'Preferencias guardadas localmente en este navegador.',

                        'success'
                    );

                } else {

                    showMessage(

                        preferencesMessage,

                        'No fue posible guardar las preferencias en este navegador.',

                        'error'
                    );
                }
            }
        );


        preferencesForm.addEventListener(
            'change',

            () => {

                clearMessage(
                    preferencesMessage
                );
            }
        );
    }


    /* ========================================================
       MOSTRAR / OCULTAR CONTRASEÑA
    ======================================================== */

    const resetPasswordVisibility = () => {

        passwordToggleButtons.forEach(
            (button) => {

                const targetId =
                    button.dataset.target;


                if (!targetId) {
                    return;
                }


                const input =
                    document.getElementById(
                        targetId
                    );


                if (
                    !(
                        input
                        instanceof HTMLInputElement
                    )
                ) {
                    return;
                }


                input.type =
                    'password';


                button.textContent =
                    'Mostrar';


                button.setAttribute(
                    'aria-pressed',
                    'false'
                );
            }
        );
    };


    passwordToggleButtons.forEach(
        (button) => {

            button.setAttribute(
                'aria-pressed',
                'false'
            );


            button.addEventListener(
                'click',

                () => {

                    const targetId =
                        button.dataset.target;


                    if (!targetId) {
                        return;
                    }


                    const input =
                        document.getElementById(
                            targetId
                        );


                    if (
                        !(
                            input
                            instanceof HTMLInputElement
                        )
                    ) {
                        return;
                    }


                    const shouldShow =
                        input.type
                        === 'password';


                    input.type =
                        shouldShow
                            ? 'text'
                            : 'password';


                    button.textContent =
                        shouldShow
                            ? 'Ocultar'
                            : 'Mostrar';


                    button.setAttribute(

                        'aria-pressed',

                        String(
                            shouldShow
                        )
                    );


                    input.focus({
                        preventScroll: true
                    });
                }
            );
        }
    );


    /* ========================================================
       VALIDACIÓN FRONTEND DE CONTRASEÑA
    ======================================================== */

    if (
        passwordForm
        && currentPasswordInput
        && newPasswordInput
        && confirmPasswordInput
        && passwordMessage
    ) {

        passwordForm.addEventListener(
            'submit',

            (event) => {

                event.preventDefault();


                clearMessage(
                    passwordMessage
                );


                if (
                    !passwordForm.checkValidity()
                ) {

                    passwordForm.reportValidity();

                    return;
                }


                if (
                    newPasswordInput.value
                    !== confirmPasswordInput.value
                ) {

                    showMessage(

                        passwordMessage,

                        'La nueva contraseña y su confirmación no coinciden.',

                        'error'
                    );


                    confirmPasswordInput.focus();


                    return;
                }


                showMessage(

                    passwordMessage,

                    'Las contraseñas coinciden. La actualización real requiere integración con el servicio de autenticación del sistema.',

                    'info'
                );
            }
        );


        [
            currentPasswordInput,
            newPasswordInput,
            confirmPasswordInput

        ].forEach((input) => {

            input.addEventListener(
                'input',

                () => {

                    clearMessage(
                        passwordMessage
                    );
                }
            );
        });


        passwordForm.addEventListener(
            'reset',

            () => {

                window.requestAnimationFrame(
                    () => {

                        clearMessage(
                            passwordMessage
                        );


                        resetPasswordVisibility();
                    }
                );
            }
        );
    }


    /* ========================================================
       ESTADO INICIAL
    ======================================================== */

    loadPreferences();

    resetPasswordVisibility();
})();