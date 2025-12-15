<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">
            
            <div class="row">
                        
                <div class="col-12 mb-3">
                    <div v-if="obligacion" class="alert alert-info p-2 border-primary" role="alert">
                        <h5>🏦 Detalles de la Obligación</h5>
                        <p class="mb-1">**ID:** #{{ obligacion.id }} | **Documento:** {{ obligacion.numero_documento }}</p>
                        <p class="mb-1">**Entidad:** {{ obligacion.entidad.nombre }} {{ obligacion.entidad.apellido }}</p>
                        <p class="mb-0">**Monto Pendiente:** <span class="fw-bold">{{ obligacion.divisa.simbolo }} {{ obligacion.montos.monto_pendiente.toLocaleString() }} {{ obligacion.divisa.codigo }}</span>
                        </p>
                    </div>
                    <div v-else class="alert alert-danger" role="alert">
                        Error: No se ha proporcionado una obligación financiera válida.
                    </div>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="tipo_movimiento">Tipo de Movimiento: <span class="asterisc">*</span></label>
                    <select
                        id="tipo_movimiento"
                        v-model="newMovement.tipo_movimiento"
                        class="form-select"
                        :class="tipoMovimientoValidationClass"
                    >
                        <option value="" disabled>Seleccione un tipo</option>
                        <option
                            v-for="tipo in tiposMovimiento"
                            :key="tipo.id"
                            :value="tipo.id">
                            {{ tipo.nombre }}
                        </option>
                    </select>
                    <small v-if="errors.tipo_movimiento" class="error-message">{{ errors.tipo_movimiento }}</small>
                </div>


                <div class="form-group col-12 col-lg-6">
                    <label for="metodo_pago">Método de Pago: <span class="asterisc">*</span></label>
                    <select
                        id="metodo_pago"
                        v-model="newMovement.metodo_pago"
                        class="form-select"
                        :class="metodoPagoValidationClass"
                    >
                        <option value="" disabled>Seleccione un método</option>
                        <option
                            v-for="metodo in metodosPago"
                            :key="metodo.id"
                            :value="metodo.id">
                            {{ metodo.nombre }}
                        </option>
                    </select>
                    <small v-if="errors.metodo_pago" class="error-message">{{ errors.metodo_pago }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="divisa">Divisa de Pago: <span class="asterisc">*</span></label>
                    <select 
                        id="divisa" 
                        v-model="newMovement.divisa" 
                        class="form-select"
                        :class="divisaValidationClass"
                    >
                        <option value="" disabled>Seleccione la divisa de pago</option>
                        <option 
                            v-for="divisa in divisasDisponibles" 
                            :key="divisa.id" 
                            :value="divisa.id"
                        >
                            {{ divisa.nombre }} ({{ divisa.codigo }})
                        </option>
                    </select>
                    <small v-if="errors.divisa" class="error-message">{{ errors.divisa }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="monto">Monto: <span class="asterisc">*</span></label>
                    <input
                        type="number" 
                        step="0.01"
                        id="monto"
                        v-model.number="newMovement.monto"
                        class="form-control"
                        :class="montoValidationClass"
                        placeholder="0.00"
                    >
                    <small v-if="errors.monto" class="error-message">{{ errors.monto }}</small>
                </div>
                
                <div class="form-group col-12 col-lg-6">
                    <label for="referencia">Referencia / No. de Operación:</label>
                    <input
                        type="text"
                        id="referencia"
                        v-model="newMovement.referencia"
                        class="form-control"
                        :class="referenciaValidationClass"
                        placeholder="Ej: 123456789 (Opcional)"
                    >
                    <small v-if="errors.referencia" class="error-message">{{ errors.referencia }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="fecha_transaccion">Fecha del Movimiento: <span class="asterisc">*</span></label>
                    <input type="date"
                        id="fecha_transaccion"
                        v-model="newMovement.fecha_transaccion"
                        class="form-control"
                        :class="fechaValidationClass"
                    >
                    <small v-if="errors.fecha_transaccion" class="error-message">{{ errors.fecha_transaccion }}</small>
                </div>
                
            </div>


            <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

            <div class="modal-actions">
                <button type="submit" class="btn-primary" :disabled="!isFormValid" >
                    {{ newObligation.id ? 'Guardar Cambios' : 'Crear Obligación' }}
                </button>
                
                <button type="button" @click="$emit('close')" class="btn btn-outline-secondary-custom">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                
                </button>
            </div>

        </form>

        
        </div>

    </Transition>

  </div>
</template>

<script setup>

  // ----------------------------------- Importaciones ----------------------------------------
  import { ref, computed, defineProps, defineEmits, watch } from 'vue';

  // Se importa el hook de las notificaciones toast
  import { useToast } from '../../services/notificacionesService';

  // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
  const { exito, error, info, warning } = useToast();
 
  import api from '../../services/api'; 

  // ----------------------------------- Variables ----------------------------------------

        // Rutas
            // Ruta base entidad
            const rutaBaseEntidad = "/Entidad/"

            // Buscar entidades
            const rutaBuscarEntidades = `${rutaBaseEntidad}Buscar`

            // Rutas de divisas 
            const rutaDivisas = "/Divisa/"
            const rutaBuscarDivisas = `${rutaDivisas}ObtenerDivisas` 

            
      // ----------------------------------- Propiedades ----------------------------------------

            // Se definen las propiedades que usará el componente hijo del padre
            const props = defineProps({

                isVisible: {// El nombre que se le da a la propiedad (para controlar la visibilidad del modal)
                type: Boolean, // El tipo del dato
                required: true // El componente hijo no funcionará si el padre no envía el dato
                },
                
                initialData: { // El objeto para prellenar en modo edición (será 'null' en modo creación)
                type: Object, // El tipo
                default: null /* Si el padre no envía un objeto (es decir, el padre la deja en null, como ocurre en modo "creación"), 
                                la propiedad initialData del modal automáticamente tomará el valor de null.*/
                }
            });


            /* Se definen las salidas (los eventos o señales) que el componente hijo puede generar. la función llamada "emit" es la que 
            utilizará en el código para disparar las señales de salida. */
            const emit = defineEmits(['close', 'add-movement']);


            // Opciones estáticas para select (Definidas manualmente)
            const tiposMovimiento = [
                { id: 1, nombre: 'Ingreso' },
                { id: 2, nombre: 'Egreso' }
                // Puedes añadir más tipos si los necesitas
            ];
            
            const metodosPago = [
                { id: 1, nombre: 'Efectivo' },
                { id: 2, nombre: 'Transferencia Bancaria' },
                { id: 3, nombre: 'Tarjeta' },
                { id: 4, nombre: 'Cheque' },
                // Puedes añadir más métodos si los necesitas
            ];

      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Obligación' : 'Crear Obligación';
            });


            // Propiedad computada para obtener el objeto de estado completo (incluyendo ciclo_cerrado)
            const selectedEstadoObject = computed(() => {
                // Si estamos en edición y hay un estado seleccionado
                if (isEditMode.value && newObligation.value.estado) {
                    // Busca el estado en la lista por su ID
                    return estadosDisponibles.value.find(
                        estado => estado.id === newObligation.value.estado
                    );
                }
                return null;
            });
            

        
      // ----------------------------------- Formulario ----------------------------------------

            // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
            // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
            const newMovement = ref({
                metodo_pago: '',
                monto: '', 
                divisa: '',  
                referencia: '',
                fecha_transaccion: ''   
            });


            const isLoadingInitialData = ref(false);
            /* Indica si estamos esperando la respuesta. Es un booleano que controla el estado de la aplicación. 
            Se cambia a true justo antes de llamar al servicio de búsqueda (asíncrono) y se cambia a false cuando el 
            servicio responde. Se usa para mostrar un indicador visual al usuario (como un spinner o la palabra 
            "Cargando...") mientras espera los resultados de la búsqueda. */
            const isLoading = ref(false); 

            // Variables reactivas para almacenar los datos del servidor
            const divisasDisponibles = ref([]);


            const entidadSeleccionada = ref(null); // Variable que va a almacenar la Entidad que el usuario seleccione

            const searchTerm = ref(''); 
            const suggestions = ref([]); 
            let searchTimeout = null; // Para manejar el debouncing de la búsqueda


            const conceptos = ref([]);
            const subconceptos = ref([]); 
            const initialSubcategoria = ref('');


            // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
            const errors = ref({         
                tipo_movimiento: '', 
                metodo_pago: '',
                monto: '', 
                divisa: '',
                referencia: '',
                fecha_transaccion: '',
            });



            // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
            const isFormValid = computed(() => {
                
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
            });


           

  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Búsqueda de entidades ----------------------------------------
            function searchEntities() {
                clearTimeout(searchTimeout);
                suggestions.value = []; 
                isLoading.value = false;
                
                const query = searchTerm.value.trim(); 

                // Si la caja de búsqueda está vacía, se deselecciona la entidad y se sale.
                if (query.length < 2) { // Se recomienda buscar solo con 2 o más caracteres
                    newObligation.value.entidad = null;
                    entidadSeleccionada.value = null;
                    return;
                }

                isLoading.value = true;


                // Establecer un nuevo timeout (Debouncing: 300ms)
                searchTimeout = setTimeout(async () => {
                    
                    let params = {};
                    
                    // 1. Regex para verificar si SOLO contiene números o guiones
                    // [0-9] coincide con dígitos, '-' coincide con guion.
                    const isIdentification = /^[0-9-]+$/.test(query);

                    // Regex para verificar si SOLO contiene letras, espacios y acentos
                    const isOnlyLettersSpaces = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/.test(query);

                    if (isIdentification) {
                        params.numero_identificacion = query;
                    } else if (isOnlyLettersSpaces) {
                        params.nombre = query;
                    } else {
                        // Alfanumérico o Símbolos: Bloquea la búsqueda y muestra la lista vacía
                        isLoading.value = false;
                        suggestions.value = [];
                        return; 
                    }

                    try { 
                        const response = await api.get(rutaBuscarEntidades, { params });
                        suggestions.value = response.data.data; 

                    } catch (err) {
                        error('Error al buscar entidades', err);
                        suggestions.value = [];
                    } finally {
                        isLoading.value = false;
                    }

                }, 300); 
            }

            // Selección de entidad
            function selectEntity(entity) {

                // Asignar el ID de la entidad seleccionada al objeto principal del formulario
                newObligation.value.entidad = entity.id; 
                
                // Guardar el objeto completo de la entidad seleccionada
                entidadSeleccionada.value = entity; 
                
                // Lo que se imprime en el input de selección: ID y Nombre
                searchTerm.value = `${entity.numero_identificacion} - ${entity.nombre} ${ entity.apellido ? entity.apellido : ""}`;

                // Limpiar la lista de sugerencias para ocultar el menú desplegable
                suggestions.value = [];
            }

            /*
            // Monitorear los campos clave para validar en tiempo real
            watch([
                () => newObligation.value.estado
            ], async () => {
                await runValidations(); 
            });



        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {

                    isLoadingInitialData.value = !!initialData;

                    // Reinicia los datos principales (newObligation)
                    newObligation.value = {
                        id: initialData?.id || null,        
                        entidad: '',
                        concepto: '',
                        subconcepto: '',
                        tipo_comprobante: '',
                        numero_documento: '',
                        descripcion: '',
                        fecha_emision: '',
                        fecha_vencimiento: initialData?.fechas.vencimiento || null,
                        monto_original: '',
                        divisa: '',
                        estado: initialData?.estado.id || ''        
                    };

                     // Reinicia los estados de búsqueda y entidad
                    suggestions.value = [];
                    entidadSeleccionada.value = null; 

                    subconceptos.value = [];

                    searchTerm.value = '';

                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);


                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.tipo_movimiento = ''; 
                    errors.value.metodo_pago = ''; 
                    errors.value.monto = ''; 
                    errors.value.divisa = ''; 
                    errors.value.referencia = ''; 
                    errors.value.fecha_transaccion = ''; 

            };

    

            // ----------------------------------- Carga de datos ----------------------------------------

    
             /**
             * Carga la lista de divisas disponibles desde el servidor.
             
            async function fetchDivisas() {
                try {
                    
                    const response = await api.get(rutaBuscarDivisas); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    divisasDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar divisas', 'No se pudo obtener la lista del servidor.');
                }
            }

        // ----------------------------------- Clases para las validaciones ----------------------------------------

            const numeroValidationClass = () => {

                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.numero_documento) {
                    return 'is-invalid';
                }

                const numeroDocumentoLength = newObligation.value.numero_documento.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (numeroDocumentoLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';

            };


            const descripcionValidationClass = () => {

                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.descripcion) {
                    return 'is-invalid';
                }

                const descripcionLength = newObligation.value.descripcion.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (descripcionLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';

            };


            const montoValidationClass = () => {

                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.monto_original) {
                    return 'is-invalid';
                }

                const montoLength = newObligation.value.monto_original.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (montoLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';

            };



        // ----------------------------------- Watcher (Apertura/Cierre del Modal) ----------------------------------------

            // Vigila cuando el modal se hace visible (se abre) y manda a reiniciar todos los campos
            watch(() => props.isVisible, async (newVal) => {

                // Si el modal se está abriendo (newVal es true)
                if (newVal) {

                    fetchDivisas();

                    // En modo "abrir", se inicializa todo (incluyendo el padre si existe)
                    resetFormState(props.initialData); 

                } else {
                    // En modo "cerrar", se limpia todo.
                    resetFormState(null);
                }
            }, { immediate: true });


        // ----------------------------------- Funciones del Formulario ----------------------------------------

            // Monitorear los campos clave para validar en tiempo real
            watch([
                () => newMovement.value.entidad, 
                () => newMovement.value.tipo_movimiento, 
                () => newMovement.value.metodo_pago, 
                () => newMovement.value.monto,
                () => newMovement.value.divisa, 
                () => newMovement.value.referencia, 
                () => newMovement.value.fecha_transaccion

            ], async () => {
                await runValidations(); 
            });


            /**
             * Función de Validación del formulario.
             * @param {boolean} isSubmitting - Indica si el formulario se está enviando (esto es porque si un campo salia incorrecto se
             * hacía una cascada de errores para todos los campos, cuando si solo se está llenando el formulario, debe quitar los estilos
             * del campo si está vacío, pero si se están enviando datos, ahí es cuando debe mostrar error si el campo obligatorio está vacío)
             
            async function runValidations(isSubmitting = false) {
                // Limpiar errores

                errors.value.tipo_movimiento = ''; 
                errors.value.metodo_pago = ''; 
                errors.value.monto = ''; 
                errors.value.divisa = ''; 
                errors.value.referencia = ''; 
                errors.value.fecha_transaccion = ''; 

                const entidad = newObligation.value.entidad?.toString() ?? '';
                const tipo_movimiento = newObligation.value.tipo_movimiento.toString().trim() ?? '';
                const metodo_pago = newObligation.value.metodo_pago.toString().trim() ?? '';
                const monto = newObligation.value.monto.toString().trim() ?? '';
                const divisa = newObligation.value.divisa.toString().trim() ?? '';
                const referencia = newObligation.value.referencia.toString().trim() ?? '';
                const fecha_transaccion = newObligation.value.fecha_transaccion?.toString().trim() ?? '';

                // Bandera para rastrear errores síncronos
                let hasSyncErrors = false; 

                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------

                if (entidad === "") {
                    if (isSubmitting) {
                        errors.value.entidad = 'La selección de una entidad es obligatorio.';
                        hasSyncErrors = true;
                    }
                }


                if (tipo_movimiento === "") {
                    if (isSubmitting) {
                        errors.value.tipo_movimiento = 'La selección de un tipo de movimiento es obligatorio.';
                        hasSyncErrors = true;
                    }
                }

                if (metodo_pago === "") {
                    if (isSubmitting) {
                        errors.value.metodo_pago = 'La selección de un método de pago es obligatorio.';
                        hasSyncErrors = true;
                    }
                }

                if (divisa === "") {
                    if (isSubmitting) {
                        errors.value.divisa = 'La selección de una divisa es obligatorio.';
                        hasSyncErrors = true;
                    }
                }


                const hasValidMonto = /^[0-9]+\.?[0-9]*$/.test(monto); 
                    if (hasValidMonto.length === 0) {

                        if (isSubmitting) { // Si se está enviando el formulario
                            errors.value.monto = 'El monto es obligatorio.';
                            hasSyncErrors = true;
                        }

                    } else if(!hasValidMonto){

                        errors.value.monto = 'El monto sólo puede tener números y un punto como separador decimal.';
                        hasSyncErrors = true;

                    }else if (!(parseFloat(monto) > 0)) {
                        errors.value.monto = 'El monto debe ser mayor a cero.';
                        hasSyncErrors = true;
                    }



                // Siempre requerida
                if (referencia === "") {
                    if (isSubmitting) {
                        errors.value.referencia = 'El número de referencia es obligatorio.';
                        hasSyncErrors = true;
                    }
                }


    
                if (fecha_transaccion === "") {
                    if (isSubmitting) {
                        errors.value.fecha_transaccion = 'La selección de una fecha de transacción es obligatorio.';
                        hasSyncErrors = true;
                    }
                }

   
            }


            // FUNCIÓN PARA EMITIR LA ACCIÓN REAL (Se llama después de la confirmación si aplica)
            const executeAction = () => {
                let dataToSend = {};
            

                // MODO CREACIÓN:
                dataToSend = {
                    entidad: newMovement.value.entidad,
                    tipo_movimiento: newMovement.value.tipo_movimiento,
                    metodo_pago: newMovement.value.metodo_pago,
                    monto: newMovement.value.monto,
                    divisa: newMovement.value.divisa,
                    referencia: newMovement.value.referencia,
                    fecha_transaccion: newMovement.value.fecha_transaccion
                };

                emit('add-obligation', dataToSend);
              
                

            };

            // FUNCIÓN PRINCIPAL DE ENVÍO (Maneja la lógica de advertencia)
            const submitForm = async () => {
                // 1. Validar
                await runValidations(true); 
                
                if (!isFormValid.value) {
                    error('Formulario no válido', "Deteniendo envío.");
                    return; 
                }
                

                // 3. Ejecutar acción (si no es necesario advertir)
                executeAction();
            };


          */

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
}
.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.calculated-value {
    font-weight: bold;
    color: #007bff; /* Azul para resaltar el valor calculado */
    margin-top: 5px;
    padding: 10px;
    border: 1px dashed #007bff40;
    background-color: #f0f8ff;
    border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
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
}
.btn-primary:hover {
 background-color: #6A1B9A; 
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-secondary:hover {
  background-color: #5a6268;
}
.suggestions-list {
    list-style: none;
    padding: 0;
    margin-top: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-height: 150px;
    overflow-y: auto;
    background-color: white;
    z-index: 10; /* Asegura que flote sobre otros elementos */

    position: absolute; /* Saca el elemento del flujo del documento */
    width: 100%;       /* Asegura que ocupe todo el ancho del input (su contenedor relativo) */
    top: 100%;         /* Coloca la lista justo debajo del input (en la línea del 100% de la altura del contenedor) */
    left: 0;           /* Alinea la lista al borde izquierdo del input */
}
.suggestions-list li {
    padding: 8px 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}
.suggestions-list li:hover {
    background-color: #f0f0f0;
}

/*ERRORES */
.error-message {
    display: block;
    color: #dc3545; /* Color rojo de error */
    margin-top: 5px;
    font-size: 0.85em;
    font-weight: 500;
}

.btn-primary:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
}


