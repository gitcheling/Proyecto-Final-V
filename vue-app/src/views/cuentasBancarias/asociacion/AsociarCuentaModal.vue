<template>
    <div :class="{ 'is-open': isVisible }" class="modal-overlay" @click.self="$emit('close')">
        
        <Transition name="modal-drop">
            <div v-if="isVisible" class="modal-content">
                
                <h3 class="mb-4">Asociar Cuentas Bancarias</h3>
                
                <div class="alert alert-info" v-if="cuentasAsociadasCount > 0 && puedeAsociar">
                    Este {{ entidadRol ? entidadRol : "cliente"}} ya tiene <span class="cantidad_cuentas">{{ cuentasAsociadasCount }}</span> cuenta(s) asociada(s). 
                    Puede asociar hasta <span class="cantidad_cuentas">{{ MAX_CUENTAS_PERMITIDAS }}</span> en total.
                </div>
                
                <div class="alert alert-danger" v-if="!puedeAsociar">
                    LÍMITE ALCANZADO: No se pueden asociar más de <span class="cantidad_cuentas">{{ MAX_CUENTAS_PERMITIDAS }}</span> cuentas.
                </div>

                <form @submit.prevent="submitAssociation">
                    
                    <div class="form-group mb-3" v-if="puedeAsociar">
                        
                        <label for="searchCuenta">Buscar Cuenta Bancaria (Número de cuenta o Nombre del Títular)</label>
                        <input 
                            type="text" 
                            id="searchCuenta" 
                            class="form-control"
                            v-model="searchTerm" 
                            @input="searchCuentas" 
                            :disabled="!puedeAsociar || limiteTemporalAlcanzado"
                            placeholder="Ej: '01024567890' o 'Corpoelec'"
                        />
                        <small class="form-text mt-1 text-muted" >
                            <span v-if="limiteTemporalAlcanzado">
                                Se ha alcanzado el límite máximo de cuentas ({{ MAX_CUENTAS_PERMITIDAS }}).
                            </span>
                            <span v-else>
                                Escriba al menos 3 caracteres para buscar.
                            </span>

                        </small>
                        
                        <div v-if="isLoading" class="text-center mt-2">Cargando sugerencias...</div>

                        <ul v-if="suggestions.length > 0 && !isLoading" 
                            class="suggestions-list"
                            ref="suggestionsListRef"> 
                        
                            <li v-for="cuenta in suggestions"
                                :key="cuenta.id"
                                class="suggestion-item"> <span class="suggestion-text">
                                    {{ cuenta.numero_cuenta }} - {{ cuenta.banco.nombre }} ({{ cuenta.tipo_cuenta.nombre }})
                                </span>
                                
                                <button 
                                    type="button" 
                                    class="btn btn-sm btn-info-details"
                                    @click.stop="openDetallesModal(cuenta)" >
                                    Detalles
                                </button>
                            </li>
                        </ul>
                    </div>
                    
                    <div v-if="cuentasAsociar.length > 0" class="mt-4">
                        <h5>Cuentas a Asociar ({{ cuentasAsociar.length }})</h5>
                        <ul class="list-group">
                            <li v-for="(cuenta, index) in cuentasAsociar" :key="cuenta.id" class="list-group-item d-flex justify-content-between align-items-center">
                                <span>{{ cuenta.banco.nombre }}: {{ cuenta.numero_cuenta }}</span>
                                <button type="button" class="btn btn-sm btn-danger" 
                                    @click="cuentasAsociar.splice(index, 1)">
                                    Quitar
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="btn-primary" :disabled="cuentasAsociar.length === 0"> 
                            Asociar Cuentas ({{ cuentasAsociar.length }})
                        </button>
                        <button type="button" @click="$emit('close')" class="btn btn-outline-secondary-custom">
                             <i class="bi bi-x-circle me-1"></i>Cancelar
                        </button>

                    </div>
                </form>

            </div>
        </Transition>

        <Transition name="bubble-pop">
            <div v-if="isDetallesModalVisible" class="detalles-overlay" @click.self="closeDetallesModal">
                <div class="detalles-content">

                    <h4 class="mb-3">Detalles de Cuenta</h4>

                    <div class="account-details-card" v-if="cuentaParaDetalles">
                        <p><strong>Titular:</strong> {{ cuentaParaDetalles.entidad_titular.nombre }} {{ cuentaParaDetalles.entidad_titular.apellido ? cuentaParaDetalles.entidad_titular.apellido : "" }}</p>
                        
                        <p><strong>Banco:</strong> {{ cuentaParaDetalles.banco?.nombre || 'N/A' }}</p>
                        <p><strong>N° Cuenta:</strong> <code>{{ cuentaParaDetalles.numero_cuenta }}</code></p>
                        <p><strong>Tipo:</strong> {{ cuentaParaDetalles.tipo_cuenta?.nombre || 'N/A' }}</p>
                    </div>
                    
                    <div class="modal-actions-details">
                        <button type="button" @click="handleSelectFromDetalles" class="btn-primary"> 
                            <i class="fa fa-plus"></i> Agregar
                        </button>

                        <button type="button" @click="closeDetallesModal" class="btn btn-outline-secondary-custom">
                             <i class="bi bi-x-circle me-1"></i>Cancelar
                        </button>

                    </div>
                </div>
            </div>
        </Transition>
        </div>
