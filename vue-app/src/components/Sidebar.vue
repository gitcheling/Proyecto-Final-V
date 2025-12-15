<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Importamos el router y la ruta para la navegación y el estado activo
const router = useRouter()
const route = useRoute() 


// Ítems de navegación principales
const mainItems = ref([
  //{ to: '/', icon: 'bi-house-door', text: 'Dashboard' },
  { to: '/Entidades', icon: 'bi-building', text: 'Entidades' },
  { to: '/Estudiantes', icon: 'bi-book', text: 'Estudiantes' },
  { to: '/Docentes', icon: 'bi-mortarboard', text: 'Docentes' },
  { to: '/Proveedores', icon: 'bi-truck', text: 'Proveedores' },
  { to: '/PlanCuentas', icon: 'bi-list-task', text: 'Plan de Cuentas' },
  { to: '/ObligacionesFinancieras', icon: 'bi bi-coin', text: 'Obligaciones Financieras' },
  { to: '/RegistroTransacciones', icon: 'bi bi-currency-exchange', text: 'Transacciones' },
  { to: '/Periodos', icon: 'bi bi-calendar3', text: 'Periodos' },
  { to: '/Cursos', icon: 'bi bi-palette-fill', text: 'Cursos' },
  { to: '/Grupos', icon: 'bi bi-people-fill', text: 'Grupos' },
  { to: '/Inscripciones', icon: 'bi bi-journal-text', text: 'Inscripciones' },

])

// Ítems de reporte (sub-menú)
const bankAccountsItems = ref([
  { to: '/CuentasBancariasAprobadas', text: 'Cuentas Bancarias' },
  { to: '/CuentasBancariasPorAprobar', text: 'Cuentas Bancarias Por Aprobar' },
])

// Ítems de reporte (sub-menú)
const reportItems = ref([
  { to: '/ReportesEntidades', text: 'Reportes de Entidades' },
  { to: '/ReportesEstudiantes', text: 'Reportes de Estudiantes' },
  { to: '/ReportesDocentes', text: 'Reportes de Docentes' },
  { to: '/ReportesProveedores', text: 'Reportes de Proveedores' },
  { to: '/ReportesGrupos', text: 'Reportes de Grupos' },
  { to: '/ReportesInscripciones', text: 'Reportes de Inscripciones' },
  { to: '/ReportesCuentasBancarias', text: 'Reportes de Cuentas Bancarias' }
])

const bottomItems = ref([
    { to: '/AcercaDe', icon: 'bi bi-info-circle-fill', text: 'Acerca De' },
])

// Variable para controlar si la ruta actual es de reportes (ESTADO ACTIVO)
const isReportesOpen = computed(() => {
    // Comprueba si la ruta actual es alguna de las rutas de reportes
    return reportItems.value.some(item => route.path === item.to)
})

// Variable para controlar si la ruta actual es de Cuentas Bancarias
const isBankAccountsOpen = computed(() => {
    // Comprueba si la ruta actual es alguna de las rutas de configuración
    return bankAccountsItems.value.some(item => route.path === item.to)
});


// Variable para manejar el estado abierto/cerrado del acordeón por CLICK (solo para el ícono)
const isReportsMenuManualOpen = ref(false)

// Función para manejar la apertura/cierre manual del acordeón (solo para el icono)
const toggleReportsMenu = () => {
    isReportsMenuManualOpen.value = !isReportsMenuManualOpen.value;
}


// ===============================================
// LÓGICA DE CIERRE AUTOMÁTICO (CSS + Eventos de Ratón)
// ===============================================

// Nuevo ref para indicar si el sidebar está plegado (se sale el ratón)
const isSidebarCollapsed = ref(false);

let sidebarElement = null; 

const handleMouseLeave = () => {
    // Al salir el ratón, forzamos el modo "plegado" y ocultamos los acordeones
    isSidebarCollapsed.value = true;
};

const handleMouseEnter = () => {
    // Al entrar el ratón, permitimos que se muestren los acordeones si están activos
    isSidebarCollapsed.value = false;
};

