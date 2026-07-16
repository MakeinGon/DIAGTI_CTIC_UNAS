'use strict';

/**
 * DIAGTI CTIC UNAS
 * Módulo Directivo · Plan de Modernización
 *
 * Responsabilidad de este archivo:
 * - Mejorar la accesibilidad de la navegación por anclas.
 * - Llevar el foco programático a la sección indicada en la URL.
 *
 * La página es principalmente informativa y no requiere filtros,
 * datos dinámicos, llamadas a backend ni interacciones artificiales.
 */

(() => {
    const SECTION_IDS = new Set([
        'resumen-plan',
        'estrategias-modernizacion',
        'matriz-decision',
        'plan-por-fases',
        'principios-ejecucion'
    ]);


    /**
     * Obtiene una sección válida a partir del hash actual.
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
     *
     * preventScroll evita interferir con el desplazamiento nativo
     * del navegador, que ya posiciona la página sobre el ancla.
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