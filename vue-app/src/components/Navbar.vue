<script setup>
// Este componente no necesita props ni lógica por ahora, pero está listo para crecer.
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light header-custom sticky-top">
    <!-- El contenedor ya no necesita 'px-4' para pegarse más a la izquierda en móvil -->
    <div class="container-fluid">
      
      <!-- BOTÓN DE MENÚ (Offcanvas): Usado en pantallas pequeñas para abrir el Sidebar. -->
      <button class="btn d-md-none me-2 p-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" style="color: #4B0082;">
        <i class="bi bi-list fs-4"></i>
      </button>
      
      <a class="navbar-brand morado-oscuro fw-bold fs-4" href="#"></a>

      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item me-3">
            <a class="nav-link text-secondary" href="#"><i class="bi bi-bell fs-5"></i></a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle text-secondary" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="bi bi-person-circle fs-5 me-1"></i> Usuario
            </a>
            <div class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="#">Perfil</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Cerrar Sesión</a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>


<style scoped>
.header-custom {
  /* Usa un color de fondo claro para la barra de navegación superior */
  background-color: #f8f9fa; 
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  /* Este z-index debe ser menor que el de la sidebar para que esté por debajo*/
  z-index: 1010;
}

.morado-oscuro {
  color: #4B0082 !important; /* Color de tu sidebar para la marca */
}

/* Esto asegura que la barra de navegación se posicione y dimensione correctamente 
   a partir del breakpoint donde la Sidebar de escritorio (80px) es visible. */
@media (min-width: 768px) {
    .header-custom {
        /*
         * Cuando el Navbar se vuelve 'sticky-top', se comporta como 'fixed' y 
         * puede ignorar el margen del contenedor padre (#content-area), 
         * causando el solapamiento.
         * * Solución: Forzamos la posición y el ancho para respetar la Sidebar.
         */
        left: 80px; /* Inicia después de la Sidebar fija (80px) */
        width: calc(100vw - 80px); /* Ocupa el 100% del viewport menos el ancho de la Sidebar */
    }
}
</style>