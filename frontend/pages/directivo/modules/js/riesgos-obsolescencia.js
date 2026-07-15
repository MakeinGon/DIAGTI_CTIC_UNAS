'use strict';

/**
 * DIAGTI CTIC UNAS
 * Módulo Directivo · Riesgos y Obsolescencia
 *
 * Responsabilidad de este archivo:
 * - Mejorar la accesibilidad de la navegación por anclas.
 * - Llevar el foco a la sección indicada en la URL.
 *
 * La página no requiere filtros, datos dinámicos ni llamadas a backend.
 * La navegación y el desplazamiento siguen siendo nativos del navegador.
 */

(() => {
    const SECTION_IDS = new Set([
        'resumen-global',
        'analisis-riesgos',
        'analisis-obsolescencia',
        'priorizacion-combinada'
    ]);


    /**
     * Obtiene la sección válida indicada por el hash actual.
     *
     * @returns {HTMLElement|null}
     */
    const getHashTarget = () => {
        if (!window.location.hash) {
            return null;
        }


        let targetId;


        try {
            targetId = decodeURIComponent(
                window.location.hash.slice(1)
            );
        } catch {
            return null;
        }


        if (!SECTION_IDS.has(targetId)) {
            return null;
        }


        const target = document.getElementById(targetId);


        return target instanceof HTMLElement
            ? target
            : null;
    };


    /**
     * Mueve el foco a la sección indicada por el hash.
     * preventScroll evita interferir con el desplazamiento
     * nativo que ya realiza el navegador al navegar por anclas.
     */
    const focusCurrentSection = () => {
        const target = getHashTarget();


        if (!target) {
            return;
        }


        const hadTabIndex = target.hasAttribute('tabindex');


        if (!hadTabIndex) {
            target.setAttribute('tabindex', '-1');
        }


        window.requestAnimationFrame(() => {
            target.focus({
                preventScroll: true
            });
        });


        if (!hadTabIndex) {
            target.addEventListener(
                'blur',
                () => {
                    target.removeAttribute('tabindex');
                },
                {
                    once: true
                }
            );
        }
    };


    window.addEventListener(
        'hashchange',
        focusCurrentSection
    );


    focusCurrentSection();
})();