/* Obligatoriedad */
.asterisc {
  color: rgb(116, 15, 15);
}


/* Estilos del input del docente */

    .search-container {
        /* Es la base de referencia para el posicionamiento absoluto del ul y el ícono */
        position: relative; 
    }




/*  Ícono de Limpieza Discreto (X) */
    .clear-icon {
        position: absolute;
        top: 50%; /* Centra verticalmente */
        right: 10px; /* Posiciona a la derecha del input */
        transform: translateY(-50%);
        cursor: pointer;
        color: #6c757d; /* Color gris */
        padding: 0 5px; /* Área para facilitar el clic */
        z-index: 10; /* Asegura que esté sobre el input */
    }

    .clear-icon:hover {
        color: #dc3545; /* Color rojo al pasar el ratón */
    }

    /* Agrega un padding a la derecha del input para que el texto no se oculte bajo el ícono */
    .search-container input {
        padding-right: 30px; 
    }


/* Estilos para que el modal flote y se vea bien */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Opacidad inicial: 0 (invisible) */
  opacity: 0; 
  /* Pointer-events: none (no clickeable, deja pasar el click) */
  pointer-events: none; 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000; 
  transition: opacity 0.5s ease; /* Transición suave del fondo */

  opacity: 0; /* Inicia invisible */
  pointer-events: none; /* No intercepta clics */
  transition: opacity 0.5s ease; /* Transición para que el fondo se desvanezca */
}

