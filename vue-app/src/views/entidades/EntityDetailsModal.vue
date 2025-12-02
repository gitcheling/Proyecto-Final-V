<script setup>
    import { defineProps, defineEmits, computed } from 'vue';

    const props = defineProps({
        isVisible: { type: Boolean, required: true },
        entityData: { type: Object, default: null } // Los datos de la entidad a mostrar
    });

    const emit = defineEmits(['close']);

    // Propiedad para saber que ícono se va a mostrar
    const entityIcon = computed(() => {
        if (!props.entityData) return 'bi bi-person-circle'; // Icono por defecto si no hay datos

        const prefijo = props.entityData.prefijo.letra_prefijo ? props.entityData.prefijo.letra_prefijo : null;

        if (prefijo === 'J') {
            // Jurídico: Empresa/Edificio (Puedes usar bi-building, bi-shop, bi-briefcase-fill)
            return 'bi bi-building'; 
        } else if (prefijo === 'G') {
            // Gubernamental: Gobierno/Banco/Institución (Puedes usar bi-bank, bi-gear, bi-house-door)
            return 'bi bi-bank'; 
        } else {
            // Natural (Cualquier otro prefijo o si no hay prefijo): Persona
            // Usamos bi-person-circle que es más neutro que bi-person.
            return 'bi bi-person-circle'; 
        }
    });

    /**
     * Formatea una cadena de fecha/hora ISO a un formato local legible.
     * @param {string} isoString - La cadena de fecha ISO (ej: "2025-11-07T23:16:53.982Z").
     * @returns {string} La fecha y hora formateadas.
     */
    const formatDateTime = (isoString) => {

        if (!isoString) return ''; // Manejar valores nulos o vacíos

        try {
            const date = new Date(isoString);

            // Opciones de formato: Día/Mes/Año y Hora:Minutos:Segundos
            const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Formato 24 horas
            };

            // Se puede usar 'es-ES' (España) o 'es-MX' (México)
            // También se puede usar "undefined" para usar la configuración regional del navegador.
            return date.toLocaleString('es-ES', options); 

        } catch (err) {
            error('Error al formatear la fecha', `${err}`);
            return 'Fecha Inválida';
        }
    };

</script>

<template>

    <div :class="{ 'is-open': isVisible }" class="modal-overlay">

        <Transition name="modal-drop-view">

            <div v-if="isVisible" class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    
                    <div class="modal-header">
                        <h5 class="modal-title mb-2">Detalles de la Entidad:</h5>
                    </div>

                    <div class="modal-body">
                        <div class="row g-3">
                            
                            <div class="col-12">
                                <div class="card" style="background-color: #8215b4; color: white;">
                                    <div class="card-body d-flex justify-content-between align-items-center">
                                        <h5 class="card-title mb-0"><i :class="entityIcon"></i> {{ entityData?.nombre }} {{ entityData?.apellido }}</h5>
                                        <span :class="entityData?.estado ? 'badge bg-success' : 'badge bg-danger'">
                                            {{ entityData?.estado ? 'ACTIVO' : 'INACTIVO' }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="card" style="border-color:#8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">🆔 Datos de Identificación</h6>
                                        <dl class="row mb-0">

                                            <dt class="col-sm-6 col-lg-3">Tipo de entidad</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ entityData?.tipo_entidad.nombre }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Tipo de identificación</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ entityData?.tipo_identificacion.nombre }}</dd>
                                            
                                            <dt class="col-sm-6 col-lg-3">Número de identificación</dt>
                                            <dd class="col-sm-6 col-lg-3">
                                                {{ entityData?.prefijo.letra_prefijo ? entityData.prefijo.letra_prefijo + '-' : '' }}{{ entityData?.numero_identificacion }}
                                            </dd>
                                            
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card h-100" style="border-color: #8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        
                                        <h6 class="card-subtitle mb-3" style="color: #8A2BE2;">📧 Contacto</h6>
                                        
                                        <dl class="row mb-0">
                                            
                                            <dt class="col-12 col-lg-3 text-dark">Email</dt>
                                            <dd class="col-12 col-lg-9">{{ entityData?.email }}</dd>
                                            
                                            <dt class="col-12 col-lg-3 text-dark">Teléfono</dt>
                                            <dd class="col-12 col-lg-9">{{ entityData?.telefono }}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card h-100" style="border-color: #8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">📍 Dirección</h6>
                                        <p class="card-text">{{ entityData?.direccion }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="card" style="border-color: #8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">👮‍♂️ Auditoría</h6>
                                        <dl class="row mb-0">
                                            <dt class="col-sm-3">Fecha de creación</dt>
                                            <dd class="col-sm-3">{{ formatDateTime(entityData?.fechaCreacion)}}</dd>

                                            <dt class="col-sm-3">Última fecha de modificación</dt>
                                            <dd class="col-sm-3">{{ formatDateTime(entityData?.fechaActualizacion) }}</dd>
                                            
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary mt-3" @click="emit('close')">Cerrar</button>
                    </div>
                </div>
            </div>



        </Transition>
       
    </div>

</template>

<style scoped>

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


/* ------------------------------------------------------------------- */
/* MEDIA QUERY: Tamaño para Pantallas Medianas (Mínimo 768px - Tablet/Desktop) */
/* ------------------------------------------------------------------- */
@media (min-width: 768px) {
    .modal-content {
        /* Permite que el modal se extienda más en pantallas grandes */
        width: 80%; /* Ocupa el 80% del ancho de la pantalla */
        max-width: 900px; /* Nuevo ancho máximo para escritorio */
        /* Si quieres un modal aún más grande, usa '1100px' o '1200px' */
    }
}
</style>