onMounted(() => {
    // Obtenemos la referencia al contenedor de la sidebar (solo escritorio)
    sidebarElement = document.getElementById('sidebar-wrapper');
    if (sidebarElement) {
        // Adjuntamos los dos eventos
        sidebarElement.addEventListener('mouseleave', handleMouseLeave);
        sidebarElement.addEventListener('mouseenter', handleMouseEnter);
    }
});

onUnmounted(() => {
    // Limpiamos los event listeners
    if (sidebarElement) {
        sidebarElement.removeEventListener('mouseleave', handleMouseLeave);
        sidebarElement.removeEventListener('mouseenter', handleMouseEnter);
    }
});

/**
 * Función para manejar la navegación en el menú móvil (Offcanvas).
 */
const navigateMobile = (path) => {
    const offcanvasElement = document.getElementById('sidebarMenu');
    if (offcanvasElement) {
        // Solo intentamos cerrar si 'bootstrap' está definido (para evitar el error de referencia)
        if (typeof bootstrap !== 'undefined') {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (offcanvas) {
                offcanvas.hide(); 
            }
        }
    }
    router.push(path);
};

</script>


<template>
  <div 
    :class="['d-none', 'd-md-block', 'sidebar-container']" 
    id="sidebar-wrapper"
  >
    <div class="sidebar-header">
      <img src="../assets/img/logo.png" alt="Logo" class="header-logo">
      <span>aCATdemy</span>
    </div>
    
    <div class="sidebar-content-scroll"> 
        <nav class="sidebar-nav">

          <div class="menu-group">

               <!-- Opciones principales -->
              <RouterLink 
                v-for="item in mainItems"
                :key="item.to"
                :to="item.to" 
                class="menu-link"
              >
                <span class="icon-wrapper"><i :class="item.icon"></i></span> <span>{{ item.text }}</span>
              </RouterLink>

              <!-- Acordeón de las cuentas bancarias -->
              <div class="accordion-item-custom">
                <a 
                    href="#"
                    role="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#bankAccountCollapseDesktop"
                    aria-expanded="false" 
                    aria-controls="bankAccountCollapseDesktop"
                    :class="['menu-link', 'accordion-toggle-link', {'router-link-active': isBankAccountsOpen}]" 
                    >
                    <span class="icon-wrapper"><i class="bi-bank"></i></span> <span>Cuentas Bancarias</span> 
                </a>

                <div 
                    v-show="!isSidebarCollapsed || isBankAccountsOpen"
                    :class="['collapse', 'accordion-menu-content', {'show': isBankAccountsOpen}]" 
                    id="bankAccountCollapseDesktop"
                >
                    <RouterLink 
                        v-for="account in bankAccountsItems"
                        :key="account.to"
                        :to="account.to" 
                        class="menu-link sub-menu-link"
                    >
                        <span>{{ account.text }}</span>
                    </RouterLink>
                </div>
              </div>

                


              


              <!-- Acordeón de los reportes -->
              <div class="accordion-item-custom">
                  <a 
                      href="#"
                      role="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target="#reportsCollapseDesktop"
                      aria-expanded="false" 
                      aria-controls="reportsCollapseDesktop"
                      :class="['menu-link', 'accordion-toggle-link', {'router-link-active': isReportesOpen}]"
                  >
                      <span class="icon-wrapper"><i class="bi bi-bar-chart-line-fill"></i></span> <span>Reportes</span> 
                  </a>

                  <div 
                      v-show="!isSidebarCollapsed || isReportesOpen"
                      :class="['collapse', 'accordion-menu-content', {'show': isReportesOpen}]" 
                      id="reportsCollapseDesktop"
                  >
                      <RouterLink 
                          v-for="report in reportItems"
                          :key="report.to"
                          :to="report.to" 
                          class="menu-link sub-menu-link"
                      >
                          <span>{{ report.text }}</span>
                      </RouterLink>
                  </div>
              </div>


                <RouterLink 
                    v-for="item in bottomItems"
                    :key="item.to"
                    :to="item.to" 
                    class="menu-link"
                >
                    <span class="icon-wrapper"><i :class="item.icon"></i></span> <span>{{ item.text }}</span>
                </RouterLink>





          </div>

        </nav>
    </div>
  </div>

  <div class="offcanvas offcanvas-start sidebar-container-full" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
    <div class="offcanvas-header sidebar-header-offcanvas">
      <h5 class="offcanvas-title" id="sidebarMenuLabel">
        <img src="../assets/img/logo.png" alt="Logo" class="header-logo"> aCATdemy
      </h5>
    
    </div>
    
    <div class="offcanvas-body">
      <nav class="sidebar-nav">
        <div class="menu-group-offcanvas">

            <!-- Opciones principales -->
            <a
              v-for="item in mainItems"
              :key="item.to"
              href="#"
              class="menu-link" 
              data-bs-dismiss="offcanvas"
              @click.prevent="navigateMobile(item.to)"
              :class="{ 'router-link-active': route.path === item.to }"
            >
              <span class="icon-wrapper"><i :class="[item.icon, 'me-3']"></i></span> <span>{{ item.text }}</span>
            </a>

            <!-- Acordeón de las cuentas bancarias -->
            <div class="accordion-item-custom-offcanvas">
                <a 
                    data-bs-toggle="collapse" 
                    href="#bankAccountsCollapseMobile" 
                    role="button" 
                    :aria-expanded="isBankAccountsOpen ? 'true' : 'false'" 
                    aria-controls="bankAccountsCollapseMobile"
                    :class="['menu-link', 'accordion-toggle-link', {'router-link-active': isBankAccountsOpen}]"
                >
                    <span class="icon-wrapper"><i class="bi bi-gear-fill me-3"></i></span> <span>Cuentas Bancarias</span> 
                </a>

                <div :class="['collapse', 'accordion-menu-content', {'show': isBankAccountsOpen}]" id="bankAccountsCollapseMobile">
                    <a
                        v-for="account in bankAccountsItems"
                        :key="account.to"
                        href="#"
                        class="menu-link sub-menu-link"
                        data-bs-dismiss="offcanvas"
                        @click.prevent="navigateMobile(account.to)"
                        :class="{ 'router-link-active': route.path === account.to }"
                    >
                        <span>{{ account.text }}</span>
                    </a>
                </div>
            </div>

            <!-- Acordeón de los reportes -->
            <div class="accordion-item-custom-offcanvas">
                <a 
                    data-bs-toggle="collapse" 
                    href="#reportsCollapseMobile" 
                    role="button" 
                    :aria-expanded="isReportesOpen ? 'true' : 'false'" 
                    aria-controls="reportsCollapseMobile"
                    :class="['menu-link', 'accordion-toggle-link', {'router-link-active': isReportesOpen}]"
                >
                    <span class="icon-wrapper"><i class="bi bi-bar-chart-line-fill me-3"></i></span> <span>Reportes</span> 
                </a>

                <div :class="['collapse', 'accordion-menu-content', {'show': isReportesOpen}]" id="reportsCollapseMobile">
                    <a
                        v-for="report in reportItems"
                        :key="report.to"
                        href="#"
                        class="menu-link sub-menu-link"
                        data-bs-dismiss="offcanvas"
                        @click.prevent="navigateMobile(report.to)"
                        :class="{ 'router-link-active': route.path === report.to }"
                    >
                        <span>{{ report.text }}</span>
                    </a>
                </div>
            </div>

        </div>

      </nav>
    </div>
  </div>
