<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

// Importamos el router y la ruta para la navegación y el estado activo
const router = useRouter()
const route = useRoute() 

// Lista centralizada de Módulos Principales
const menuItems = ref([
  //{ to: '/', icon: 'bi-house-door', text: 'Dashboard' },
  { to: '/Entidades', icon: 'bi-building', text: 'Entidades' },
  { to: '/Estudiantes', icon: 'bi-book', text: 'Estudiantes' },
  { to: '/Docentes', icon: 'bi-mortarboard', text: 'Docentes' },
  { to: '/Proveedores', icon: 'bi-truck', text: 'Proveedores' },
  { to: '/CuentasBancariasAprobadas', icon: 'bi-bank', text: 'Cuentas Bancarias' },
  { to: '/CuentasBancariasPorAprobar', icon: 'bi-question-square', text: 'Cuentas Bancarias Por Aprobar' },
  { to: '/PlanCuentas', icon: 'bi-list-task', text: 'Plan de Cuentas' },
])

// Lista centralizada de Herramientas
const toolsItems = ref([
  { href: '#', icon: 'bi-file-earmark-bar-graph', text: 'Reportes' },
  { href: '#', icon: 'bi-gear', text: 'Ajustes' },
])

/**
 * Función para manejar la navegación en el menú móvil.
 * Usa router.push() para garantizar la navegación y permite que 
 * data-bs-dismiss se encargue del cierre del offcanvas.
 * @param {string} toPath - La ruta a navegar.
 */
const navigateMobile = (toPath) => {
    // 1. Forzar la navegación a la nueva ruta usando Vue Router
    router.push(toPath);

    // 2. El atributo data-bs-dismiss se encargará de cerrar el menú automáticamente.
};
</script>

<template>
  <!-- ---------------------------------------------------- -->
  <!-- 1. Contenedor de ESCRITORIO (d-lg-block) - Plegable -->
  <!-- ---------------------------------------------------- -->
  <div class="d-none d-md-block sidebar-container" id="sidebar-wrapper">
    <div class="sidebar-header">
      <!-- Usamos una imagen circular placeholder -->
      <img src="https://placehold.co/40x40/E0B0FF/4B0082?text=Logo" alt="Logo" class="header-logo">
      <span>Mi Sistema</span>
    </div>
    
    <nav class="sidebar-nav">
      <!-- MÓDULOS PRINCIPALES (ESCRITORIO) -->
      <h6 class="section-title">MÓDULOS PRINCIPALES</h6>
      <div class="menu-group">
        <!-- BUCLE DE MÓDULOS PRINCIPALES: Usamos RouterLink (Funciona bien en escritorio) -->
        <RouterLink 
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to" 
          class="menu-link"
        >
          <i :class="item.icon"></i> <span>{{ item.text }}</span>
        </RouterLink>
      </div>

      <!-- HERRAMIENTAS (ESCRITORIO) 
      <h6 class="section-title">HERRAMIENTAS</h6>
      <div class="menu-group">
         BUCLE DE HERRAMIENTAS: Usamos enlace <a> 
        <a 
          v-for="tool in toolsItems"
          :key="tool.text"
          :href="tool.href" 
          class="menu-link"
        >
          <i :class="tool.icon"></i> <span>{{ tool.text }}</span>
        </a>
      </div>-->


    </nav>
  </div>

  <!-- ---------------------------------------------------- -->
  <!-- 2. Contenedor de MÓVIL (Offcanvas de Bootstrap) -->
  <!-- ---------------------------------------------------- -->
  <div class="offcanvas offcanvas-start sidebar-container-full" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
    <div class="offcanvas-header sidebar-header-offcanvas">
      <h5 class="offcanvas-title" id="sidebarMenuLabel">
        <i class="bi bi-box-fill me-2"></i> Mi Sistema
      </h5>
      <!-- Botón nativo de Bootstrap para cerrar el Offcanvas -->
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <nav class="sidebar-nav">
        <!-- MÓDULOS PRINCIPALES (MÓVIL) -->
        <h6 class="section-title section-title-offcanvas">MÓDULOS PRINCIPALES</h6>
        <div class="menu-group-offcanvas">
          <!-- BUCLE DE MÓDULOS PRINCIPALES: Usamos <a> con @click.prevent para navegación forzada -->
          <a
            v-for="item in menuItems"
            :key="item.to"
            :href="item.to" 
            class="menu-link" 
            data-bs-dismiss="offcanvas"
            @click.prevent="navigateMobile(item.to)"
            :class="{ 'router-link-active': route.path === item.to }"
          >
            <i :class="[item.icon, 'me-3']"></i> <span>{{ item.text }}</span>
          </a>
        </div>

        <!-- HERRAMIENTAS (MÓVIL)
        <h6 class="section-title section-title-offcanvas">HERRAMIENTAS</h6>
        <div class="menu-group-offcanvas">
           BUCLE DE HERRAMIENTAS: Usamos <a> (solo cierra el menú, no navega) 
          <a 
            v-for="tool in toolsItems"
            :key="tool.text"
            :href="tool.href" 
            class="menu-link" 
            data-bs-dismiss="offcanvas"
          >
            <i :class="[tool.icon, 'me-3']"></i> <span>{{ tool.text }}</span>
          </a>
        </div> -->


      </nav>
    </div>
  </div>
</template>


<style scoped>
/* ======================================= */
/* ESTILOS BASE Y PLEGADO (Puro CSS)       */
/* ======================================= */

/* Estado inicial: Plegado */
.sidebar-container {
  width: 80px; /* Ancho de Icono */

  min-width: 80px; /* Evita que se encoja */
  
  /* Fija la barra lateral y le da altura completa */
  position: fixed; 

  overflow-x: hidden; 
  transition: width 0.3s ease; 
  
  background-color: #4B0082; 
  color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  min-height: 100vh; 
  z-index: 1020; 
}

