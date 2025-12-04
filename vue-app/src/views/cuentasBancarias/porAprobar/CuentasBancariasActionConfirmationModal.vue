<script setup>
    import { defineProps, defineEmits, computed, ref } from 'vue';

    // Importamos el ref para manejar el estado del modal de confirmación
    // El error y error son funciones que tu tienes en tu entorno, asumo que existen
    // Si no existen, puedes simplemente quitarlas o definirlas como funciones vacías:
    // const error = console.error;

    const props = defineProps({
        isVisible: { type: Boolean, required: true },
        // Los datos de la cuenta a mostrar
        bankAccountData: { type: Object, default: null } 
    });

    // Añadimos 'approve' y 'delete' a los emits
    const emit = defineEmits(['close', 'confirmAction']);

    // --- ESTADOS PARA LA CONFIRMACIÓN DE ACCIÓN ---
    const showConfirmationModal = ref(false);

    // Guarda la acción ('approve' o 'delete') que se está confirmando
    const confirmationAction = ref(null); 
    // ---------------------------------------------


    /**
     * Formatea una cadena de fecha/hora ISO a un formato local legible.
     * @param {string} isoString - La cadena de fecha ISO.
     * @returns {string} La fecha y hora formateadas.
     */
    const formatDateTime = (isoString) => {
        if (!isoString) return '';

        try {
            const date = new Date(isoString);
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            return date.toLocaleString('es-ES', options); 
        } catch (err) {
            // En un entorno real, usarías una función de manejo de errores
            console.error('Error al formatear la fecha', err);
            return 'Fecha Inválida';
        }
    };


    /**
     * 1. Muestra el modal de confirmación y establece la acción a realizar.
     * @param {string} actionType - 'approve' o 'delete'.
     */
    const triggerAction = (actionType) => {
        confirmationAction.value = actionType;
        showConfirmationModal.value = true;
    };

    /**
     * 2. Ejecuta la acción confirmada y emite el evento al componente padre.
     * Emite un único evento 'confirmAction' con el tipo de acción y el ID de la cuenta.
     */
    const executeAction = () => {
        const action = confirmationAction.value;
        
        // Cerramos el modal de confirmación primero
        showConfirmationModal.value = false;

        if (action && props.bankAccountData?.id) {
            emit('confirmAction', { 
                action: action, 
                id: props.bankAccountData.id 
            });
        } else {
            // Manejo de error si los datos no están disponibles al confirmar
            console.error('Error al confirmar acción: Faltan datos de la cuenta o el tipo de acción.');
        }
        
        // El componente padre es responsable de cerrar el modal principal
        // después de que la operación de aprobación/eliminación sea exitosa.
    };


    /**
     * 3. Cancela y cierra el modal de confirmación.
     */
    const cancelAction = () => {
        showConfirmationModal.value = false;
        confirmationAction.value = null;
    };
    
    // Texto dinámico para el modal de confirmación
    const confirmationText = computed(() => {
        const action = confirmationAction.value;
        const nombreCuenta = props.bankAccountData?.numero_cuenta || 'esta cuenta';

        if (action === 'approve') {
            return `¿Está seguro de que desea APROBAR la cuenta bancaria ${nombreCuenta}? Esta acción la activará para operaciones.`;
        } else if (action === 'delete') {
            return `¿Está absolutamente seguro de que desea ELIMINAR permanentemente la cuenta bancaria ${nombreCuenta}? Esta acción es irreversible.`;
        }
        return '';
    });
    
    // Título dinámico para el modal de confirmación
    const confirmationTitle = computed(() => {
        const action = confirmationAction.value;
        if (action === 'approve') return 'Confirmar Aprobación';
        if (action === 'delete') return 'Confirmar Eliminación';
        return 'Confirmar Acción';
    });

</script>

