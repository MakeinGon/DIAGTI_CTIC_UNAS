/*=========================================
        HISTORIAL.JS
        Área de Infraestructura - CTIC
=========================================*/

const modal = document.getElementById("modalHistorial");
const buscador = document.getElementById("buscar");
const tabla = document.getElementById("tablaHistorial");

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
            VER DETALLE
=========================================*/

function verDetalle(){

    abrirModal();

}

/*=========================================
        CERRAR AL HACER CLICK FUERA
=========================================*/

window.onclick=function(event){

    if(event.target===modal){

        cerrarModal();

    }

};

/*=========================================
            BUSCADOR
=========================================*/

if(buscador){

    buscador.addEventListener("keyup", buscarHistorial);

}

function buscarHistorial(){

    let filtro=buscador.value.toLowerCase();

    let filas=tabla.getElementsByTagName("tr");

    for(let i=0;i<filas.length;i++){

        let texto=filas[i].textContent.toLowerCase();

        if(texto.indexOf(filtro)>-1){

            filas[i].style.display="";

        }else{

            filas[i].style.display="none";

        }

    }

}

/*=========================================
        FILTRO POR ESTADO
=========================================*/

function filtrarEstado(estado){

    let filas=tabla.getElementsByTagName("tr");

    for(let i=0;i<filas.length;i++){

        let texto=filas[i].textContent.toLowerCase();

        if(estado===""){

            filas[i].style.display="";

        }

        else if(texto.includes(estado.toLowerCase())){

            filas[i].style.display="";

        }

        else{

            filas[i].style.display="none";

        }

    }

}

/*=========================================
        EXPORTAR HISTORIAL
=========================================*/

function exportarHistorial(){

    alert("Función para exportar historial en desarrollo.");

}

/*=========================================
        IMPRIMIR
=========================================*/

function imprimirHistorial(){

    window.print();

}

/*=========================================
        REFRESCAR TABLA
=========================================*/

function actualizarTabla(){

    console.log("Tabla actualizada.");

}

/*=========================================
        MENSAJE
=========================================*/

window.addEventListener("load",function(){

    console.log("Módulo Historial cargado correctamente.");

});