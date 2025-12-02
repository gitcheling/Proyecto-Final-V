<template>

    <!-- Éste archivo se encarga de:
     
        -Renderizar el Marco: Provee el elemento "<div>" que actúa como el área física en la pantalla donde aparecerán todas las notificaciones 
        (típicamente en una esquina fija, como abajo a la derecha).

        -Gestión del v-for: Utiliza la directiva "v-for" para iterar sobre el array reactivo toasts. Por cada objeto en ese array, renderiza
        un componente hijo "<ToastItem>", que es la notificación individual con su título, descripción y botón de cerrar.
    
        -Mantiene el Estado Reactivo: Contiene el array "toasts = ref([])" en memoria. Este array es el estado centralizado de todas las notificaciones activas.

        -Agregar: Cuando se llama a addToast, un nuevo objeto se agrega al array. Vue, al detectar el cambio en la lista reactiva, inserta 
        el nuevo "<ToastItem>" en el DOM.

        -Quitar: Cuando se llama a removeToast, el objeto correspondiente se elimina del array. Vue lo retira inmediatamente del DOM.

        -Maneja Temporizadores: Contiene toda la lógica de setTimeout para el autocierre de las notificaciones, asegurando que se cierren 
        automáticamente después de 5 segundos (y que la animación de cierre se ejecute primero).

        -Provee la API Global (provide): Es el único componente que tiene la función addToast y la pone a disposición del resto de la aplicación 
        usando provide('addToast', addToast). Esto permite que cualquier componente (a través del hook "useToast" y "inject") pueda 
        solicitar una notificación sin importar dónde esté en el árbol de componentes.
    -->
  <div id="contenedor-toast" class="contenedor-toast">
    <ToastItem 
      v-for="toast in toasts" 
      :key="toast.id"
      :id="toast.id"
      :tipo="toast.tipo"
      :titulo="toast.titulo"
      :descripcion="toast.descripcion"
      :autoCierre="toast.autoCierre"
      :cerrando="toast.cerrando" @cerrar="removeToast"
    />
  </div>
</template>

<script setup>
import { inject } from 'vue';
import ToastItem from './ToastItem.vue'; 
// ----------------------------------------------------------------------
// CONSUMIENDO DEL PROVEEDOR GLOBAL ("setupToastProvider" en main.js)
// ----------------------------------------------------------------------

// 1. Inyectamos la lista reactiva de toasts (solo lectura)
// Asume que la clave usada en setupToastProvider es 'toasts'.
const toasts = inject('toasts');

// 2. Inyectamos la función para eliminar un toast.
// Asume que la clave usada en setupToastProvider es 'removeToast'.
const removeToast = inject('removeToast');

// ----------------------------------------------------------------------

// Bloque de seguridad:
// Aunque ya usamos la inyección a nivel de app en main.js, este chequeo es bueno:
if (!toasts || !removeToast) {
    console.error("ToastProvider: Las dependencias 'toasts' o 'removeToast' no fueron inyectadas correctamente. Revise main.js.");
}

</script>

<style>
</style>