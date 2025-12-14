<template>

    <div class="page-container p-4">

        <h2 class="mb-4 title">Reportes y Análisis de Cuentas Bancarias</h2>
        
        <div class="accordion" id="bankAccountsAccordion">
            
            <div class="accordion-item">
                <h2 class="accordion-header" :id="'heading-1'">
                    <button 
                        class="accordion-button d-flex justify-content-between align-items-center" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse-1" 
                        aria-controls="collapse-1"
                        :aria-expanded="activeCollapseId === 'collapse-1'" 
                        :class="{ 'collapsed': activeCollapseId !== 'collapse-1' }" 
                    >
                        <div class="d-flex align-items-center">
                            <i class="bi bi-bar-chart-fill report-icon"></i>
                            <span class="ms-2">1. Estado Actual de Cuentas Bancarias</span>
                        </div>
                        
                        <span class="accordion-icon">
                            <i class="bi bi-chevron-down"></i>
                        </span>
                    </button>
                </h2>
                <div 
                    id="collapse-1" 
                    class="accordion-collapse collapse" 
                    :class="{'show': activeCollapseId === 'collapse-1'}"
                    :aria-labelledby="'heading-1'" 
                    data-bs-parent="#bankAccountsAccordion"
                >
                    <div class="accordion-body p-4">
                        <BankAccountStatusChart />
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <h2 class="accordion-header" :id="'heading-2'">
                    <button 
                        class="accordion-button d-flex justify-content-between align-items-center" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse-2" 
                        aria-controls="collapse-2"
                        :aria-expanded="activeCollapseId === 'collapse-2'" 
                        :class="{ 'collapsed': activeCollapseId !== 'collapse-2' }" 
                    >
                        <div class="d-flex align-items-center">
                            <i class="bi bi-graph-up report-icon"></i>
                            <span class="ms-2">2. Cuentas Bancarias Creadas a lo Largo del Tiempo</span>
                        </div>
                        <span class="accordion-icon">
                            <i class="bi bi-chevron-down"></i>
                        </span>
                    </button>
                </h2>
                <div 
                    id="collapse-2" 
                    class="accordion-collapse collapse" 
                    :class="{'show': activeCollapseId === 'collapse-2'}"
                    :aria-labelledby="'heading-2'" 
                    data-bs-parent="#bankAccountsAccordion"
                >
                    <div class="accordion-body p-4">
                        <BankAccountCreationChart />
                    </div>
                </div>
            </div>
            
            <div class="accordion-item">
                <h2 class="accordion-header" :id="'heading-3'">
                    <button 
                        class="accordion-button d-flex justify-content-between align-items-center" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse-3" 
                        aria-controls="collapse-3"
                        :aria-expanded="activeCollapseId === 'collapse-3'" 
                        :class="{ 'collapsed': activeCollapseId !== 'collapse-3' }"
                    >
                        <div class="d-flex align-items-center">
                            <i class="bi bi-check-circle-fill report-icon"></i>
                            <span class="ms-2">3. Cuentas Bancarias Aprobadas a lo Largo del Tiempo</span>
                        </div>
                        <span class="accordion-icon">
                            <i class="bi bi-chevron-down"></i>
                        </span>
                    </button>
                </h2>
                <div 
                    id="collapse-3" 
                    class="accordion-collapse collapse" 
                    :class="{'show': activeCollapseId === 'collapse-3'}"
                    :aria-labelledby="'heading-3'" 
                    data-bs-parent="#bankAccountsAccordion"
                >
                    <div class="accordion-body p-4">
                        <BankAccountApprovedChart />
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <h2 class="accordion-header" :id="'heading-4'">
                    <button 
                        class="accordion-button d-flex justify-content-between align-items-center" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse-4" 
                        aria-controls="collapse-4"
                        :aria-expanded="activeCollapseId === 'collapse-4'" 
                        :class="{ 'collapsed': activeCollapseId !== 'collapse-4' }"
                    >
                        <div class="d-flex align-items-center">
                            <i class="bi bi-arrow-repeat report-icon"></i>
                            <span class="ms-2">4. Cuentas Bancarias Modificadas a lo Largo del Tiempo</span>
                        </div>
                        <span class="accordion-icon">
                            <i class="bi bi-chevron-down"></i>
                        </span>
                    </button>
                </h2>
                <div 
                    id="collapse-4" 
                    class="accordion-collapse collapse" 
                    :class="{'show': activeCollapseId === 'collapse-4'}"
                    :aria-labelledby="'heading-4'" 
                    data-bs-parent="#bankAccountsAccordion"
                >
                    <div class="accordion-body p-4">
                        <BankAccountUpdateChart />
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</template>

