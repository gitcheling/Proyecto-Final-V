<template>

    <div :class="{ 'is-open': isVisible }" class="modal-overlay">

        <Transition name="modal-drop-view">

            <div v-if="isVisible" class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    
                    <div class="modal-header">
                        <h5 class="modal-title mb-3">Detalles de la Inscripción:</h5>             
                    </div>

                    <div class="modal-body">
                        <div class="row g-3">
                                                 

    
                            <div class="col-12">
                                <div class="card" style="border-color:#8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">🧑 Datos del Estudiante</h6>
                                        <dl class="row mb-0 align-items-center">

                                            <dt class="col-sm-6 col-lg-3">Código Estudiantil</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ Data?.estudiante.codigo_estudiantil }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Nombre y Apellido</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ Data.estudiante.entidad.nombre }} {{ Data.estudiante.entidad.apellido }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Número de Identificación</dt>
                                            <dd class="col-sm-6 col-lg-3"> {{ Data.estudiante.entidad.prefijo }}-{{ Data.estudiante.entidad.numero_identificacion }}</dd>

                                            
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            

                            <div class="col-12">
                                <div class="card" style="border-color:#8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">👥 Datos del Grupo</h6>
                                        <dl class="row mb-0 align-items-center">

                                            <dt class="col-sm-6 col-lg-3">Nombre</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ Data?.grupo.nombre }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Cupo Máximo</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ Data?.grupo.cupo_maximo }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Estado</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ Data?.grupo.estado.nombre }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Periodo</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ Data?.grupo.periodo.nombre }}</dd>
                                          
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="card" style="border-color:#8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">💼 Datos del Docente Asignado al Grupo</h6>
                                        <dl class="row mb-0 align-items-center">

                                            <dt class="col-sm-6 col-lg-3">Nombre y Apellido</dt>
                                            <dd class="col-sm-6 col-lg-3">{{ Data.grupo.docente.entidad.nombre }} {{ Data.grupo.docente.entidad.apellido }}</dd>

                                            <dt class="col-sm-6 col-lg-3">Número de Identificación</dt>
                                            <dd class="col-sm-6 col-lg-3"> {{ Data.grupo.docente.entidad.prefijo }}-{{ Data.grupo.docente.entidad.numero_identificacion }}</dd>
        
                                            
                                        </dl>
                                    </div>
                                </div>
                            </div>

                          
                            <div class="col-12">
                                <div class="card" style="border-color: #8A2BE2; border-width: 2px;">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2" style="color: #8A2BE2;">👮‍♂️ Auditoría</h6>
                                        <dl class="row mb-0 align-items-center">
                                            
                                            <dt class="col-sm-3">Fecha de Creación</dt>
                                            <dd class="col-sm-3">{{ formatDateTime(Data?.fechaCreacion)}}</dd>

                                            <dt class="col-sm-3">Última Modificación</dt>
                                            <dd class="col-sm-3">{{ formatDateTime(Data?.fechaActualizacion) }}</dd>
                                            
                                        </dl>
                                    </div>
                                </div>
                            </div>



                        </div>
                    </div>

                    <div class="modal-footer mt-2">
                        <button @click="openModal"
                                class="me-3"
                                :class="['btn', isCycleClosed ? 'btn-secondary' : 'btn-pink-custom']" 
                                :disabled="isCycleClosed" title="Editar Estado de la Inscripción">
                                <i class="bi bi-pencil-square me-2"></i> Editar Inscripción
                        </button>

                        <button type="button" class="btn btn-outline-secondary-custom" @click="emit('close')">
                            <i class="bi bi-x-circle me-1"></i>Cancelar
                        </button>
                    </div>

                    
                </div>
            </div>



        </Transition>

        <FormModal
        :isVisible="isModalVisible"
        :initialData="Data" 
        @close="closeModal"
        @update-registration="updateRegistration"
        />

       
    </div>

</template>

<script setup>

    import { defineProps, defineEmits, ref, watch, computed, onMounted } from 'vue';

    // Se importa el hook de las notificaciones toast
    import { useToast } from '../../services/notificacionesService';

    // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
    const { exito, error, info, warning } = useToast();

    import api from '../../services/api';

    import FormModal from './FormularioInscripcionView.vue';

    // Rutas
        const rutaBase = "/Inscripcion/";

        // Modificar
        const rutaModificar = `${rutaBase}Modificar`

    const props = defineProps({
        isVisible: { type: Boolean, required: true },
        Data: { type: Object, default: null } 
    });

    // Ésta variable reactiva permitirá controlar la visibilidad del modal
    const isModalVisible = ref(false);

    const emit = defineEmits(['close']);

    /**
     * Propiedad computada que verifica si la inscripción actual tiene el ciclo cerrado.
     * Retorna true si el estado de la inscripción tiene 'ciclo_cerrado' en 'true'.
     */
    const isCycleClosed = computed(() => {
        // Asegúrate de que Data, Data.estado y Data.estado.ciclo_cerrado existen
        if (props.Data && props.Data.estado && props.Data.estado.ciclo_cerrado === true) {
            return true;
        }
        return false;
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


     // ----------------------------------- Modal ----------------------------------------

            /**
            * Abre el modal y lo configura en modo Creación.
            * @param {object|null} account - El objeto de cuenta para editar, o null para crear.
            */
            const openModal = () => {

                // En cualquier caso, el modal debe hacerse visible
                isModalVisible.value = true;

            };

            /**
            * Cierra el modal y resetea el estado de edición.
            */
            const closeModal = () => {

                // Modal oculto
                isModalVisible.value = false;

            };

    
            /**
             * Maneja el evento 'update-registration' del modal llamando a la API.
             */
            const updateRegistration = async (updatedData) => {
    
                try {

                    const response = await api.put(`${rutaModificar}/${updatedData.id}`, updatedData);

                    exito('Éxito', 'Inscripción modificada correctamente.');

                    // 4. Cerrar el modal.
                    closeModal();

                    emit('close');


                }catch (err) {

                    // Definición de la descripción de error
                    let mensajeError = 'Error desconocido al procesar la solicitud.';

                    // 1. Manejo de errores de Axios (si existe la respuesta del servidor)
                    if (err.response) {
                        // Se usa el mensaje que viene del backend o el estado HTTP
                        mensajeError = err.response.data.message || `Error ${err.response.status}: ${err.message}`;
                    } 

                    // 2. Manejo de otros errores (ej. error de red, o si no hay respuesta)
                    else if (err.message) {
                        mensajeError = err.message;
                    }

                    error('Error al modificar el grupo', mensajeError);
                }
            };


</script>

<style scoped>
    /* --- NUEVO ESTILO: BOTÓN ROSA --- */
.btn-pink-custom {
    --bs-btn-color: #fff;
    --bs-btn-bg: #e83ebe; /* Un tono rosa fuerte */
    --bs-btn-border-color: #E83E8C;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #c93397; /* Un poco más oscuro al pasar el mouse */
    --bs-btn-hover-border-color: #C93378;
    --bs-btn-active-bg: #B02A64;
    --bs-btn-active-border-color: #B02A64;
    --bs-btn-disabled-bg: #E83E8C; /* Mantiene el color base, pero está deshabilitado por Bootstrap */
    --bs-btn-disabled-border-color: #E83E8C;
}

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