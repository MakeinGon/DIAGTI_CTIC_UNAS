/*=====================================
    EVIDENCIAS.JS
    Área de Infraestructura - CTIC
======================================*/

const modal = document.getElementById("modalEvidencia");
const btnNueva = document.getElementById("btnNueva");
const formulario = document.getElementById("formEvidencia");
const buscador = document.getElementById("buscar");
const tabla = document.getElementById("tablaEvidencias");

/*=========================
        MODAL
==========================*/

if(btnNueva){

    btnNueva.addEventListener("click", abrirModal);

}

function abrirModal(){

    modal.classList.add("active");

}

function cerrarModal(){

    modal.classList.remove("active");

}

/*=========================
    CERRAR AL HACER CLICK FUERA
==========================*/

window.onclick = function(event){

    if(event.target === modal){

        cerrarModal();

    }

};

/*=========================
    GUARDAR EVIDENCIA
==========================*/

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        alert("La evidencia fue registrada correctamente.");

        formulario.reset();

        cerrarModal();

    });

}

/*=========================
        BUSCADOR
==========================*/

if(buscador){

    buscador.addEventListener("keyup", buscarEvidencia);

}

function buscarEvidencia(){

    let filtro = buscador.value.toLowerCase();

    let filas = tabla.getElementsByTagName("tr");

    for(let i=0;i<filas.length;i++){

        let texto = filas[i].textContent.toLowerCase();

        if(texto.indexOf(filtro) > -1){

            filas[i].style.display="";

        }else{

            filas[i].style.display="none";

        }

    }

}

/*=========================
    DESCARGAR ARCHIVO
==========================*/

function descargarArchivo(nombre){

    alert("Descargando: " + nombre);

}

/*=========================
    VER ARCHIVO
==========================*/

function verArchivo(nombre){

    alert("Visualizando: " + nombre);

}

/*=========================
        ELIMINAR
==========================*/

function eliminarEvidencia(boton){

    let confirmar = confirm("¿Desea eliminar esta evidencia?");

    if(confirmar){

        boton.parentElement.parentElement.remove();

        alert("Evidencia eliminada correctamente.");

    }

}

/*=========================
    FILTRO POR ESTADO
==========================*/

const estado = document.getElementById("estado");

if(estado){

    estado.addEventListener("change", filtrarEstado);

}

function filtrarEstado(){

    let valor = estado.value.toLowerCase();

    let filas = tabla.getElementsByTagName("tr");

    for(let i=0;i<filas.length;i++){

        let texto = filas[i].textContent.toLowerCase();

        if(valor==="" || texto.includes(valor)){

            filas[i].style.display="";

        }else{

            filas[i].style.display="none";

        }

    }

}

/*=========================
    MENSAJE DE BIENVENIDA
==========================*/

window.addEventListener("load",function(){

    console.log("Módulo Evidencias cargado correctamente.");

});