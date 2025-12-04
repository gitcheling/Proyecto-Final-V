<template>
    <div :class="{ 'is-open': isVisible }" class="modal-backdrop-custom">

        <Transition name="modal-drop">

            <div v-if="isVisible" class="modal-content-custom">

                    
                    <div class="modal-header-custom">
                        <h4 class="modal-title-custom">
                            <i class="bi bi-people-fill me-2"></i> 
                            Entidades Asociadas a la Cuenta
                        </h4>
                        <button type="button" class="btn-close-custom" @click="$emit('close')" aria-label="Cerrar"></button>
                    </div>
                    
                    <div class="modal-body-custom">
                        
                        <p class="account-summary-title">
                            <span class="fw-bold">Número de Cuenta:</span> {{ accountData?.numero_cuenta || 'N/A' }}                 
                        </p>
                        <p class="account-summary-title">
                            <span class="fw-bold">Banco:</span> {{ accountData?.banco?.nombre || 'N/A' }}                
                        </p>
                        <p class="account-summary-title">
                            <span class="fw-bold">Tipo de Cuenta:</span> {{ accountData?.tipo_cuenta?.nombre || 'N/A' }}                
                        </p>
                        <p class="account-summary-title">
                            <span class="fw-bold">Estado de la Cuenta:</span>
                            
                            <span 
                                class="badge text-white ms-2" 
                                :class="getAccountStatusBadge(accountData?.estado?.nombre)"
                            >
                                {{ accountData?.estado?.nombre || 'N/A' }}
                            </span>              
                        </p>


                        <hr class="separator-pink">
                        
                        <div v-if="isModalLoading" class="text-center py-4">
                            <div class="spinner-border text-primary-custom" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="mt-2">Cargando entidades asociadas...</p>
                        </div>
                        
                        <div v-else-if="associatedEntities.length === 0" class="alert alert-purple-info text-center mt-3">
                            <i class="bi bi-info-circle me-1"></i> No se encontraron entidades asociadas a esta cuenta.
                        </div>
                        
                        
                        <div v-else class="associated-entities-list">
                            <div 
                                v-for="item in associatedEntities" 
                                :key="item.asociacion.id_asociacion" 
                                class="card mb-3 associated-entity-card hover-lift"
                            >
                                <div class="card-body py-3">
                                    
                                    <div class="row align-items-center h-100"> 
                                        
                                        <div class="col-md-8">
                                            <h5 class="entity-name mb-1">
                                                <i class="bi me-2" :class="getEntityIconClass(item.entidad.prefijo.letra_prefijo)"></i>
                                                {{ item.entidad.nombre }} {{ item.entidad.apellido }}
                                            </h5>
                                            <p class="text-muted small mb-1">
                                                {{ item.entidad.prefijo.letra_prefijo }}-{{ item.entidad.numero_identificacion }}
                                            </p>
                                            
                                            <p class="mb-0 small fw-bold">
                                                Vigencia de la Asociación:
                                                <span 
                                                    class="status-badge ms-1" 
                                                    :class="{ 
                                                        'status-active': item.asociacion.es_vigente, 
                                                        'status-inactive': !item.asociacion.es_vigente 
                                                    }"
                                                >
                                                    {{ item.asociacion.es_vigente ? 'Vigente' : 'No Vigente' }}
                                                </span>
                                            </p>
                                        </div>

                                        <div class="col-md-4 h-100 d-flex flex-column align-items-end px-3">
                                            
                                            <span class="badge badge-rol-name mb-4">
                                                <i class="bi bi-bookmark-fill me-1"></i>
                                                {{ item.asociacion.rol }}
                                            </span>
                                            
                                            <button 
                                                type="button" 
                                                class="btn btn-sm my-auto mt-2" 
                                                :class="item.asociacion.es_vigente ? 'btn-danger' : 'btn-success'"
                                                @click="toggleAccountAssociation(item)"
                                            >
                                                <i class="bi" :class="item.asociacion.es_vigente ? 'bi-lock-fill' : 'bi-unlock-fill'"></i>
                                                {{ item.asociacion.es_vigente ? 'Desactivar' : 'Activar' }}
                                            </button>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    
                    <div class="modal-footer-custom">
                        <button type="button" class="btn btn-outline-secondary-custom" @click="$emit('close')">
                            <i class="bi bi-x-circle me-1"></i> Cerrar
                        </button>
                    </div>

            </div>

        </Transition>

    </div>