<template>

    <div :class="{ 'is-open': isVisible }" class="modal-overlay" @click.self="emit('close')">

        <Transition name="modal-drop-view">

            <div v-if="isVisible" class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    
                    <div class="modal-header">
                        <h5 class="modal-title mb-3">Detalles de la Cuenta Bancaria:</h5>             
                    </div>

                    <div class="modal-body">
                        <div class="row g-3">
                                                 
                            <div class="col-12">
                                <div class="card" style="border-color:#8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">🆔 Datos de la cuenta bancaria</h6>
                                        <dl class="row mb-0 align-items-center">

                                            <dt class="col-sm-6 col-lg-3">Número de la cuenta</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ bankAccountData?.numero_cuenta }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Tipo de cuenta</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ bankAccountData?.tipo_cuenta.nombre }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Banco</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ bankAccountData?.banco.nombre }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Estado</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ bankAccountData?.estado.nombre }}</dd>

                                            <dt class="col-sm-6 col-lg-3">¿Pueden hacerse operaciones con ella?</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ bankAccountData?.estado.permite_operacion }}</dd>
                                            
                                        </dl>
                                    </div>
                                </div>
                            </div>

                             <div class="col-12">
                                <div class="card" style="border-color:#8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">💼 Datos de la entidad titular</h6>
                                        <dl class="row mb-0 align-items-center">

                                            <dt class="col-sm-6 col-lg-3">Nombre:</dt>
                                            <dd class="col-sm-6 col-lg-3">{{`${bankAccountData.entidad_titular.nombre} ${bankAccountData.entidad_titular.apellido ? bankAccountData.entidad_titular.apellido : ""}`}}</dd>

                                            <dt class="col-sm-6 col-lg-3">Número de identificación</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ bankAccountData?.entidad_titular.prefijo.letra_prefijo }}-{{ bankAccountData?.entidad_titular.numero_identificacion }}</dd>
                                          
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="card" style="border-color: #8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">👮‍♂️ Auditoría</h6>
                                        <dl class="row mb-0 align-items-center">
                                            
                                            <dt class="col-sm-3">Fecha de creación</dt>
                                            <dd class="col-sm-3">{{ formatDateTime(bankAccountData?.fechaCreacion)}}</dd>

                                            <dt class="col-sm-3">Fecha de aprobación</dt>
                                            <dd class="col-sm-3">{{ formatDateTime(bankAccountData?.fechaAprobacion)}}</dd>

                                            <dt class="col-sm-3">Última fecha de modificación</dt>
                                            <dd class="col-sm-3">{{ formatDateTime(bankAccountData?.fechaActualizacion) }}</dd>
                                            
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- FOOTER CON BOTONES DE ACCIÓN -->
                    <div class="modal-footer d-flex justify-content-between mt-3">
                        <div class="d-flex gap-2">
                            <!-- Botón de APROBAR (Usar estilo primario/éxito) -->
                            <button 
                                type="button" 
                                class="btn btn-success" 
                                @click="triggerAction('approve')"
                                title="Aprobar esta cuenta bancaria para su uso"
                            >
                                <i class="bi bi-check-circle"></i> Aprobar
                            </button>
                            
                            <!-- Botón de ELIMINAR (Usar estilo peligro/advertencia) -->
                            <button 
                                type="button" 
                                class="btn btn-danger" 
                                @click="triggerAction('delete')"
                                title="Eliminar permanentemente esta cuenta"
                            >
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </div>

                        <!-- Botón de CERRAR -->
                        <button type="button" class="btn btn-outline-secondary-custom" @click="emit('close')">
                             <i class="bi bi-x-circle me-1"></i>Cerrar
                        </button>
                    </div>
                 
                    <!-- MODAL DE CONFIRMACIÓN (Se muestra sobre el contenido principal) -->
                    <Transition name="confirm-pop">
                        <!-- CLAVE: .confirmation-overlay centra el contenido absolutamente -->
                        <div v-if="showConfirmationModal" class="confirmation-overlay"  @click.self="cancelAction">
                            <!-- Contenedor interno para el pop-up -->
                            <div class="confirmation-box"> 
                                <i 
                                    :class="confirmationAction === 'approve' ? 'bi bi-patch-check-fill text-success' : 'bi bi-exclamation-triangle-fill text-danger'" 
                                    style="font-size: 3rem;">
                                </i>
                                <h5 class="mt-3">{{ confirmationTitle }}</h5>
                                <p class="text-muted">{{ confirmationText }}</p>

                                <div class="d-flex justify-content-center gap-3 mt-4">
                                    <!-- Botón de Confirmar Acción -->
                                    <button 
                                        type="button" 
                                        :class="confirmationAction === 'approve' ? 'btn btn-success' : 'btn btn-danger'" 
                                        @click="executeAction"
                                    >
                                        <i :class="confirmationAction === 'approve' ? 'bi bi-check-lg' : 'bi bi-trash-fill'"></i>
                                        Sí, {{ confirmationAction === 'approve' ? 'Aprobar' : 'Eliminar' }}
                                    </button>
                                    
                                    <!-- Botón de Cancelar -->
                                    <button 
                                        type="button" 
                                        class="btn btn-outline-secondary-custom"
                                        @click="cancelAction"
                                    >
                                        <i class="bi bi-x-circle me-1"></i>Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition>


                </div>
            </div>

        </Transition>
       
    </div>

</template>

<style scoped>

/* Estilos de Botones */
.btn-outline-secondary-custom {
    --bs-btn-color: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #6c757d;
    --bs-btn-hover-border-color: #6c757d;
}