</template>

<script setup>

import { ref, watch, computed, defineEmits, defineProps } from 'vue';
import api from '../../../services/api';
import { useToast } from '../../../services/notificacionesService';

const { exito, error, warning, info } = useToast(); 

// ----------------------------------- CONSTANTES Y RUTAS ----------------------------------------
const MAX_CUENTAS_PERMITIDAS = 5; // Limite máximo

const rutaBaseCuentaBancaria = "/CuentaBancaria/";
const rutaBaseAsociacion = "/EntidadCuentaAsociacion/"

const rutaIDsAsociados = `${rutaBaseCuentaBancaria}Buscar/IdsPorRoL`;
const rutaBuscarCuentas = `${rutaBaseCuentaBancaria}Buscar/Aprobadas`;

const rutaAsociarCuenta = `${rutaBaseAsociacion}AsociarCuenta`;
const rutaContarCuentas = `${rutaBaseAsociacion}ContarPorEntidad`;



// ----------------------------------- PROPS Y EMITS ----------------------------------------
const props = defineProps({
    isVisible: { type: Boolean, required: true },
    entidadId: { type: Number, default: null },
    entidadRol: { type: String, default: '' } // 'estudiante', 'docente', 'proveedor'
});

const emit = defineEmits(['close', 'association-success']);

// ----------------------------------- ESTADO REACTIVO ----------------------------------------
const cuentasAsociadasCount = ref(0);
const puedeAsociar = computed(() => cuentasAsociadasCount.value < MAX_CUENTAS_PERMITIDAS);

// Búsqueda de cuentas
const searchTerm = ref('');
const suggestions = ref([]);
const cuentasAsociar = ref([]); 
const isLoading = ref(false);
let searchTimeout = null;

const cuentasYaAsociadasIds = ref(new Set());


// NUEVO ESTADO PARA EL MODAL DE DETALLES ANIDADO
const isDetallesModalVisible = ref(false); 
const cuentaParaDetalles = ref(null);

// Para saber si alcanzó el límite de cuentas y desactive el input de búsqueda
const limiteTemporalAlcanzado = computed(() => {
    // Si la suma de las cuentas ya asociadas + las cuentas que el usuario ha seleccionado temporalmente
    // es igual o mayor al límite, se deshabilita la búsqueda.
    return (cuentasAsociadasCount.value + cuentasAsociar.value.length) >= MAX_CUENTAS_PERMITIDAS;
});