</template>


<style scoped>
/* ======================================= */
/* ESTILOS BASE Y PLEGADO (Puro CSS) */
/* ======================================= */

/* Estado inicial: Plegado (80px). Esta es la base. */
.sidebar-container {
    width: 80px; 
    min-width: 80px; 
    position: fixed; 
    overflow-x: hidden; 
    transition: width 0.3s ease; 
    background-color: #4B0082; 
    color: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
    min-height: 100vh; 
    z-index: 1020; 
}

/* Estado al pasar el cursor: Desplegado (300px) */
.sidebar-container:hover {
    width: 300px; 
}

/* 2. ESTILO PARA EL SCROLL (Escritorio) */
.sidebar-content-scroll {
    height: calc(100vh - 70px); 
    overflow-y: auto; 
    padding-bottom: 20px; 
    scrollbar-width: thin; 
    scrollbar-color: rgba(255, 255, 255, 0.3) #4B0082; 
}
.sidebar-content-scroll::-webkit-scrollbar {
    width: 6px;
}
.sidebar-content-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
}
.sidebar-content-scroll::-webkit-scrollbar-track {
    background: transparent;
}


/* ======================================= */
/* HEADER Y TÍTULOS DE SECCIÓN */
/* ======================================= */

.sidebar-header {
    font-size: 1.1rem; 
    color: #E0B0FF; 
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 0; 
    white-space: nowrap; 
    cursor: default; 
    transition: padding 0.3s ease;
}

