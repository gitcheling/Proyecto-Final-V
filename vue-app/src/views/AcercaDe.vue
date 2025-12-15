<template>
    <div class="acerca-de-full-width-container">
        <div class="card about-card-full-width shadow-lg p-5">
            <div class="row align-items-center">
                
                <div class="col-12 col-lg-5 text-center text-lg-start mb-4 mb-lg-0">
                    <header>
                        
                        <div class="logo-interactive-container">
                            
                            <div class="logo-area-huge-pink mx-auto mx-lg-0 mb-4">
                                <img 
                                    src="@/assets/img/logo.png" 
                                    alt="Logo del Sistema Financiero" 
                                    class="system-logo-huge-pink img-fluid"
                                />
                            </div>
                            
                            <div class="gif-popover-content">
                              <div class="popover-inner p-3 rounded shadow-lg">
                                  <h4 class="text-plum-dark mb-2">¡Gracias por tu apoyo!</h4>
                                  
                                  <div class="gif-wrapper-flex"> 
                                      <img 
                                          :src="animatedLogoUrl" 
                                          alt="Animación del Logo" 
                                          class="animated-gif-display img-fluid"
                                      />
                                  </div>
                                  
                              </div>
                          </div>
                            
                        </div>
                        <h1 class="display-6 fw-bold text-plum">{{ systemName }}</h1>
                        <p class="text-fuchsia">{{ tagline }}</p>
                    </header>
                </div>

               <div class="col-12 col-lg-7">
                    
                    <section class="agradecimientos-box-pink p-5 rounded-3">
                        <h2 class="fw-bold mb-4 text-plum">
                            <i class="bi bi-star-fill me-2"></i> Mi Más Sincero Agradecimiento
                        </h2>
                        
                        <p class="lead mb-4 text-plum-dark">
                            Agradezco enormemente el apoyo incondicional y el trabajo dedicado de todos los que contribuyeron (directa o indirectamente) a la creación de este sistema.
                        </p>
                        
                        <div class="d-flex flex-column align-items-start">
                            <span class="badge badge-contributor-pink my-2">Katiuska Sivira</span>
                            <span class="badge badge-contributor-pink my-2">José Rodríguez</span>
                            <span class="badge badge-contributor-pink my-2">Kimberly Rodriguez</span>
                            <span class="badge badge-contributor-pink my-2">Profesora María José Diaz</span>
                            <span class="badge badge-contributor-pink my-2">Profesora Vanessa Dignora Mendoza</span>
                            <span class="badge badge-contributor-pink my-2">Profesora Paola Ruggiero</span>
                            <span class="badge badge-contributor-pink-2 my-2">Dana María Ríos</span>
                            
                        </div>
                    </section>

                    <footer class="text-start text-plum-light mt-5 pt-3 border-top-lavender">
                        <small>Sistema {{ systemName }}. Versión {{ systemVersion }}. &copy; {{ currentYear }}.</small>
                    </footer>

                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed } from 'vue';

import animatedLogoUrl from '../assets/img/chipi-chapa.gif';

