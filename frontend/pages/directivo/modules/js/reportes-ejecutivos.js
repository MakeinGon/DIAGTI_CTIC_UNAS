'use strict';

/**
 * DIAGTI CTIC UNAS
 * Módulo Directivo · Reportes Ejecutivos
 *
 * Responsabilidades:
 * - Seleccionar uno o todos los reportes.
 * - Aplicar filtros únicamente a secciones con datos compatibles.
 * - Filtrar filas mediante los atributos data-* existentes en el HTML.
 * - Mostrar u ocultar secciones según los resultados.
 * - Mantener actualizado el total del reporte por área cuando se filtra.
 * - Mostrar el estado vacío cuando no existan coincidencias.
 * - Abrir la impresión del reporte seleccionado para permitir guardarlo
 *   como PDF mediante la funcionalidad nativa del navegador.
 *
 * No contiene llamadas a backend, APIs ni descargas simuladas.
 */

(() => {
    const form = document.getElementById('reports-filter-form');

    const emptyState = document.getElementById(
        'reports-empty-state'
    );

    const reportTypeFilter = document.getElementById(
        'filter-report-type'
    );

    const areaFilter = document.getElementById(
        'filter-report-area'
    );

    const criticalityFilter = document.getElementById(
        'filter-report-criticality'
    );

    const riskFilter = document.getElementById(
        'filter-report-risk'
    );

    const reportSections = Array.from(
        document.querySelectorAll(
            '[data-report-section]'
        )
    );

    const exportButtons = Array.from(
        document.querySelectorAll(
            '[data-action="export-pdf"][data-report-id]'
        )
    );


    if (
        !form
        || !emptyState
        || !reportTypeFilter
        || !areaFilter
        || !criticalityFilter
        || !riskFilter
        || reportSections.length === 0
    ) {
        return;
    }


    const FILTER_DEFINITIONS = [
        {
            key: 'area',
            datasetKey: 'area',
            control: areaFilter
        },
        {
            key: 'criticality',
            datasetKey: 'criticality',
            control: criticalityFilter
        },
        {
            key: 'risk',
            datasetKey: 'risk',
            control: riskFilter
        }
    ];


    /**
     * Devuelve las filas del cuerpo
     * de una sección de reporte.
     *
     * @param {HTMLElement} section
     * @returns {HTMLTableRowElement[]}
     */
    const getSectionRows = (section) => {
        return Array.from(
            section.querySelectorAll('tbody tr')
        );
    };


    /**
     * Obtiene únicamente los filtros
     * de filas que tienen un valor activo.
     *
     * @returns {Array}
     */
    const getActiveRowFilters = () => {
        return FILTER_DEFINITIONS
            .map((definition) => ({
                key: definition.key,

                datasetKey:
                    definition.datasetKey,

                value:
                    definition.control.value
            }))

            .filter(
                (criterion) =>
                    criterion.value !== ''
            );
    };


    /**
     * Comprueba que una sección tenga los metadatos
     * necesarios para evaluar todos los filtros activos.
     *
     * Ejemplos del HTML actual:
     *
     * Inventario:
     * - área
     * - criticidad
     *
     * Riesgos:
     * - nivel de riesgo
     *
     * Área usuaria:
     * - área
     *
     * Una sección sin el dato necesario se oculta.
     * No se inventan relaciones entre datos.
     *
     * @param {HTMLTableRowElement[]} rows
     * @param {Array} activeFilters
     * @returns {boolean}
     */
    const sectionSupportsFilters = (
        rows,
        activeFilters
    ) => {

        return activeFilters.every(
            (criterion) => {

                return rows.some((row) => {

                    return Object.prototype
                        .hasOwnProperty
                        .call(
                            row.dataset,
                            criterion.datasetKey
                        );
                });
            }
        );
    };


    /**
     * Comprueba si una fila cumple
     * todos los filtros activos.
     *
     * @param {HTMLTableRowElement} row
     * @param {Array} activeFilters
     * @returns {boolean}
     */
    const rowMatchesFilters = (
        row,
        activeFilters
    ) => {

        return activeFilters.every(
            (criterion) => {

                return (
                    row.dataset[
                        criterion.datasetKey
                    ]
                    === criterion.value
                );
            }
        );
    };


    /**
     * Restaura la visibilidad
     * de todas las filas.
     *
     * @param {HTMLTableRowElement[]} rows
     */
    const showAllRows = (rows) => {

        rows.forEach((row) => {
            row.hidden = false;
        });
    };


    /**
     * Recalcula el pie del Reporte por Área
     * usando únicamente las filas visibles.
     *
     * Los valores se calculan a partir
     * de los datos ya presentes en la tabla.
     *
     * @param {HTMLElement} section
     */
    const updateAreaReportTotals = (
        section
    ) => {

        if (
            section.dataset.reportSection
            !== 'area'
        ) {
            return;
        }


        const visibleRows =
            getSectionRows(section)
                .filter(
                    (row) => !row.hidden
                );


        const totals = visibleRows.reduce(

            (accumulator, row) => {

                const cells = row.cells;


                accumulator.systems += Number(
                    cells[1]?.textContent.trim()
                    ?? 0
                );


                accumulator.critical += Number(
                    cells[2]?.textContent.trim()
                    ?? 0
                );


                accumulator.pending += Number(
                    cells[3]?.textContent.trim()
                    ?? 0
                );


                return accumulator;
            },

            {
                systems: 0,
                critical: 0,
                pending: 0
            }
        );


        const footerCells =
            section.querySelectorAll(
                'tfoot td'
            );


        if (footerCells.length < 3) {
            return;
        }


        footerCells[0].textContent =
            String(totals.systems);

        footerCells[1].textContent =
            String(totals.critical);

        footerCells[2].textContent =
            String(totals.pending);
    };


    /**
     * Aplica:
     *
     * 1. Tipo de reporte.
     * 2. Filtros compatibles.
     * 3. Visibilidad de filas.
     * 4. Visibilidad de secciones.
     * 5. Estado vacío.
     */
    const applyFilters = () => {

        const selectedReportType =
            reportTypeFilter.value;


        const activeRowFilters =
            getActiveRowFilters();


        let visibleSectionCount = 0;


        reportSections.forEach(
            (section) => {

                const reportType =
                    section.dataset
                        .reportSection
                    ?? '';


                const rows =
                    getSectionRows(section);


                const matchesReportType = (
                    selectedReportType === ''
                    || reportType
                        === selectedReportType
                );


                /*
                 * La sección no corresponde
                 * al tipo seleccionado.
                 */

                if (!matchesReportType) {

                    showAllRows(rows);

                    section.hidden = true;

                    updateAreaReportTotals(
                        section
                    );

                    return;
                }


                /*
                 * La sección no dispone de
                 * datos para evaluar los filtros.
                 */

                const supportsActiveFilters =
                    sectionSupportsFilters(
                        rows,
                        activeRowFilters
                    );


                if (!supportsActiveFilters) {

                    showAllRows(rows);

                    section.hidden = true;

                    updateAreaReportTotals(
                        section
                    );

                    return;
                }


                let visibleRowCount = 0;


                rows.forEach((row) => {

                    const isVisible =
                        rowMatchesFilters(
                            row,
                            activeRowFilters
                        );


                    row.hidden = !isVisible;


                    if (isVisible) {
                        visibleRowCount += 1;
                    }
                });


                const hasVisibleRows =
                    visibleRowCount > 0;


                section.hidden =
                    !hasVisibleRows;


                if (hasVisibleRows) {
                    visibleSectionCount += 1;
                }


                updateAreaReportTotals(
                    section
                );
            }
        );


        emptyState.hidden =
            visibleSectionCount > 0;
    };


    /**
     * Imprime únicamente el reporte indicado.
     *
     * El navegador abre su diálogo nativo
     * de impresión.
     *
     * Desde ese diálogo el usuario puede
     * seleccionar "Guardar como PDF".
     *
     * @param {string} reportId
     */
    const printReport = (reportId) => {

        const targetSection =
            document.getElementById(
                reportId
            );


        if (!targetSection) {
            return;
        }


        /*
         * Guardamos el estado de visibilidad
         * actual para restaurarlo después.
         */

        const visibilitySnapshot =
            reportSections.map(
                (section) => ({
                    section,
                    hidden: section.hidden
                })
            );


        /*
         * Durante la impresión solamente
         * queda visible el reporte solicitado.
         */

        reportSections.forEach(
            (section) => {

                section.hidden =
                    section !== targetSection;
            }
        );


        try {

            window.print();

        } finally {

            /*
             * Restauramos los filtros
             * y visibilidad anteriores.
             */

            visibilitySnapshot.forEach(
                ({
                    section,
                    hidden
                }) => {

                    section.hidden =
                        hidden;
                }
            );
        }
    };


    /* ========================================================
       EVENTOS
    ======================================================== */


    form.addEventListener(
        'submit',

        (event) => {

            event.preventDefault();

            applyFilters();
        }
    );


    form.addEventListener(
        'reset',

        () => {

            /*
             * reset se ejecuta antes de que el navegador
             * termine de restaurar los controles.
             */

            window.requestAnimationFrame(
                () => {
                    applyFilters();
                }
            );
        }
    );


    exportButtons.forEach(
        (button) => {

            button.addEventListener(
                'click',

                () => {

                    const reportId =
                        button.dataset.reportId;


                    if (!reportId) {
                        return;
                    }


                    printReport(
                        reportId
                    );
                }
            );
        }
    );


    /*
     * Estado inicial coherente
     * con el HTML disponible.
     */

    applyFilters();
})();