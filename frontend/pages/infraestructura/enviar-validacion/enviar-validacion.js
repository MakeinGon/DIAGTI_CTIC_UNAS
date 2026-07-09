/*=========================================
    ENVIAR-VALIDACION.JS
    Área de Infraestructura - CTIC
==========================================*/

const formulario = document.getElementById("formValidacion");
const modal = document.getElementById("modalConfirmacion");

/*=========================================
        ENVIAR FORMULARIO
==========================================*/

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        let sistema = document.getElementById("sistema").value;

        if(sistema===""){

            alert("Seleccione un sistema.");

            return;

        }

        let evidencias = document.querySelectorAll(".lista-evidencias input[type='checkbox']:checked");

        if(evidencias.length===0){

            alert("Seleccione al menos una evidencia.");

            return;

        }

        abrirModal();

    });

}

/*=========================================
        ABRIR MODAL
==========================================*/

function abrirModal(){

    modal.classList.add("active");

}

/*=========================================
        CERRAR MODAL
==========================================*/

function cerrarModal(){

    modal.classList.remove("active");

}

/*=========================================
    CERRAR AL HACER CLICK FUERA
==========================================*/

window.onclick=function(e){

    if(e.target===modal){

        cerrarModal();

    }

};

/*=========================================
        CONFIRMAR ENVÍO
==========================================*/

function confirmarEnvio(){

    cerrarModal();

    alert("La validación fue enviada correctamente.");

    formulario.reset();

}

/*=========================================
        LIMPIAR FORMULARIO
==========================================*/

function limpiarFormulario(){

    formulario.reset();

}

/*=========================================
    CONTADOR DE EVIDENCIAS
==========================================*/

const checks = document.querySelectorAll(".lista-evidencias input");

checks.forEach(function(item){

    item.addEventListener("change", contarSeleccionadas);

});

function contarSeleccionadas(){

    let total = document.querySelectorAll(".lista-evidencias input:checked").length;

    console.log("Evidencias seleccionadas: " + total);

}

/*=========================================
        PRIORIDAD
==========================================*/

const prioridad = document.getElementById("prioridad");

if(prioridad){

    prioridad.addEventListener("change", function(){

        console.log("Prioridad: " + prioridad.value);

    });

}

/*=========================================
        MENSAJE
==========================================*/

window.addEventListener("load", function(){

    console.log("Módulo Enviar Validación cargado correctamente.");

});