/* CLASE PARA CUANDO EL MODAL ESTÁ ACTIVO */
.modal-overlay.is-open {
  opacity: 1;
  pointer-events: auto; /* Permite que el fondo intercepte los clics (para cerrarlo, por ejemplo) */
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

    /* --------------------------------- */
    /* SCROLL VERTICAL */
    /* --------------------------------- */
    max-height: 90vh; /* Máximo 90% de la altura del viewport (pantalla) */
    overflow-y: auto; /* Habilita el desplazamiento vertical si se excede la altura */
    box-sizing: border-box; /* Asegura que el padding no afecte el cálculo de width/height */
    
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
    
    /* 2. ATRASO EN LA CAÍDA: Espera 0.4s (para que el fondo se oscurezca primero) */
    transition-delay: 0.4s; 
}

/* Estado Activo (SALIDA) */
.modal-drop-leave-active {
    /* Duración de la subida: 0.6s */
    transition: all 0.6s ease-in; 
    
    /* 4. SIN ATRASO: Sube inmediatamente */
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

/* ------------------------------------------------ */
/* EFECTO DE APARICIÓN SUAVE DEL CONTENIDO (Fade-in/Fade-out) */
/* ------------------------------------------------ */

/* El contenido (h3 y form) tendrá una transición rápida de opacidad */
.modal-content > h3,
.modal-content > form {
    transition: opacity 0.2s ease-out; 
    opacity: 1; /* Estado final */
}

/* OCULTAR EL CONTENIDO EN LOS ESTADOS DE MOVIMIENTO */
.modal-drop-enter-from .modal-content > *,
.modal-drop-leave-to .modal-content > * {
    opacity: 0;
}

/* HACER APARECER EL CONTENIDO (ENTER) */
.modal-drop-enter-active .modal-content > * {
    opacity: 1;
    /* 3. ATRASO LARGO: Aparece después de que el modal terminó de caer (0.4s + 0.6s = 1s) */
    transition-delay: 1.0s; 
}

/* HACER DESAPARECER EL CONTENIDO (LEAVE) */
.modal-drop-leave-active .modal-content > * {
    /* El contenido desaparece inmediatamente (0s delay) antes de que el modal suba */
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