/* Estado al pasar el cursor: Desplegado */
.sidebar-container:hover {
  width: 300px; 
}


/* ======================================= */
/* HEADER Y TÍTULOS DE SECCIÓN             */
/* ======================================= */

.sidebar-header {
  font-size: 1.1rem; /* Ajuste de tamaño de fuente */
  color: #E0B0FF; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  
  /* --- CLAVES: Estructura similar a menu-link (plegado/desplegado) --- */
  display: flex;
  align-items: center;
  
  /* Minimized state: Centered logo, narrow padding */
  justify-content: center;
  padding: 0.75rem 0; 
  
  white-space: nowrap; 
  cursor: default; 
  margin-bottom: 0.5rem; /* Margen para separarlo de los módulos */
  transition: padding 0.3s ease;
}

/* Estado Expandido: Restaura la alineación y el padding */
.sidebar-container:hover .sidebar-header {
  justify-content: flex-start;
  padding: 0.75rem 1rem; 
}

/* Estilos para el LOGO */
.header-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* Lo hace circular */
  object-fit: cover;
  flex-shrink: 0; 
  
  /* Minimized state: No margin */
  margin-right: 0;
  transition: margin-right 0.3s ease;
}

/* Estilos para el LOGO en estado Desplegado */
.sidebar-container:hover .header-logo {
  margin-right: 0.75rem; 
}

/* Estilos para el texto del sistema (span) */
.sidebar-header span {
  /* Minimized state: Hidden */
  display: none; 
  opacity: 0;
  transition: opacity 0.1s ease;
}

/* Estilos para el texto del sistema en estado Desplegado */
.sidebar-container:hover .sidebar-header span {
  display: initial; 
  opacity: 1;
  transition-delay: 0.2s; 
}

/* Estilos de los TÍTULOS DE SECCIÓN (Igual que antes) */
.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5); 
  padding: 1rem 1rem 0.2rem 1rem; 
  margin-bottom: 0;
    
  opacity: 0; 
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

/* Mostrar títulos al desplegar */
.sidebar-container:hover .section-title {
  opacity: 1;
  transition-delay: 0.1s; 
}


/* ======================================= */
/* ENLACES (MENU LINKS) - CORRECCIÓN DE CENTRADO */
/* ======================================= */

.sidebar-nav {
  padding: 1rem 0; 
}

.menu-group {
  padding: 0 0.5rem; 
  margin-bottom: 1rem;
}

.menu-link {
  text-decoration: none;
  color: inherit;
  
  /* Estilos de la "Tarjeta" */
  display: flex;
  align-items: center;
  
  /* --- ESTADO POR DEFECTO (MINIMIZADO) --- */
  /* CLAVE 1: Centra el icono */
  justify-content: center;
  /* CLAVE 2: Eliminamos padding horizontal para que el centrado sea exacto en los 80px */
  padding: 0.75rem 0; 
  
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, padding 0.3s ease;
  margin-bottom: 0.3rem;
}

/* Icono (visible en todo momento) */
.menu-link i {
  font-size: 1.2rem;
  min-width: 25px; 
  text-align: center;
  /* CLAVE 3: Asegura que el icono no tenga margen a la derecha en estado minimizado */
  margin-right: 0; 
  transition: margin-right 0.3s ease;
}

/* Texto del Enlace (span) */
.menu-link span {
  /* CLAVE 4: Ocultamos el texto completamente del flujo en estado minimizado */
  display: none; 
  opacity: 0;
  transition: opacity 0.1s ease;
  margin-left: 1rem;
  white-space: nowrap;
}


/* --- ESTADO DESPLEGADO (Hover) --- */

.sidebar-container:hover .menu-link {
  /* CLAVE 5: Restaura la alineación y el padding al desplegar */
  justify-content: flex-start;
  padding: 0.75rem 1rem; /* Padding original rectangular */
}

.sidebar-container:hover .menu-link i {
  /* Agrega un poco de margen al icono para separarlo del texto */
  margin-right: 10px; 
}

.sidebar-container:hover .menu-link span {
  /* CLAVE 6: Mostramos el span, ya no está oculto por display: none */
  display: initial; 
  opacity: 1;
  transition-delay: 0.2s; 
  margin-left: 0; /* Ya usamos margin-right en el icono */
}


/* Estado Hover y Activo */
.menu-link:hover {
  background-color: #8A2BE2; /* Morado Medio */
}

.menu-link.router-link-active {
  background-color: #8A2BE2; 
  color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); 
  border: 1px solid #E0B0FF;
}

/* ======================================= */
/* OFFCANVAS (Sin plegado/desplegado)      */
/* ======================================= */

/* Necesitamos una clase de ancho completo para el Offcanvas que no se pliegue */
.sidebar-container-full {
  min-width: 250px;
  background-color: #4B0082;
  color: white;
}
.sidebar-header-offcanvas {
  /* Estilos del header del offcanvas */
  padding: 1rem;
  background-color: #4B0082;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.section-title-offcanvas {
  opacity: 1; /* Forzamos que se muestre en el Offcanvas */
}
/* En Offcanvas, el texto siempre debe verse (lo anulamos del display: none) */
.menu-group-offcanvas .menu-link span {
  display: initial;
  opacity: 1; 
  margin-left: 0; /* Ya usamos margin-right en el icono */
}
/* Aseguramos que los enlaces del Offcanvas tengan el mismo estilo pero sin transición */
.menu-group-offcanvas {
  padding: 0 1rem;
}
.offcanvas-body {
  padding: 0;
}
.offcanvas-title {
  color: #E0B0FF;
  font-weight: 600;
}
.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%); 
}
</style>