/* ------------------------------------------- */
/* REGLAS CRÍTICAS DE VISIBILIDAD DE CONTENIDO */
/* ------------------------------------------- */

/* 1. OCULTAR TODOS LOS TEXTOS POR DEFECTO (Plegado) */
.sidebar-container .section-title,
/* Solo ocultamos el SPAN que NO sea 'icon-wrapper' */
.sidebar-container .menu-link > span:not(.icon-wrapper), 
.sidebar-container .sidebar-header span {
    display: none !important;
    opacity: 0 !important;
    transition: opacity 0.1s ease;
}

/* 2. MOSTRAR TEXTOS AL EXPANDIR (Hover) */
.sidebar-container:hover .section-title,
.sidebar-container:hover .menu-link span, 
.sidebar-container:hover .sidebar-header span {
    display: initial !important; 
    opacity: 1 !important;
    transition-delay: 0.2s; 
    white-space: nowrap;
}


/* EXPANSIÓN DE HEADER: HOVER */
.sidebar-container:hover .sidebar-header {
    justify-content: flex-start;
    padding: 0.75rem 1rem; 
}

.header-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%; 
    object-fit: cover;
    flex-shrink: 0; 
    margin-right: 0;
    transition: margin-right 0.3s ease;
}

/* EXPANSIÓN DE LOGO: HOVER */
.sidebar-container:hover .header-logo {
    margin-right: 0.75rem; 
}

.section-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5); 
    padding: 1rem 1rem 0.2rem 1rem; 
    margin-bottom: 0;
}


/* ======================================= */
/* ENLACES (MENU LINKS) */
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
    display: flex;
    align-items: center;
    justify-content: center; /* Plegado: Centra el icono */
    padding: 0.75rem 0; 
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease, padding 0.3s ease;
    margin-bottom: 0.3rem;
    width: 100%; 
}

/* ---------------------------------------------------- */
/* CONTENEDOR DE ÍCONO (icon-wrapper) */
/* ---------------------------------------------------- */

.icon-wrapper {
    /* Define un ancho fijo de 25px para que todos los íconos ocupen el mismo espacio */
    width: 25px; 
    text-align: center;
    margin-right: 0; 
    flex-shrink: 0;
    /* Forzamos la transición de margen aquí */
    transition: margin-right 0.3s ease !important; 
    display: initial !important; 
    opacity: 1 !important;
}

.icon-wrapper i {
    font-size: 1.2rem;
}

/* AJUSTE DE JUSTIFICACIÓN Y PADDING DEL LINK: HOVER */
.sidebar-container:hover .menu-link {
    justify-content: flex-start;
    padding: 0.75rem 1rem; 
}

