/*=========================================
        SUBSANACIONES.JS
        Área Infraestructura - CTIC
=========================================*/

const modal = document.getElementById("modalSubsanacion");
const formulario = document.getElementById("formSubsanacion");
const buscador = document.getElementById("buscar");
const tabla = document.getElementById("tablaSubsanaciones");

/*=========================================
            ABRIR MODAL
=========================================*/

function abrirModal(){

    modal.classList.add("active");

}

/*=========================================
            CERRAR MODAL
=========================================*/

function cerrarModal(){

    modal.classList.remove("active");

}

/*=========================================
    CERRAR AL HACER CLICK FUERA
=========================================*/

window.onclick = function(event){

    if(event.target === modal){

        cerrarModal();

    }

};

/*=========================================
        GUARDAR SUBSANACIÓN
=========================================*/

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        let comentario = document.getElementById("comentario").value.trim();

        let archivo = document.getElementById("archivo").value;

        if(comentario === ""){

            alert("Debe ingresar un comentario.");

            return;

        }

        if(archivo === ""){

            alert("Debe seleccionar un archivo.");

            return;

        }

        alert("Subsanación registrada correctamente.");

        formulario.reset();

        cerrarModal();

    });

}

/*=========================================
            BUSCADOR
=========================================*/

if(buscador){

    buscador.addEventListener("keyup", buscarObservacion);

}

function buscarObservacion(){

    let filtro = buscador.value.toLowerCase();

    let filas = tabla.getElementsByTagName("tr");

    for(let i=0; i<filas.length; i++){

        let texto = filas[i].textContent.toLowerCase();

        if(texto.indexOf(filtro)>-1){

            filas[i].style.display="";

        }else{

            filas[i].style.display="none";

        }

    }

}

/*=========================================
            VER DETALLE
=========================================*/

function verDetalle(){

    alert("Mostrando detalle de la subsanación.");

}

/*=========================================
            MENSAJE
=========================================*/

window.addEventListener("load",function(){

    console.log("Módulo Subsanaciones cargado correctamente.");

});