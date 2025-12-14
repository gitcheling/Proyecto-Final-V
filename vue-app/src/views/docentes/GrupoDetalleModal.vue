<template>
    <div :class="{ 'is-open': isVisible }" class="modal-backdrop-custom">
        <Transition name="modal-drop">
            <div v-if="isVisible" class="modal-dialog-custom">
                <div class="modal-content-custom">
                    
                    <div class="modal-header-custom">
                        <h5 class="modal-title-custom">
                            <i class="bi bi-layers me-2"></i> 
                            Detalles del Grupo
                        </h5>
                        <button type="button" class="btn-close-custom" @click="closeModal">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <div class="modal-body-custom">
                        <div v-if="loadingGroup" class="text-center py-5">
                            <div class="spinner-border text-primary-custom" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="mt-3">Cargando datos completos del grupo ID: {{ groupId }}</p>
                        </div>

                        <div v-else-if="groupDetails">

                            <div class="card card-compact mb-3 border-primary-custom hover-lift">
                                <div class="card-header bg-light-purple-custom fw-bold d-flex justify-content-between align-items-center">
                                    <i class="bi bi-info-circle me-2"></i> 
                                    Información del Grupo
                                </div>
                                <div class="card-body detail-card-body">
                                    <div class="row">
                                        <dl class="col-12">
                                            <dt>Nombre:</dt>
                                            <dd class="fw-bold">{{ groupDetails.nombre || 'N/A' }}</dd>
                                        </dl>
                                        
                                        <dl class="col-md-6">
                                            <dt>Estado:</dt>
                                            <dd>
                                                <span :class="['badge', getEstadoBadge(groupDetails.estado?.nombre)]">
                                                    {{ groupDetails.estado?.nombre || 'N/A' }}
                                                </span>
                                                <small v-if="groupDetails.estado?.permite_inscripcion === 'Si'">  (Inscripciones Abiertas)</small>
                                                <small v-else>(Inscripciones Cerradas)</small>
                                            </dd>
                                        </dl>



                                        <dl class="col-md-3">
                                            <dt>Modalidad:</dt>
                                            <dd>
                                                <span :class="['badge', getModalidadBadge(groupDetails.modalidad?.nombre)]">
                                                    {{ groupDetails.modalidad?.nombre || 'N/A' }}
                                                </span>      
                                            </dd>
                                        </dl>

                                        <dl class="col-md-3">
                                            <dt>Cupo Máximo:</dt>
                                            <dd>
                                            {{ groupDetails.cupo_maximo || 0 }} estudiantes
                                            </dd>
                                        </dl>

                                    </div>
                                </div>
                            </div>

                            <div class="card card-compact mb-3 hover-lift">
                                <div class="card-header bg-light-purple-custom fw-bold">
                                    <i class="bi bi-clock"></i> Período
                                </div>
                                <div class="card-body detail-card-body">
                                    <div class="row">

                                        <dl class="col-md-4">
                                            <dt>Período Académico:</dt>
                                            <dd>{{ groupDetails.periodo?.nombre || 'N/A' }}</dd>
                                        </dl>
                                        <dl class="col-md-4">
                                            <dt>Fecha de Inicio:</dt>
                                            <dd>
                                                {{ groupDetails.periodo?.inicio ? formatDateTime(groupDetails.periodo.inicio).split(' ')[0] : 'N/A' }}
                                            </dd>
                                        </dl>

                                        <dl class="col-md-4">
                                            <dt>Fecha de Finalización:</dt>
                                            <dd>
                                                {{ groupDetails.periodo?.fin ? formatDateTime(groupDetails.periodo.fin).split(' ')[0] : 'N/A' }}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div class="card card-compact hover-lift">
                                <div class="card-header bg-light-purple-custom fw-bold">
                                    <i class="bi bi-journal-bookmark me-2"></i> Curso y Costos
                                </div>
                                <div class="card-body detail-card-body">
                                    <div class="row">
                                        <dl class="col-12">
                                            <dt>Nombre del Curso:</dt>
                                            <dd>{{ groupDetails.curso?.nombre || 'N/A' }}</dd>
                                        </dl>

                                        <dl class="col-md-6">
                                            <dt>Categoría:</dt>
                                            <dd>{{ groupDetails.curso?.categoria?.categoria_padre?.nombre || 'N/A' }}</dd>
                                        </dl>

                                        <dl class="col-md-6">
                                            <dt>Sub-Categoría:</dt>
                                            <dd>{{ groupDetails.curso?.categoria?.nombre || 'N/A' }}</dd>
                                        </dl>

                                        <dl class="col-md-6">
                                            <dt>Costo de Inscripción:</dt>
                                            <dd class="fw-bold text-success">${{ parseFloat(groupDetails.costo_inscripcion || 0).toFixed(2) }}</dd>
                                        </dl>

                                        <dl class="col-md-6">
                                            <dt>Costo por Cada Clase:</dt>
                                            <dd class="fw-bold text-success">${{ parseFloat(groupDetails.costo_clase || 0).toFixed(2) }}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                        </div>

                        
                        <div v-else-if="errorLoading" class="alert alert-danger text-center">
                            <h4 class="alert-heading">¡Error al Cargar!</h4>
                            <p>No se pudo obtener la información completa del grupo. Intente de nuevo más tarde.</p>
                        </div>
                        
                    </div>

                    <div class="modal-footer-custom">
                        <button type="button" class="btn btn-outline-secondary-custom" @click="closeModal">Cerrar</button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>

    import { ref, watch } from 'vue';
    import api from '../../services/api'; // Asegúrate de que esta ruta sea correcta

    // Ruta base para obtener los detalles de un grupo
    const rutaBaseGrupo = "/Grupo/"; 

    const props = defineProps({
        isVisible: Boolean,
        groupId: [Number, String]
    });

    const emit = defineEmits(['close', 'error-load']);

    const groupDetails = ref(null);
    const loadingGroup = ref(false);
    const errorLoading = ref(false);

    // ----------------------------------- Funciones API ----------------------------------------

    /**
     * Realiza la llamada a la API para buscar los detalles completos del grupo.
     * @param {number} id - El ID del grupo a buscar.
     */
    const fetchGroupDetails = async (id) => {
        if (!id || !props.isVisible) {
            groupDetails.value = null;
            return;
        }

        loadingGroup.value = true;
        errorLoading.value = false;
        groupDetails.value = null;

        try {
            // Llama al endpoint específico del grupo
            const response = await api.get(`${rutaBaseGrupo}${id}`); 
            groupDetails.value = response.data.data;

        } catch (err) {
            const message = err.response?.data?.message || 'Error de red o servidor.';
            errorLoading.value = true;
            // Emitir el error al padre para que muestre la notificación de Toast
            emit('error-load', message);
            
            // Cerrar el modal automáticamente si hay un error grave de carga
            // Esto previene que el usuario vea un modal vacío o con error.
            closeModal(); 

        } finally {
            loadingGroup.value = false;
        }
    };

    // ----------------------------------- Interfaz y Lógica ----------------------------------------

    /**
     * Cierra el modal y notifica al padre.
     */
    function closeModal() {
        emit('close');
        // Limpiar detalles al cerrar, pero conservando el ID para la próxima apertura rápida
        groupDetails.value = null;
        errorLoading.value = false;
    }

    /**
     * Observa cuando el ID del grupo cambia o cuando el modal se hace visible con un ID.
     * Esto dispara la carga de datos.
     */
    watch([() => props.isVisible, () => props.groupId], ([newVisibility, newId]) => {
        if (newVisibility && newId) {
            // Solo cargar si es visible y tiene un ID
            fetchGroupDetails(newId);
        }
    });


    // ----------------------------------- Auxiliar ----------------------------------------

    /**
     * Función auxiliar para asignar una clase de badge basada en la modalidad
     * @param {string} modalidad - El nombre de la modalidad.
     */
    const getModalidadBadge = (modalidad) => {
        if (!modalidad) return 'bg-secondary';
        switch (modalidad.toLowerCase()) {
            case 'online':
                return 'bg-success';
            case 'presencial':
                return 'bg-primary';
            case 'híbrida':
                return 'bg-warning text-dark';
            default:
                return 'bg-secondary';
        }
    };

    /**
     * Función auxiliar para asignar una clase de badge basada en el estado
     * @param {string} estado - El nombre del estado.
     */
    const getEstadoBadge = (estado) => {
        if (!estado) return 'bg-secondary';
        switch (estado.toLowerCase()) {
            case 'planificado':
                return 'bg-info text-dark';
            case 'en curso':
                return 'bg-success';
            case 'finalizado':
                return 'bg-danger';
            case 'suspendido':
                return 'bg-warning text-dark';
            default:
                return 'bg-light text-dark';
        }
    };


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