// ----------------------------------- FUNCIONES DE LÓGICA ----------------------------------------

    /**
     * Función para contar cuentas 
     */
    async function fetchCuentasCount() {
        // ... (Tu código actual para fetchCuentasCount)
        if (!props.entidadId || !props.entidadRol) return;

        try {
            const params = {
                id: props.entidadId,
                rol: props.entidadRol
            };

            const response = await api.get(rutaContarCuentas, { params });
            cuentasAsociadasCount.value = response.data.cantidad || 0;

        } catch (err) {
            error('Error al verificar', 'No se pudo contar las cuentas asociadas. Asumiendo límite.');
            cuentasAsociadasCount.value = MAX_CUENTAS_PERMITIDAS;
        }
    }


    /**
     * Función para obtener los IDs de cuentas ya asociadas a esta entidad.
     */
    async function fetchIdsCuentasAsociadas() {
        if (!props.entidadId || !props.entidadRol) return;

        try {
            const params = {
                id: props.entidadId,
                rol: props.entidadRol
            };

            const response = await api.get(rutaIDsAsociados, { params });

            // Crea un Set directamente a partir del array de IDs para un filtrado eficiente.
            cuentasYaAsociadasIds.value = new Set(response.data.data);

        } catch (err) {
            error('Error IDs', 'No se pudo obtener la lista de cuentas ya asociadas.');
            cuentasYaAsociadasIds.value = new Set(); // Asegura que sea un Set vacío
        }
    }


    /**
     * Función para buscar cuentas 
     */
    function searchCuentas() {
        clearTimeout(searchTimeout);
        suggestions.value = [];
        isLoading.value = false;
        
        const query = searchTerm.value.trim();

        if (query.length < 3 || limiteTemporalAlcanzado.value) { // Usamos la nueva propiedad
            if (query.length === 0) {
                suggestions.value = [];
            }
            return;
        }

        isLoading.value = true;

        searchTimeout = setTimeout(async () => {
            
            let params = {};
            
            const isNumeric = /^\d+$/.test(query); 
            const isText = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/.test(query); 
            
            if (isNumeric) {
                params.numero_cuenta = query;
                params.estado = 1;
            } else if (isText) {
                params.nombre = query;
                params.estado = 1;
            } else {
                suggestions.value = [];
                isLoading.value = false;
                return; 
            }

            try {

                const response = await api.get(rutaBuscarCuentas, { params });
                
                const selectedIds = new Set(cuentasAsociar.value.map(c => c.id));
            suggestions.value = response.data.data.filter(c => 
                    !selectedIds.has(c.id) && // Que la cuenta de sugerencia no la haya seleccionado ya el usuario para agregar
                    !cuentasYaAsociadasIds.value.has(c.id) // Que la cuenta de sugerencia no la tenga ya la entidad asociada
                );
                
            } catch (err) {
                error('Error de búsqueda', 'Ocurrió un error al buscar cuentas bancarias.');
                suggestions.value = [];
            } finally {
                isLoading.value = false;
            }
        }, 300);
    }



    /**
     * 3. Selecciona una cuenta y la agrega al listado temporal. 
     */
    function selectCuenta(cuenta) {
        if (cuentasAsociar.value.length < (MAX_CUENTAS_PERMITIDAS - cuentasAsociadasCount.value)) {
            
            const isAlreadySelected = cuentasAsociar.value.some(c => c.id === cuenta.id);
            
            if (!isAlreadySelected) {
                cuentasAsociar.value.push(cuenta);
                searchTerm.value = ''; 
                suggestions.value = []; 
            } else {
                warning('Cuenta Duplicada', `Esta cuenta ya está en la lista de cuentas a asociar.`);
            }

        } else {
            warning('Límite Alcanzado', `Solo puedes asociar hasta ${MAX_CUENTAS_PERMITIDAS} cuentas en total.`);
        }
    }


    /**
     * 4. Envía las cuentas seleccionadas 
     */
    async function submitAssociation() {
        
        if (cuentasAsociar.value.length === 0) {
            info('Sin cuentas', 'No ha seleccionado ninguna cuenta para asociar.');
            return;
        }

        try {
            const cuentasIds = cuentasAsociar.value.map(c => c.id);
            const dataToSend = {
                entidad: props.entidadId,
                concepto: props.entidadRol,
                cuentasIds: cuentasIds
            };
            
            // Llamada a la API para asociar las cuentas
            await api.post(rutaAsociarCuenta, dataToSend);
            
            // Notificación de éxito y cierre del modal
            exito('Asociación Exitosa', `Se han asociado ${cuentasIds.length} cuentas bancarias.`);
            emit('association-success'); // Notifica al componente padre
            emit('close'); // Cierra el modal actual
            
        } catch (err) {
            error('Error de Asociación', 'Falló la asociación de cuentas. Intente nuevamente.');
            console.error('API Error:', err);
        }
    }


    /**
     * 5. Limpieza y reinicio del estado. 
     */
    function resetForm() {
        cuentasAsociadasCount.value = 0;
        searchTerm.value = '';
        suggestions.value = [];
        cuentasAsociar.value = [];
        isLoading.value = false;
        clearTimeout(searchTimeout);
        isDetallesModalVisible.value = false;
        cuentaParaDetalles.value = null;
    }