/* --- ESTILOS BASE DEL MODAL (Igual que el de edición) --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0; 
    pointer-events: none; 
    background-color: rgba(0, 0, 0, 0.6); 
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000; 
    transition: opacity 0.5s ease; /* Transición suave del fondo */
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 95%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  opacity: 1;
}

.modal-overlay.is-open {
    opacity: 1;
    pointer-events: auto; /* Permite que el fondo intercepte los clics */
}

/* El modal-dialog es lo que se anima, no el contenido final */
.modal-dialog {
    /* Asegura que el diálogo no interfiera con la animación de caída fuera de pantalla */
    margin: 0; 
    position: relative;
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
    /* Fondo semi-transparente para "enfocar" sobre el contenido de detalle */
    background-color: rgba(0, 0, 0, 0.2); 
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
/* ESTILOS DE TRANSICIÓN DEL CONTENEDOR (Drop-down) */
/* ------------------------------------------------ */
/* Nota: Usamos un nombre diferente (modal-drop-view) para evitar conflictos */
/* aunque la lógica es la misma que 'modal-drop' */
.modal-drop-view-enter-active {
    /* 1. Duración de la caída: 0.6s */
    transition: all 0.6s ease-out; 
    /* 2. ATRASO EN LA CAÍDA: Espera 0.4s (para que el fondo se oscurezca primero) */
    transition-delay: 0.4s; 
}

.modal-drop-view-leave-active {
    /* 3. Duración de la subida: 0.6s */
    transition: all 0.6s ease-in; 
    /* 4. SIN ATRASO: Sube inmediatamente */
    transition-delay: 0s; 
}

/* Estado Inicial (Entrada) / Estado Final (Salida): Posición fuera de pantalla */
.modal-drop-view-enter-from,
.modal-drop-view-leave-to {
    /* Mueve el modal verticalmente fuera de la vista */
    transform: translateY(-100vh); 
    opacity: 0; 
}

/* Estado Final (Entrada) / Estado Inicial (Salida): Posición normal */
.modal-drop-view-enter-to {
    transform: translateY(0); 
    opacity: 1; 
}


/* ------------------------------------------------ */
/* EFECTO DE APARICIÓN SUAVE DEL CONTENIDO (Fade-in/Fade-out) */
/* ------------------------------------------------ */
/* Aplicamos la misma lógica para que el contenido aparezca con un retraso */

/* OCULTAR EL CONTENIDO EN LOS ESTADOS DE MOVIMIENTO */
.modal-drop-view-enter-from .modal-content,
.modal-drop-view-leave-to .modal-content {
    opacity: 0;
}

/* HACER APARECER EL CONTENIDO (ENTER) */
.modal-drop-view-enter-active .modal-content {
    /* Transición de opacidad */
    transition: opacity 0.3s ease-out; 
    opacity: 1;
    /* ATRASO LARGO: Aparece después de que el modal terminó de caer (0.4s + 0.6s = 1s) */
    transition-delay: 1.0s; 
}

/* HACER DESAPARECER EL CONTENIDO (LEAVE) */
.modal-drop-view-leave-active .modal-content {
    /* El contenido desaparece inmediatamente (0s delay) antes de que el modal suba */
    transition: opacity 0.3s ease-in; 
    transition-delay: 0s; 
    opacity: 0;
}




/* ------------------------------------------------ */
/* ESTILOS DE TRANSICIÓN DEL MODAL DE CONFIRMACIÓN (Pop from center) */
/* ------------------------------------------------ */

/* 1. TRANSICIÓN PARA EL OVERLAY (Capa de atenuación) */
.confirm-pop-enter-active,
.confirm-pop-leave-active {
    /* Solo transicionamos la opacidad del overlay, no la escala, para evitar el efecto de expansión */
    transition: opacity 0.3s ease; 
}

.confirm-pop-enter-from,
.confirm-pop-leave-to {
    /* El overlay se atenúa/desvanece */
    opacity: 0;
}

/* 2. TRANSICIÓN PARA LA CAJA DE CONFIRMACIÓN (Small box pop) */
.confirm-pop-enter-active .confirmation-box,
.confirm-pop-leave-active .confirmation-box {
    /* La caja tiene su propia transición de escala con el efecto de "rebote" */
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.2s ease;
}

.confirm-pop-enter-from .confirmation-box,
.confirm-pop-leave-to .confirmation-box {
    /* Empezar pequeño y un poco transparente para el pop */
    transform: scale(0.7);
    opacity: 0; 
}


/* MEDIA QUERY: Tamaño para Pantallas Medianas (Mínimo 768px - Tablet/Desktop) */
@media (min-width: 768px) {
    .modal-content {
        width: 80%; 
        max-width: 900px; 
    }
}
</style>