<script setup>
    // Se importan los componentes hijos
    import BankAccountStatusChart from './EstadoCuentasBancarias.vue'; 

    import BankAccountCreationChart from './CuentasBancariasCreadas.vue'; 

    import BankAccountApprovedChart from './CuentasBancariasAprobadas.vue'; 

    import BankAccountUpdateChart from './CuentasBancariasModificadas.vue'; 

    import { ref, onMounted } from 'vue';

    // Ref para rastrear qué ítem está actualmente abierto (ej: "ref('collapse-1')")
    const activeCollapseId = ref(); // Inicializado con el primer ítem abierto

    onMounted(() => {
        const accordionElement = document.getElementById('bankAccountsAccordion');
        if (accordionElement) {
            // Escuchamos el evento de Bootstrap cuando un ítem TERMINA de mostrarse
            accordionElement.addEventListener('shown.bs.collapse', (event) => {
                activeCollapseId.value = event.target.id;
            });
            // Escuchamos el evento de Bootstrap cuando un ítem TERMINA de ocultarse
            accordionElement.addEventListener('hidden.bs.collapse', () => {
                 // Opcional: Si quieres que activeCollapseId se vacíe cuando todo está cerrado, puedes añadir lógica aquí.
            });
        }
    });

</script>

<style scoped>
    /* Colores base: Morado Oscuro: #5C1E7A, Rosa/Lavanda Claro: #F5E6FC, Rosa Fuerte/Intenso: #E03B8D */

    .page-container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .title {
        color:#333333;
    }

    /* === Estilos Base del Ítem === */
    .accordion-item {
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        overflow: hidden;
    }
    
    /* === 1. Eliminar la flecha predeterminada de Bootstrap (Ya estaba, solo para referencia) === */
    .accordion-button::after {
        content: none !important; 
        display: none;
    }

    /* === 2. Estilos del Botón/Encabezado Por Defecto (Cerrado) === */
    .accordion-button {
        font-weight: 600;
        /* Fondo: Rosa/Lavanda muy claro */
        background-color: #F5E6FC; /* Original */
        /* Texto: Morado Oscuro */
        color: #5C1E7A; /* Ajustado al Morado Oscuro de tu paleta */
        border: none;
        padding-right: 1rem; 
        transition: background-color 0.2s ease, color 0.2s ease; /* Transición para el hover */
    }

    /* Estilos del Botón Cerrado al pasar el mouse (Hover) */
    .accordion-button.collapsed:hover {
        /* Un lavanda/rosa más perceptible al pasar el mouse */
         background-color: #e6d1f3; 
        /* Texto ligeramente más oscuro */
        color: #4a148c; 
    }

    /* Eliminar el anillo de foco azul de accesibilidad para evitar el borde sobrante */
    .accordion-button:focus {
        outline: 0 !important; 
        box-shadow: none !important;
    }

    /* === 3. Estilos del Botón/Encabezado ACTIVO (Abierto) === */
    .accordion-button:not(.collapsed) {
        /* Fondo Activo: Morado Oscuro */
        background-color: #5C1E7A; /* Morado Oscuro de tu paleta */
        /* Texto Activo: Blanco */
        color: white; 
        border-bottom: 3px solid #E03B8D; 
        margin-bottom: 0;
    }
    
    /* 4. Borde del Ítem Activo */
    /* Este selector ya lo tenías, ajustado a tu color Morado Oscuro */
    .accordion-item:has(.accordion-button:not(.collapsed)) {
        border-color: #5C1E7A;
        
    }

    /* === 5. Fondo del Cuerpo (Body) === */
    .accordion-body {
        background-color: white; 
    }

    /* === ESTILOS PARA ÍCONOS Y FLECHA DE EXPANSIÓN === */

    /* Estilo del Ícono de Reporte (al inicio) */
    .report-icon {
        font-size: 1.25rem;
        /* Color del Ícono de Reporte cuando está CERRADO (Rosa Fuerte de tu paleta) */
        color: #E03B8D; 
        margin-right: 0.5rem;
    }
    
    /* Estilo del Ícono de Reporte cuando está ABIERTO */
    .accordion-button:not(.collapsed) .report-icon {
        color: white; /* Blanco, para contrastar con el fondo morado oscuro */
    }

    /* Contenedor de la Flecha de Chevron (al final) */
    .accordion-button .accordion-icon {
        min-width: 15px; 
        text-align: center;
        /* Al usar 'color: inherit;' hereda el color del texto del botón:
           - Cerrado: Morado Oscuro
           - Abierto: Blanco (¡Logra el objetivo de la flecha blanca!) 
        */
        color: inherit; 
    }

    /* 🆕 NUEVO: Aplicar el color de hover a la flecha cuando está cerrado */
    .accordion-button.collapsed:hover .accordion-icon {
        color: #38006b; /* Hace juego con el texto oscuro del hover */
    }

    /* Base de la transición de giro de la flecha de Chevron */
    .accordion-button .accordion-icon i {
        transition: transform 0.3s ease; 
        display: inline-block; 
    }
    
    /* Aplicar la rotación cuando el botón NO está colapsado (Abierto) */
    .accordion-button:not(.collapsed) .accordion-icon i {
        transform: rotate(180deg);
    }
</style>