// --- Datos del Sistema (Personaliza esto) ---
const systemName = ref('Sistema de Control aCATdémico');
const tagline = ref('Construido con dedicación, esfuerzo y perseverancia.');
const systemVersion = ref('Beta');

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
/* Paleta: Rosa (Fucsia) y Morado (Ciruela/Lavanda) */
.text-plum { color: #5a3c6c; } 
.text-plum-dark { color: #402c4c; } 
.text-plum-light { color: #8a6c9c; } 
.text-fuchsia { color: #ff00ff; } 

.acerca-de-full-width-container {
    padding: 20px 20px;
    background-color: #f7f3f9; 
}

/* Tarjeta Principal */
.about-card-full-width {
    width: 100%;
    margin: 0 auto 30px auto; 
    border: 1px solid #e0d9e8; 
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(90, 60, 108, 0.1);
}

/* Sección del Logo */
.logo-interactive-container {
    position: relative;
    display: inline-block; 
    cursor: help; 
}

.logo-area-huge-pink {
    max-height: 600px; 
    display: block; 
}

.system-logo-huge-pink {
    max-height: 600px; 
    width: auto; 
    max-width: 100%; 
}

/* Separadores y Badges (sin cambios) */
.separator-fuchsia-left { border-top: 2px solid #ff00ff; width: 60px; opacity: 1; margin-left: 0; margin-right: auto; }
.separator-fuchsia { border-top: 2px solid #ff00ff; width: 60px; opacity: 1; margin-left: auto; margin-right: auto; }
.agradecimientos-box-pink { background-color: #fdfbff; border: 1px solid #e9e2f1; }
.badge-contributor-pink { background-color: #f7e6f7; color: #5a3c6c; font-weight: 500; padding: 10px 15px; border-radius: 20px; min-width: 70%; margin-top: 5px; margin-bottom: 5px; }
.border-top-lavender { border-top: 1px solid #e0d9eeb0 !important; }


.badge-contributor-pink {
    background-color: #fab4e5; /* <-- 1. COLOR DE FONDO (Rosa/Lavanda muy suave) */
    color: #5a3c6c; /* <-- 2. COLOR DEL TEXTO (Morado Ciruela) */
    font-weight: 500;
    padding: 10px 15px;
    border-radius: 20px;
    min-width: 70%;
    margin-top: 5px;
    margin-bottom: 5px;
}

.badge-contributor-pink-2 {
    background-color: #ff80d9; /* <-- 1. COLOR DE FONDO (Rosa/Lavanda muy suave) */
    color: #5a3c6c; /* <-- 2. COLOR DEL TEXTO (Morado Ciruela) */
    font-weight: 500;
    padding: 10px 15px;
    border-radius: 20px;
    min-width: 70%;
    margin-top: 5px;
    margin-bottom: 5px;
}


/* ------------------------- 🖼️ Estilos para el GIF GIGANTE y CENTRADO ------------------------*/

/* Contenedor Flotante (sin cambios) */
.gif-popover-content {
    position: fixed; top: 50%; left: 50%; 
    max-width: 85vw; max-height: 85vh; 
    width: 100%; height: 100%;
    transform: translate(-50%, -50%) scale(0.5); 
    z-index: 10000; opacity: 0; visibility: hidden; pointer-events: none; 
    transition: opacity 0.5s ease, transform 0.5s ease; 
}

/* El estilo de la caja flotante (Inner) (sin cambios) */
.popover-inner {
    background-color: #ffffff;
    border: 3px solid #db5cd1; 
    width: 100%;
    height: 100%;
    display: flex; flex-direction: column; justify-content: center; align-items: center; 
    box-sizing: border-box;
}

/* NUEVA REGLA: Contenedor del GIF que crece para tomar el espacio sobrante (sin cambios) */
.gif-wrapper-flex {
    flex-grow: 1; 
    width: 100%; 
    display: flex; 
    justify-content: center;
    align-items: center;
    padding: 10px; 
}


/* IMAGEN DEL GIF: FORZAMOS UN TAMAÑO MÍNIMO MUY GRANDE Y MAXIMIZAMOS EL ESPACIO */
.animated-gif-display {
    /* **GARANTÍA DE TAMAÑO MÍNIMO** (Ajusta estos valores si quieres que sea aún más grande) */
    min-width: 900px; /* Al menos 400px de ancho */
    min-height: 900px; /* Al menos 400px de alto */
    
    /* Maximizar el espacio dentro del wrapper Flexbox */
    max-height: 100%; 
    max-width: 100%;
    
    /* Esto respeta la proporción y asegura que quepa */
    object-fit: contain; 
    
    width: auto; 
    height: auto; 
    border-radius: 5px;
}

/* EL EFECTO HOVER: Mostrar el GIF (sin cambios) */
.logo-interactive-container:hover .gif-popover-content {
    opacity: 1; visibility: visible; pointer-events: auto; 
    transform: translate(-50%, -50%) scale(1); 
}
</style>