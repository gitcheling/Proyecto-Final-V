<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
    isVisible: { type: Boolean, required: true },
    inscriptionId: { type: [Number, String], required: true },
    statusName: { type: String, required: true }
});

const emit = defineEmits(['confirm', 'cancel']);

// Título y texto de la advertencia
const confirmationTitle = computed(() => 'Advertencia de Cierre de Ciclo');

const confirmationText = computed(() => {
    return `Está a punto de cambiar la inscripción al estado "${props.statusName}". Este estado hace que el ciclo de dicha inscripción quede cerrado. Lo que anula cualquier obligación financiera pendiente que tuviera el estudiante`;
});

const detailsText = "Al confirmar, se impedirá cualquier modificación futura en los datos de esta inscripción. ¿Desea continuar?";

</script>

<template>
    <Transition name="confirm-pop">
        <div v-if="isVisible" class="confirmation-overlay" @click.self="emit('cancel')">
            <div class="confirmation-box"> 
                <i 
                    class="bi bi-exclamation-triangle-fill text-danger" 
                    style="font-size: 3rem;">
                </i>
                
                <h5 class="mt-3">{{ confirmationTitle }}</h5>
                
                <p class="text-muted">{{ confirmationText }}</p>

                <div class="alert alert-warning p-2 small mt-3">
                   {{ detailsText }}
                </div>

                <div class="d-flex justify-content-center gap-3 mt-4">
                    <button 
                        type="button" 
                        class="btn btn-danger" 
                        @click="emit('confirm')"
                    >
                        <i class="bi bi-check-lg"></i>
                        Sí, Continuar
                    </button>
                    
                    <button 
                        type="button" 
                        class="btn btn-outline-secondary-custom"
                        @click="emit('cancel')"
                    >
                        <i class="bi bi-x-circle me-1"></i>Cancelar
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>

/* Estilos de Botones (Copiados del ejemplo) */
.btn-outline-secondary-custom {
    --bs-btn-color: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #6c757d;
    --bs-btn-hover-border-color: #6c757d;
}

/* ------------------------------------------------ */
/* ESTILOS ESPECÍFICOS DEL MODAL DE CONFIRMACIÓN (Overlay y Caja) */
/* ------------------------------------------------ */

/* Contenedor de superposición: Cubre el 100% del modal principal */
.confirmation-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10; 
}

/* Caja de Confirmación: El modal pequeño que queremos */
.confirmation-box {
    /* Estilo del modal pequeño flotante */
    background: white; 
    border-radius: 8px;
    padding: 30px; 
    text-align: center;
    /* Limitamos el tamaño */
    width: 90%; 
    max-width: 400px; /* Tamaño máximo deseado (la clave) */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); /* Sombra para que flote */
}

/* ------------------------------------------------ */
/* ESTILOS DE TRANSICIÓN DEL MODAL DE CONFIRMACIÓN (Pop from center) */
/* ------------------------------------------------ */

/* 1. TRANSICIÓN PARA EL OVERLAY (Capa de atenuación) */
.confirm-pop-enter-active,
.confirm-pop-leave-active {
    transition: opacity 0.3s ease; 
}

.confirm-pop-enter-from,
.confirm-pop-leave-to {
    opacity: 0;
}

/* 2. TRANSICIÓN PARA LA CAJA DE CONFIRMACIÓN (Small box pop) */
.confirm-pop-enter-active .confirmation-box,
.confirm-pop-leave-active .confirmation-box {
    /* Usamos la función de rebote que definiste */
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.2s ease;
}

.confirm-pop-enter-from .confirmation-box,
.confirm-pop-leave-to .confirmation-box {
    /* Empezar pequeño y un poco transparente para el pop */
    transform: scale(0.7);
    opacity: 0; 
}

/* ------------------------------------------------ */

</style>