</template>

<script setup>
    // ----------------------------------- Importaciones ----------------------------------------

        import { ref, watch, defineProps, defineEmits } from 'vue';
        import api from '../../services/api'; 
        import { useToast } from '../../services/notificacionesService'; 

    // ----------------------------------- Variables ----------------------------------------

        const { error, exito} = useToast();

        // Rutas
            const rutaBaseAsociacion = "/EntidadCuentaAsociacion/";

            const rutaEntidadesAsociadas = `${rutaBaseAsociacion}ObtenerEntidadesAsociadas/`;

            const rutaCambiarEstadoAsociacion = `${rutaBaseAsociacion}CambiarEstado/`;


        defineEmits(['close']);

        const props = defineProps({
            isVisible: Boolean,
            cuentaId: [String, Number], // Se usa para la llamada a la API
            accountData: Object // Se usa para mostrar el número de cuenta y el banco
        });



        const associatedEntities = ref([]); // Almacenará el array 'data' del JSON
        const isModalLoading = ref(false);


    // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- API ----------------------------------------

            /**
             * Carga los datos de las entidades asociadas a la cuenta
             * usando el cuentaId
             */
            const fetchAssociatedEntities = async (id) => {
                if (!id) return;
                
                isModalLoading.value = true;
                associatedEntities.value = [];
                
                try {
                    // Llama al endpoint que trae las asociaciones dada la CUENTA ID
                    const response = await api.get(`${rutaEntidadesAsociadas}${id}`);
                    
                    // Asignamos el array 'data' del JSON a la variable asociada
                    associatedEntities.value = response.data.data;
                    
                } catch (err) {
                    console.error('Error al cargar entidades asociadas:', err);
                    error('Error de API', 'No se pudieron cargar las entidades asociadas a esta cuenta.');
                } finally {
                    isModalLoading.value = false;
                }
            };

            /**
             * Cambia el estado de asociación (activo/inactivo) de una cuenta bancaria con el estudiante.
             * @param {object} account - El objeto de cuenta asociada a modificar, el cual contiene el sub-objeto 'asociacion'.
             */
            const toggleAccountAssociation = async (account) => {

                // Determinar el nuevo estado (lo contrario al estado actual)
                const newStatus = !account.asociacion.es_vigente;
                
                const action = newStatus ? 'activada' : 'desactivada';

                // 2. Bloquear la UI si es necesario (opcional, no incluido, pero recomendable)
                // account.isChangingStatus = true; 

                try {
                    // Id de la asociación
                    const associationId = account.asociacion.id_asociacion; 
                    
                    await api.put(`${rutaCambiarEstadoAsociacion}${associationId}`, {         
                        nuevoEstado: newStatus 
                    });

                    // 4. Si es exitoso, actualizar el estado local (esto es reactivo y actualiza la UI)
                    account.asociacion.es_vigente = newStatus;
                    
                    exito('Éxito', `La asociación de la cuenta ha sido ${action} correctamente.`);

                } catch (err) {
                    
                    error(
                        'Error al cambiar la asociación', 
                        `No se pudo ${newStatus ? 'activar' : 'desactivar'} la asociación. ${err.response?.data?.message || 'Error de servidor.'}`
                    );
                    console.error('Error de API al cambiar estado de asociación:', err);
                }

            }

        // ----------------------------------- Watchers ----------------------------------------

            // Observa la prop 'cuentaId' y llama a la API cuando el modal es visible y el ID cambia/existe.
            watch(() => props.cuentaId, (newId) => {
                if (props.isVisible && newId) {
                    fetchAssociatedEntities(newId);
                }
            });

            // También podemos reaccionar a si el modal se abre para recargar los datos
            watch(() => props.isVisible, (newVal) => {
                if (newVal && props.cuentaId) {
                    fetchAssociatedEntities(props.cuentaId);
                } else if (!newVal) {
                    // Opcional: limpiar datos al cerrar
                    associatedEntities.value = [];
                }
            });


        // ----------------------------------- Iconos ----------------------------------------

            /**
             * Determina la clase del icono de Bootstrap basada en la letra del prefijo.
             * @param {string} letraPrefijo - La letra de prefijo (e.g., 'J', 'G').
             * @returns {string} La clase de Bootstrap Icon para el prefijo.
             */
            const getEntityIconClass = (letraPrefijo) => {
                switch (letraPrefijo?.toUpperCase()) {
                    case 'J': // Jurídico (Empresa)
                        return 'bi-building';
                    case 'G': // Gubernamental (Gobierno)
                        return 'bi-bank2'; // O 'bi-buildings' o 'bi-house-door-fill'
                    default: // Natural (Persona)
                        return 'bi-person-fill';
                }
            };


            /**
             * Función auxiliar para asignar una clase de badge basada en el estado de la cuenta.
             * @param {string} statusName - El nombre del estado de la cuenta (e.g., 'Activa', 'Cerrada').
             * @returns {string} La clase CSS de Bootstrap y personalizada a aplicar.
             */
            const getAccountStatusBadge = (statusName) => {
                // Maneja casos nulos/indefinidos
                if (!statusName) {
                    return 'bg-secondary';
                }

                switch (statusName) {
                    case 'Activa': // Cuenta que funciona normalmente
                        return 'badge-account-active';
                    case 'Inactiva': // Cuenta no utilizada, pero puede reactivarse
                        return 'badge-account-inactive';
                    case 'Bloqueada': // Cuenta con restricciones temporales
                        return 'badge-account-blocked';
                    case 'Cerrada': // Cuenta terminada permanentemente
                        return 'badge-account-closed';
                    case 'Pendiente de Validación': // En espera de aprobación
                        return 'badge-account-waiting';
                    default:
                        return 'bg-secondary';
                }
            };



