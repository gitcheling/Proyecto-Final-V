<template>
  <div 
    :id="id" 
    :class="['toast', tipo, { autoCierre: autoCierre, cerrando: cerrando }]" 
    @animationend="handleAnimationEnd"
  >
    <div class="contenido">
      <div class="icono" v-html="iconos[tipo]"></div>
      <div class="texto">
        <p class="titulo">{{ titulo }}</p>
        <p class="descripcion">{{ descripcion }}</p>
      </div>
    </div>
    <button class="btn-cerrar" @click="closeToast">
      <div class="icono" v-html="iconoCerrar"></div>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
    id: String, // El ID único del toast (necesario para identificarlo cuando se deba cerrar).
    tipo: { type: String, required: true }, // El tipo de notificación ('exito', 'error', 'info', 'warning'). Esta es la propiedad clave para aplicar el color de fondo y el ícono correcto.
    titulo: { type: String, required: true }, // El encabezado del mensaje.
    descripcion: { type: String, required: true }, // El texto detallado del mensaje.
    autoCierre: { type: Boolean, default: false }, // Booleano que indica si debe mostrar la barra de progreso de cierre automático.
    // Esta prop refleja el estado 'cerrando' del contenedor para iniciar la animación
    cerrando: { type: Boolean, default: false } // Booleano que el padre ("ToastContainer") establece en "true" cuando se inicia el proceso de cierre (ya sea manual o automático), lo que activa la animación CSS. 
});

const emit = defineEmits(['cerrar']);
const isClosing = ref(false);

const iconos = {
    exito: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
};

const iconoCerrar = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`;


const closeToast = () => {

    //  Emitir el evento 'cerrar' inmediatamente al padre 
    emit('cerrar', props.id); 

};


// Maneja el evento 'animationend' para saber cuándo eliminar el elemento
const handleAnimationEnd = (event) => {

    // Solo actuamos si la animación que termina es la de "cierre"
    /* Nota: Lógica: Cuando un toast se va a eliminar, se le añade la clase .cerrando, que a su vez activa la animación CSS con 
    animation-name: cierre; (que lo desliza fuera de la pantalla). Solo cuando esa animación termina, el código dentro del if se ejecuta.*/
    if (event.animationName === 'cierre') {
        // Notifica al contenedor principal para que elimine el toast de la lista
        emit('cerrar', props.id);
    }
};
</script>

<style scoped>
/* Pega TODO tu CSS de .toast y los keyframes aquí */


/* ToastItem.vue (dentro de <style>) */
.toast {
    display: flex !important;
    align-items: flex-start;
    justify-content: space-between;
    
    /* El PADDING va aquí, en el elemento principal */
    padding: 15px; 
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
    min-width: 300px; /* Ya que right/transform funciona, podemos dar un ancho fijo seguro */
    
    /* El resto de estilos de caja y animación */
    transition: all 0.3s ease-in-out;
    font-size: 1rem;
    line-height: 1.4;
    overflow: hidden; /* Necesario para la barra de autocierre */

    animation-name: apertura; 
    animation-duration: 300ms; /* Un tiempo corto */
    animation-timing-function: ease-out;
    animation-fill-mode: both; /* Asegura que el estado final (opacity: 1) se mantenga */
}

.toast.exito { 
    background: #3ab65c !important; /* Valor de --exito */
    color: #ffffff !important; 
}
.toast.error { 
    background: #bf333b !important; /* Valor de --error */
    color: #ffffff !important; 
}
.toast.info { 
    background: #1898c0 !important; /* Valor de --info */
    color: #ffffff !important;
}
.toast.warning { 
    background: #bc8c12 !important; /* Valor de --warning */
    color: #ffffff !important;
}

/* 3. Visibilidad del TEXTO y Eliminación de Margen (Para prevenir colapso) */
.toast .titulo,
.toast .descripcion {
    /* Forzamos la herencia de color, ya que el color está en el .toast.tipo */
    color: inherit !important; 
    
    /* QUITAR MÁRGENES que puedan colapsar o crear espacios en blanco */
    margin: 0 !important; 
    padding: 0 !important;
}

.toast .contenido {
    display: grid;
    grid-template-columns: 30px auto;
    align-items: center;
    gap: 15px;
}

.toast .icono {
    color: rgba(0, 0, 0, 0.4);
}

.toast .titulo {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 9px !important;

    border-bottom: 1px solid rgba(255, 255, 255, 0.5); /* Barra blanca semitransparente */
    padding-bottom: 3px; /* Espacio entre el texto del título y la barra */
}

/* ToastItem.vue (MODIFICAR el selector .btn-cerrar) */
.toast .btn-cerrar {
    background: rgba(0, 0, 0, 0.1); 
    border: none;
    cursor: pointer;
    
    /* 🛑 REGLAS CLAVE DE CENTRADO 🛑 */
    display: flex; 
    align-items: center;      /* Centrado VERTICAL del ícono */
    justify-content: center;  /* Centrado HORIZONTAL del ícono */
    
    padding: 5px;             /* Define el tamaño del recuadro de fondo */
    
    margin-left: 10px;
    border-radius: 4px;
    transition: 0.3s ease all;
}

.toast .btn-cerrar:hover {
    background: rgba(0, 0, 0, 0.3);
}

.toast .btn-cerrar .icono {
    width: 20px;
    height: 20px;
    color: #fff;
    margin-top: -5px;
}


/* Animaciones */
@keyframes apertura {
    from {
        transform: translateY(100px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.toast.cerrando {
    animation-name: cierre;
    animation-duration: 200ms;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
}

@keyframes cierre {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(calc(100% + 40px));
    }
}

.toast.autoCierre::after {
    content: '';

    left: 0; 
    right: 0;

    height: 4px;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    bottom: 0;
    animation-name: autoCierre;
    animation-duration: 5s;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
}

@keyframes autoCierre {
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
}
</style>