// ----------------------------------- WATCHER DE VISIBILIDAD Y LLAMADA DE DATOS ----------------------------------------
    watch(() => props.isVisible, (newVal) => {
        if (newVal) {
            resetForm(); 
            fetchCuentasCount(); 
            fetchIdsCuentasAsociadas();
        } else {
            resetForm();
        }
    }, { immediate: true });


// ----------------------------------- Lógica del Modal Anidado (Detalles) ----------------------------------------
    /**
     * Abre el modal de detalles y guarda la cuenta.
     */
    function openDetallesModal(cuenta) {
        cuentaParaDetalles.value = cuenta;
        isDetallesModalVisible.value = true;
    }

    /**
     * Cierra el modal de detalles.
     */
    function closeDetallesModal() {
        isDetallesModalVisible.value = false;
        // Opcional: limpiar la cuenta para detalles después del cierre (ejecutado después de la transición)
        setTimeout(() => {
            cuentaParaDetalles.value = null;
        }, 400); // 400ms para permitir que la transición termine
    }

    /**
     * Maneja la selección de la cuenta desde el modal de detalles (botón "Agregar Cuenta").
     */
    function handleSelectFromDetalles() {
        if (cuentaParaDetalles.value) {
            selectCuenta(cuentaParaDetalles.value); // Lógica principal de asociación temporal
        }
        closeDetallesModal(); // Cerrar el modal de detalles
    }


</script>


<style scoped>

h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
}
.form-group {
    margin-bottom: 15px;
}
.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #494949;
}
.form-group input, .form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

/* Estilos para las Alertas (Bootstrap-like) */
.alert {
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid transparent;
}
.alert-info {
    color: #5e0f72;
    background-color: #f6d4ff;
    border-color: #bee5eb;
}
.alert-danger {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
}


/* Estilos para la cantidad de cuentas del usuario y la cantidad máxima que puede tener (al dar click a "asociar cuenta")  */
.cantidad_cuentas {
    color: #cc1058;
}




/* Sugerencias de Búsqueda */
.suggestions-list {
    list-style: none;
    padding: 0;
    margin-top: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-height: 150px;
    overflow-y: auto;
    background-color: white;
    z-index: 10; 
    position: relative; 
}


/* Estilo del elemento de lista */
.suggestion-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid #eee;
    background-color: #fff;
    cursor: default; 
    transition: background-color 0.2s;
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover {
    background-color: #f9f9f9; 
}

.suggestion-text {
    flex-grow: 1;
    font-size: 0.9em;
    color: #212529;
}

.btn-info-details {
    background-color: #e936e0;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer; 
}


/* Lista de Cuentas Seleccionadas */
.list-group {
    list-style: none;
    padding: 0;
}
.list-group-item {
    padding: 10px 15px;
    border: 1px solid #ddd;
    margin-bottom: -1px;
}

/* Color para el texto de las cuentas seleccionadas */
.list-group-item span {
    color: #5c2e8a; /* Violeta oscuro/Morado Profundo */
    font-weight: 500; /* Hace que el texto resalte un poco más */
}

.d-flex {
    display: flex;
}
.justify-content-between {
    justify-content: space-between;
}
.align-items-center {
    align-items: center;
}

.btn-primary, .btn-secondary {
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary { 
    background-color: #d139ff; 
    color: white;
    margin-right: 10px;
}

.btn-primary:hover:not(:disabled) {
    background-color: #6A1B9A; 
}

.btn-primary:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    border-top: 1px solid #eee;
    margin-top: 20px;
}

/* ------------------------------------------------ */
/* ESTILOS DEL MODAL PRINCIPAL (Overlay y Content) */
/* ------------------------------------------------ */