/* AJUSTE DE ÍCONO: HOVER (Maneja el movimiento lateral en el wrapper) */
.sidebar-container:hover .icon-wrapper {
    margin-right: 10px !important; /* Forzamos el margen */
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

/* ---------------------------------------------------- */
/* AJUSTES DE ACORDEÓN (SOLUCIÓN CENTRADO V15) */
/* ---------------------------------------------------- */

.accordion-toggle-link {
    width: 100%; 
    margin-bottom: 0; 
    /* Forzamos la justificación para que siempre use el centro en estado plegado */
    justify-content: center !important; 
    padding: 0.75rem 0 !important; /* CRÍTICO: Eliminar padding lateral en estado plegado */
}

/* En el hover, volvemos a aplicar las reglas estándar para el despliegue */
.sidebar-container:hover .accordion-toggle-link {
    justify-content: flex-start !important; 
    padding: 0.75rem 1rem !important;
}

/* Neutralizamos estilos de flecha */
.accordion-icon {
    display: none !important; 
}


/* ---------------------------------------------------- */
/* AJUSTES DE SUB-LINKS Y GRUPOS */
/* ---------------------------------------------------- */

/* Anulamos cualquier margin que pudiera tener el <i> de los sub-links */
.sub-menu-link .icon-wrapper {
    margin-right: 0 !important;
    width: 0 !important;
}

.accordion-item-custom, .accordion-item-custom-offcanvas {
    margin-bottom: 0.3rem;
    padding: 0; 
    transition: background-color 0.2s ease;
    width: 100%; 
}

/* APLICAMOS PADDING HORIZONTAL SOLO CUANDO ESTÁ PLEGADO EN LA VISTA COMPRIMIDA */
.sidebar-container:not(:hover) .accordion-item-custom {
    padding: 0; 
}

.sub-menu-link {
    justify-content: flex-start !important; 
    padding: 0.5rem 0.5rem 0.5rem 0.5rem; 
    font-size: 0.95rem; 
    margin-left: 0; 
    border-radius: 0; 
    margin-bottom: 0;
}

/* Ocultar el ícono en los sub-links, si es que tienen */
.sidebar-container:hover .sub-menu-link .icon-wrapper {
    margin-right: 0; 
}

/* ------------------------------------------- */
/* AJUSTES DE VISIBILIDAD DE ACORDEÓN (Escritorio) */
/* ------------------------------------------- */

/* El acordeón solo se fuerza abierto si la sidebar está expandida (hover) Y tiene la clase 'show' */
.sidebar-container:hover .collapse.show {
    display: block !important;
}

/* Ajuste de padding y justificación al desplegar (Hover) */
.accordion-item-custom .accordion-toggle-link,
.sidebar-container:hover .accordion-toggle-link {
    justify-content: flex-start; 
    padding: 0.75rem 1rem; 
}

.accordion-item-custom .sub-menu-link,
.sidebar-container:hover .sub-menu-link {
    justify-content: flex-start;
    padding: 0.5rem 1rem 0.5rem 2rem; /* Indentación para hijos */
    border-radius: 0;
    margin-bottom: 0.1rem;
}


/* ------------------------------------------- */
/* ESTADO ACTIVO (Final) */
/* ------------------------------------------- */

/* Anulamos completamente el estilo de activo del SUB-LINK cuando la barra está plegada */
.sidebar-container:not(:hover) .sub-menu-link.router-link-active {
    background-color: transparent !important;
    color: inherit !important; 
    box-shadow: none !important;
    border: none !important;
}

/* Estilo activo de los sub-links cuando están VISIBLES (barra expandida) */
.sub-menu-link.router-link-active {
    background-color: #A052E9 !important; 
    border: none !important;
    box-shadow: none !important;
}


/* ======================================= */
/* OFFCANVAS (Sin plegado/desplegado) */
/* ======================================= */

.sidebar-container-full {
    min-width: 250px;
    background-color: #4B0082;
    color: white;
}
.sidebar-header-offcanvas {
    padding: 1rem;
    background-color: #4B0082;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.section-title-offcanvas {
    opacity: 1; 
}
/* En Offcanvas, el texto siempre debe verse */
.menu-group-offcanvas .menu-link span {
    display: initial;
    opacity: 1; 
    margin-left: 0; 
}
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