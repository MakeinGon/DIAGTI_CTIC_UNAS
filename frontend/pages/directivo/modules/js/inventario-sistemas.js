'use strict';

/**
 * DIAGTI CTIC UNAS
 * Módulo Directivo · Inventario de Sistemas
 *
 * Responsabilidades:
 * - Buscar sistemas por texto visible de la fila.
 * - Aplicar filtros por área, criticidad, riesgo,
 *   obsolescencia y estado.
 * - Actualizar el contador de resultados visibles.
 * - Mostrar el estado vacío cuando no existan coincidencias.
 * - Limpiar filtros y restaurar el inventario completo.
 *
 * No contiene lógica de sidebar, llamadas a backend ni una
 * acción ficticia para los botones "Ver detalle".
 */

(() => {
    const form = document.getElementById(
        'inventory-filter-form'
    );

    const table = document.getElementById(
        'inventory-table'
    );

    const tableBody = document.getElementById(
        'inventory-table-body'
    );

    const resultCount = document.getElementById(
        'visible-results-count'
    );

    const emptyState = document.getElementById(
        'inventory-empty-state'
    );


    if (
        !form
        || !table
        || !tableBody
        || !resultCount
        || !emptyState
    ) {
        return;
    }


    const tableContainer = table.closest(
        '.table-responsive'
    );


    const rows = Array.from(
        tableBody.querySelectorAll('tr')
    );


    const searchInput = document.getElementById(
        'filter-search'
    );

    const areaFilter = document.getElementById(
        'filter-area'
    );

    const criticalityFilter = document.getElementById(
        'filter-criticality'
    );

    const riskFilter = document.getElementById(
        'filter-risk'
    );

    const obsolescenceFilter = document.getElementById(
        'filter-obsolescence'
    );

    const statusFilter = document.getElementById(
        'filter-status'
    );


    if (
        !searchInput
        || !areaFilter
        || !criticalityFilter
        || !riskFilter
        || !obsolescenceFilter
        || !statusFilter
    ) {
        return;
    }


    /**
     * Normaliza texto para búsquedas tolerantes
     * a mayúsculas y signos diacríticos.
     *
     * @param {string} value
     * @returns {string}
     */
    const normalizeText = (value) => {
        return value
            .trim()
            .toLocaleLowerCase('es-PE')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };


    /**
     * Obtiene los criterios actuales del formulario.
     *
     * @returns {{
     *   search: string,
     *   area: string,
     *   criticality: string,
     *   risk: string,
     *   obsolescence: string,
     *   status: string
     * }}
     */
    const getCriteria = () => ({
        search: normalizeText(searchInput.value),

        area: areaFilter.value,

        criticality:
            criticalityFilter.value,

        risk:
            riskFilter.value,

        obsolescence:
            obsolescenceFilter.value,

        status:
            statusFilter.value
    });


    /**
     * Comprueba si una fila cumple
     * todos los criterios activos.
     *
     * @param {HTMLTableRowElement} row
     * @param {ReturnType<typeof getCriteria>} criteria
     * @returns {boolean}
     */
    const rowMatchesCriteria = (
        row,
        criteria
    ) => {

        const searchableText = normalizeText(
            row.textContent ?? ''
        );


        const matchesSearch = (
            criteria.search === ''
            || searchableText.includes(
                criteria.search
            )
        );


        const matchesArea = (
            criteria.area === ''
            || row.dataset.area
                === criteria.area
        );


        const matchesCriticality = (
            criteria.criticality === ''
            || row.dataset.criticality
                === criteria.criticality
        );


        const matchesRisk = (
            criteria.risk === ''
            || row.dataset.risk
                === criteria.risk
        );


        const matchesObsolescence = (
            criteria.obsolescence === ''
            || row.dataset.obsolescence
                === criteria.obsolescence
        );


        const matchesStatus = (
            criteria.status === ''
            || row.dataset.status
                === criteria.status
        );


        return (
            matchesSearch
            && matchesArea
            && matchesCriticality
            && matchesRisk
            && matchesObsolescence
            && matchesStatus
        );
    };


    /**
     * Actualiza el contador y alterna
     * entre tabla y estado vacío.
     *
     * @param {number} visibleCount
     */
    const updateResultsState = (
        visibleCount
    ) => {

        resultCount.textContent = String(
            visibleCount
        );


        const hasResults =
            visibleCount > 0;


        if (tableContainer) {
            tableContainer.hidden =
                !hasResults;
        }


        emptyState.hidden =
            hasResults;
    };


    /**
     * Aplica búsqueda y filtros
     * al inventario.
     */
    const applyFilters = () => {

        const criteria = getCriteria();

        let visibleCount = 0;


        rows.forEach((row) => {

            const isVisible =
                rowMatchesCriteria(
                    row,
                    criteria
                );


            row.classList.toggle(
                'is-filtered-out',
                !isVisible
            );


            row.classList.toggle(
                'is-highlighted',

                isVisible
                && criteria.search !== ''
            );


            if (isVisible) {
                visibleCount += 1;
            }
        });


        updateResultsState(
            visibleCount
        );
    };


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
             * El evento reset se dispara antes de que
             * el navegador restablezca los valores.
             *
             * La actualización se difiere al siguiente
             * frame para leer los campos restaurados.
             */

            window.requestAnimationFrame(
                () => {

                    applyFilters();

                    searchInput.focus();
                }
            );
        }
    );


    /*
     * El buscador responde mientras se escribe.
     *
     * Los filtros de selección también pueden
     * aplicarse mediante el botón Aplicar filtros.
     */

    searchInput.addEventListener(
        'input',
        applyFilters
    );


    /*
     * Estado inicial coherente con
     * las filas existentes.
     */

    applyFilters();
})();