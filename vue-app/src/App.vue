<script setup>
import { RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue' 
import ToastContainer from './components/ToastContainer.vue';

</script>

<template>
  <div class="d-flex" id="wrapper">
    
    <!-- 1. Sidebar: Menú lateral (Plegable/Offcanvas) -->
    <Sidebar />

    <!-- 2. Área de Contenido Principal (ocupa el resto del ancho) -->
    <div id="content-area" class="d-flex flex-column">
      
      <!-- Navbar: Barra superior (todo el contenido de la navegación está aquí) -->
      <Navbar />

      <!-- Contenedor de Vistas (donde se renderiza el contenido de las rutas) -->
      <main class="container-fluid p-4 flex-grow-1">
        <RouterView />
     
      </main>
      
    </div>
  </div>

  <Teleport to="#teleported-toasts">
        <ToastContainer />
    </Teleport>
</template>

<style scoped>
/* Estilos que definen la estructura principal del layout */
#wrapper {
  /* Asegura que el contenedor principal ocupe toda la altura disponible */
  min-height: 100vh;
}

#content-area {
  /* Permite que el área de contenido ocupe el resto del ancho y crezca verticalmente */
  flex-grow: 1;
  width: 100%;
}

/* * Aplica un margen izquierdo al contenido principal.
 * Este margen compensa el ancho de la Sidebar fija (80px) a partir del 
 * breakpoint 'md' (768px), que es cuando la Sidebar de escritorio se hace visible.
 */
@media (min-width: 768px) {
    #content-area {
        margin-left: 80px; 
    }
}

/* Nota: Los estilos de color y sombra de la barra superior están en Navbar.vue */
</style>