.modal-overlay {
    position: fixed; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000; 
    background-color: rgba(0, 0, 0, 0.6); 
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: scroll;
    opacity: 0; 
    pointer-events: none; 
    transition: opacity 0.5s ease;
}

.modal-overlay.is-open {
    opacity: 1;
    pointer-events: auto; 
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 95%;
    max-width: 550px; 
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    position: relative;
    margin: 30px auto;
}

/* ------------------------------------------------ */
/* ESTILOS DEL MODAL DE DETALLES (ANIDADO) */
/* ------------------------------------------------ */

.detalles-overlay {
    /* Ocupa el 100% del modal principal */
    position: absolute; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Fondo para enfocar el modal pequeño */
    background-color: rgba(0, 0, 0, 0.3); 
    z-index: 100; /* Mayor que el contenido principal */
    display: flex;
    justify-content: center;
    align-items: center;
}

.detalles-content {
    /* La caja que hará el efecto pop */
    background: white;
    padding: 20px;
    border-radius: 12px; 
    width: 90%;
    max-width: 400px; /* Tamaño pequeño */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    text-align: center;
    position: relative;
}

.account-details-card {
    background-color: #f7f7f7;
    border: 1px solid #e0e0e0;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: left;
}
.account-details-card p {
    margin: 5px 0;
    line-height: 1.4;
    font-size: 0.95rem;
}

/* Resaltar el número de cuenta */
.account-details-card code {
    font-size: 1.15rem; 
    font-weight: bold;
    color: #f339fa; /* Color azul para destacar */
    background-color: #e9ecef00; 
    padding: 2px 5px;
    border-radius: 4px;
    display: inline-block;
}

/* Botones del modal de detalles */
.modal-actions-details {
    display: flex;
    justify-content: space-around;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.btn-primary-small {
    background-color: #00a6e7; 
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.9em;
}
.btn-primary-small:hover {
    background-color: #007ab3;
}

.btn-secondary-small {
    background-color: #dc3545; /* Rojo para cancelar */
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.9em;
}
.btn-secondary-small:hover {
    background-color: #c82333;
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
/*  MODAL PRINCIPAL (CAÍDA/SUBIDA) */
/* ------------------------------------------------ */

.modal-overlay {
    position: fixed; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000; 
    background-color: rgba(0, 0, 0, 0.6); 
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: scroll;
    opacity: 0; 
    pointer-events: none; 
    transition: opacity 0.5s ease;
}

.modal-overlay.is-open {
    opacity: 1;
    pointer-events: auto; 
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 95%;
    max-width: 550px; 
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    position: relative;
    margin: 30px auto;
}

/* Transición MODAL GRANDE: 'modal-drop' */
.modal-drop-enter-active {
    transition: all 0.6s ease-out; 
    transition-delay: 0.4s; 
}
.modal-drop-leave-active {
    transition: all 0.6s ease-in; 
    transition-delay: 0s; 
}
.modal-drop-enter-from,
.modal-drop-leave-to {
    transform: translateY(-100vh); 
    opacity: 0; 
}
.modal-drop-enter-to {
    transform: translateY(0); 
    opacity: 1; 
}

/* ------------------------------------------------ */
/* ESTILOS DE TRANSICIÓN: EFECTO BURBUJA (POP) 💥 */
/* ------------------------------------------------ */

/* 1. TRANSICIÓN ACTIVA para el overlay y el contenido */
.bubble-pop-enter-active,
.bubble-pop-leave-active {
    /* La duración debe ser igual o menor a la transición del contenido */
    transition: opacity 0.3s ease; 
}

/* 2. TRANSICIÓN SÓLO PARA EL CONTENIDO (El pop) */
.bubble-pop-enter-active .detalles-content,
.bubble-pop-leave-active .detalles-content {
    /* La función de rebote: 0.68, -0.55, 0.265, 1.55 */
    transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease;
}

/* 3. ESTADO INICIAL (Entrada) / FINAL (Salida) */
.bubble-pop-enter-from,
.bubble-pop-leave-to {
    /* Atenúa el overlay */
    opacity: 0;
}

.bubble-pop-enter-from .detalles-content,
.bubble-pop-leave-to .detalles-content {
    /* El contenido empieza/termina pequeño y transparente */
    transform: scale(0.7); 
    opacity: 0;
}

</style>


