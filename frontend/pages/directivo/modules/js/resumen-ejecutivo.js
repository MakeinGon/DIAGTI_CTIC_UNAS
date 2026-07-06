'use strict';

/**
 * DIAGTI CTIC UNAS
 * Módulo Directivo · Resumen Ejecutivo
 *
 * Responsabilidad de este archivo:
 * - Inicializar las barras que usan el atributo data-progress.
 * - Animarlas cuando entren en el área visible.
 * - Respetar la preferencia de reducción de movimiento.
 *
 * No contiene lógica del sidebar ni llamadas a backend.
 */

(() => {
    const PROGRESS_SELECTOR = '[data-progress]';

    const progressElements = Array.from(
        document.querySelectorAll(PROGRESS_SELECTOR)
    );

    if (progressElements.length === 0) {
        return;
    }


    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;


    /**
     * Convierte el valor de data-progress
     * a un porcentaje válido.
     *
     * Los valores se limitan al rango de 0 a 100.
     *
     * @param {HTMLElement} element
     * @returns {number}
     */
    const getProgressValue = (element) => {
        const rawValue = Number.parseFloat(
            element.dataset.progress ?? '0'
        );


        if (!Number.isFinite(rawValue)) {
            return 0;
        }


        return Math.min(
            100,
            Math.max(0, rawValue)
        );
    };


    /**
     * Aplica el porcentaje final a una barra.
     *
     * @param {HTMLElement} element
     */
    const showProgress = (element) => {
        const progressValue = getProgressValue(element);

        element.style.width = `${progressValue}%`;
    };


    /**
     * Muestra inmediatamente todas las barras.
     *
     * Se utiliza cuando:
     * - el usuario prefiere movimiento reducido;
     * - IntersectionObserver no está disponible.
     */
    const showAllProgress = () => {
        progressElements.forEach(showProgress);
    };


    if (
        prefersReducedMotion
        || !('IntersectionObserver' in window)
    ) {
        showAllProgress();

        return;
    }


    /*
     * El ancho inicial en 0 permite que la transición
     * definida en resumen-ejecutivo.css se ejecute
     * cuando la barra entre en pantalla.
     */

    progressElements.forEach((element) => {
        element.style.width = '0%';
    });


    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }


                const element = entry.target;


                window.requestAnimationFrame(() => {
                    showProgress(element);
                });


                observer.unobserve(element);
            });
        },

        {
            threshold: 0.2
        }
    );


    progressElements.forEach((element) => {
        observer.observe(element);
    });
})();