</script>


<style scoped>

/* -------------------- Estilos del Modal Base -------------------- */
.modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050; /* Mayor que cualquier navbar o elemento fijo */

    opacity: 0; 
    pointer-events: none; 
    transition: opacity 0.5s ease; /* Duración de la atenuación del fondo */
}

.modal-backdrop-custom.is-open {
    opacity: 1;
    pointer-events: auto; /* Permite que el fondo intercepte los clics */
}

.modal-content-custom {
    background: #fff;
    border-radius: 8px;
    padding: 25px;
    width: 90%;
    max-width: 750px; /* Tamaño más grande para listar datos */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.modal-title-custom {
    color: #a110a7; /* Color principal */
    font-weight: 600;
}

.btn-close-custom {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #333;
    cursor: pointer;
}

.modal-body-custom {
    padding-top: 20px;
}

.modal-footer-custom {
    padding-top: 20px;
    text-align: right;
    border-top: 1px solid #eee;
}

/* -------------------- Estilos Específicos de la Lista -------------------- */
.account-summary-title {
    font-size: 1.1rem;
    color: #4a4a4a;
    margin-bottom: 10px;
}

.separator-pink {
    border-color: #fce4ec; /* Rosa muy claro */
    margin-top: 0;
}

.associated-entity-card {
    border-left: 5px solid #ab47bc; /* Morado para destacar */
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
}

.associated-entity-card:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.entity-name {
    color: #333;
    font-size: 1.15rem;
    font-weight: 600;
}

.badge-rol-name {
    background-color: #740e88; /* Color del rol, oscuro */
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    display: inline-block;
}

/* Estilos de Estado (Ya definidos, pero aseguramos su uso aquí) */
.status-badge {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-active {
    background-color: #e8f5e9; /* Verde claro */
    color: #18771b; /* Verde oscuro */
}

.status-inactive {
    background-color: #ffebee; /* Rojo claro */
    color: #c42222; /* Rojo oscuro */
}

/* Estilos de Botones */
.btn-outline-secondary-custom {
    --bs-btn-color: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #6c757d;
    --bs-btn-hover-border-color: #6c757d;
}


/* -------------------- Estilos de Badges de Estado de Cuenta -------------------- */
.badge {
    padding: 6px 10px;
    font-size: 0.9em;
    font-weight: 600;
    border-radius: 4px;
    text-transform: uppercase;
}

.badge-account-active {
    background-color: #28a745; /* Verde */
}

.badge-account-inactive {
    background-color: #ffc107; /* Amarillo/Naranja */
    color: #333 !important; /* Asegura el contraste del texto */
}

.badge-account-blocked {
    background-color: #dc3545; /* Rojo */
}

.badge-account-closed {
    background-color: #6c757d; /* Gris */
}

.badge-account-waiting {
    background-color: #2e80c7; /* Azul */
}



/* ------------------------------------------------ */
/* ESTILOS DE TRANSICIÓN: EFECTO DROP (CAÍDA) 💧 */
/* ------------------------------------------------ */

/* Estado Activo (ENTRADA) y (SALIDA) */
.modal-drop-enter-active,
.modal-drop-leave-active {
    transition: all 0.6s ease-out; /* Misma duración y curva que tu 2do archivo */
}

/* Estado Activo (ENTRADA): ATRASO EN LA CAÍDA */
.modal-drop-enter-active {
    /* El contenido espera 0.4s para empezar a caer (el fondo ya empezó a oscurecer) */
    transition-delay: 0.4s; 
}

/* Estado Activo (SALIDA): SIN ATRASO */
.modal-drop-leave-active {
    /* El contenido empieza a subir inmediatamente */
    transition-delay: 0s; 
}

/* Estado Inicial (Entrada) / Estado Final (Salida): Posición fuera de pantalla */
.modal-drop-enter-from,
.modal-drop-leave-to {
    transform: translateY(-100vh); 
    opacity: 0; /* Aseguramos que inicie/termine invisible */
}

/* Estado Final (Entrada) / Estado Inicial (Salida): Posición normal */
.modal-drop-enter-to {
    transform: translateY(0); 
    opacity: 1; 
}

/* ------------------------------------------------ */
/* EFECTO DE APARICIÓN SUAVE DEL CONTENIDO (Interno) */
/* ------------------------------------------------ */

/* Aplicamos una transición rápida de opacidad a los hijos directos del contenido */
.modal-content-custom > * {
    transition: opacity 0.3s ease-out; /* Transición de opacidad */
    opacity: 1; /* Estado final */
}

/* OCULTAR EL CONTENIDO EN LOS ESTADOS DE MOVIMIENTO (Al iniciar la caída o antes de terminar la subida) */
.modal-drop-enter-from .modal-content-custom > *,
.modal-drop-leave-to .modal-content-custom > * {
    opacity: 0;
}

/* HACER APARECER EL CONTENIDO (ENTER): Despliegue */
.modal-drop-enter-active .modal-content-custom > * {
    opacity: 1;
    /* 3. ATRASO LARGO: Aparece después de que el modal terminó de caer (0.4s + 0.6s = 1s) */
    transition-delay: 1.0s; 
}

/* HACER DESAPARECER EL CONTENIDO (LEAVE): Despliegue */
.modal-drop-leave-active .modal-content-custom > * {
    /* El contenido desaparece inmediatamente (0s delay) antes de que el modal suba */
    transition-delay: 0s; 
    opacity: 0;
}

</style>