<style scoped>
    

.modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(123, 25, 168, 0.2); /* Morado Oscuro con transparencia */
    backdrop-filter: blur(3px); /* Efecto de desenfoque */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    
    /* ANIMACIÓN DE FONDO Y VISIBILIDAD */
    opacity: 0; 
    pointer-events: none; /* No clickeable cuando está cerrado */
    transition: opacity 0.5s ease; /* Transición suave del fondo */
    overflow: hidden; /* Importante para que la animación no cause barras de desplazamiento */
}

/* CLASE QUE ACTIVA EL FONDO Y LO HACE VISIBLE */
.modal-backdrop-custom.is-open {
    opacity: 1;
    pointer-events: auto; /* Permite clics cuando está abierto */
}

.modal-dialog-custom {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    
    /* ******** APLICANDO LA CORRECCIÓN DE TAMAÑO ******** */
    max-width: 700px; /* Ancho máximo para pantallas grandes */
    width: 90%;      /* Asegura que sea responsivo en móviles */
    margin: 1.75rem auto; /* Centrado vertical y horizontalmente */
    /* *************************************************** */
}

.modal-content-custom {
    border: none;
    border-radius: 12px;
    overflow: hidden;
    
}

.modal-header-custom {
    padding: 1rem 1.5rem;
    border-bottom: 2px solid #e91e63; /* Rosa Intenso */
    background-color: #f3e5f5; /* Lavanda Claro */
    color: #4a148c; /* Morado Oscuro para el texto */
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title-custom {
    margin-bottom: 0;
    font-weight: 700;
}
.modal-title-custom i {
    color: #7b19a8;
}

.btn-close-custom {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #e91e63; /* Rosa Intenso */
    opacity: 0.8;
    transition: opacity 0.2s;
}
.btn-close-custom:hover {
    opacity: 1;
}

.modal-body-custom {
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-footer-custom {
    padding: 1rem 1.5rem;
    text-align: right;
}

.btn-secondary-custom {
    background-color: #ab47bc; /* Morado Claro */
    border-color: #ab47bc;
    color: white;
    font-weight: 600;
    transition: background-color 0.2s, border-color 0.2s;
}
.btn-secondary-custom:hover {
    background-color: #7b19a8; /* Morado Oscuro */
    border-color: #7b19a8;
}

/* Estilos de la lista de detalles dentro del modal */
/* --- ESTILOS PARA TARJETAS COMPACTAS (Opción 3) --- */

.card-compact {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
}

.bg-light-purple-custom {
    background-color: #f3e5f5 !important; /* Mismo color Lavanda Claro que el header */
    color: #4a148c;
    border-bottom: 1px solid #e1bee7; /* Borde más suave */
    padding: 0.5rem 1rem; /* Padding más pequeño para reducir altura */
    font-size: 0.95rem;
}

.border-primary-custom {
    border-left: 5px solid #7b19a8 !important; /* Borde vertical llamativo para la Card principal */
}

/* Reducción de espacio dentro del cuerpo de la tarjeta */
.detail-card-body {
    padding: 0.75rem 1rem !important;
}

.detail-card-body dt {
    color: #7b19a8;
    font-weight: 600;
    margin-bottom: 0.2rem;
    font-size: 0.9rem;
}
.detail-card-body dd {
    margin-left: 0;
    margin-bottom: 0.75rem; /* Espacio reducido entre valores */
    font-size: 1rem;
}

/* Asegura que el footer/tiempo de sistema sea compacto */
.detail-list-group-compact {
    margin-bottom: 0 !important;
}

/* Estilos de Botones */
.btn-outline-secondary-custom {
    --bs-btn-color: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #6c757d;
    --bs-btn-hover-border-color: #6c757d;
}


/* ------------------------------------------------ */
/* ESTILOS DE TRANSICIÓN DEL CONTENEDOR (Drop-down) */
/* ------------------------------------------------ */

/* Estado Activo (ENTRADA) */
.modal-drop-enter-active {
    /* Duración de la caída: 0.6s */
    transition: all 0.6s ease-out; 
    /* ATRASO: Espera 0.4s (para que el fondo se oscurezca primero) */
    transition-delay: 0.4s; 
}

/* Estado Activo (SALIDA) */
.modal-drop-leave-active {
    /* Duración de la subida: 0.6s */
    transition: all 0.6s ease-in; 
    /* SIN ATRASO: Sube inmediatamente */
    transition-delay: 0s; 
}

/* Estado Inicial (Entrada) / Estado Final (Salida): Posición fuera de pantalla */
.modal-drop-enter-from,
.modal-drop-leave-to {
    transform: translateY(-100vh); 
    opacity: 0; 
}

/* Estado Final (Entrada) / Estado Inicial (Salida): Posición normal */
.modal-drop-enter-to {
    transform: translateY(0); 
    opacity: 1; 
}
</style>