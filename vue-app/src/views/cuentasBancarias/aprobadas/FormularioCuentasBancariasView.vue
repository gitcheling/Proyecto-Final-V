<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">
            
            <div class="row">

                <!-- Se oculta si es modo edición -->
                <div v-if="!newBankAccount.id" class="form-group col-12 col-lg-6">
                    <label for="banco">Banco:</label>
                    <select id="banco" v-model="newBankAccount.banco" class="form-control">
                        <option value="">Seleccione un banco</option>
                        <option 
                            v-for="banco in bancosDisponibles" 
                            :key="banco.id" 
                            :value="banco.id"
                            :title="banco.codigo_nacional"
                        >
                            {{ banco.nombre }} ({{ banco.codigo_nacional }})
                        </option>
                    </select>
                    <small v-if="errors.banco" class="error-message">{{ errors.banco }}</small>
                </div>
               
                <!-- Se oculta si es modo edición -->
                <div v-if="!newBankAccount.id" class="form-group col-12 col-lg-6">
                    <label for="numero_cuenta">Número de cuenta: <span class="asterisc">*</span></label>
                    <input 
                        type="text" 
                        id="numero_cuenta" 
                        v-model="newBankAccount.numero_cuenta" 
                        class="form-control"
                        :class="numeroCuentaValidationClass"
                    >
                    <small v-if="errors.numero_cuenta" class="error-message">{{ errors.numero_cuenta }}</small>
                </div>

                <!-- Se oculta si es modo edición -->
                <div v-if="!newBankAccount.id" class="form-group col-12 col-lg-6">
                    <label for="tipo_cuenta">Tipo de cuenta:</label>
                    <select id="tipo_cuenta" v-model="newBankAccount.tipo_cuenta" class="form-control">
                        <option value="">Seleccione un tipo de cuenta</option>
                        <option value="1">Corriente</option>
                        <option value="2">Ahorro</option>
                    </select>
                    <small v-if="errors.tipo_cuenta" class="error-message">{{ errors.tipo_cuenta }}</small>
                </div>

              

                <!-- Se oculta si es modo edición -->
                <div v-if="!newBankAccount.id" class="form-group col-12 col-lg-6">

                    <label for="entity-search">Buscar Entidad Titular: <span class="asterisc">*</span></label>
                    <input type="text" 
                        id="entity-search" 
                        v-model="entitySearchTerm" 
                        @input="searchEntities" 
                        placeholder="Escribe Nombre o ID (ej. Juan Pérez o 12345678)"
                    >

                    <small v-if="isEntityLoading">Cargando Entidades...</small>
                    
                    <ul v-if="entitySuggestions.length > 0 && !isEntityLoading" class="suggestions-list">
                        <li v-for="entity in entitySuggestions" 
                            :key="entity.id" 
                            @click="selectEntity(entity)">
                            {{ entity.nombre }} {{ entity.apellido }} ({{ entity.prefijo.letra_prefijo }}-{{ entity.numero_identificacion }})
                        </li>
                    </ul>
                    
                    <small v-if="errors.entidad" class="error-message">{{ errors.entidad }}</small>

                </div>

                <!-- Se oculta si es modo creación -->
                <div v-if="newBankAccount.id" class="form-group col-12 col-lg-6">
                    <label for="estado">Estado de cuenta:</label>
                    <select id="estado" v-model="newBankAccount.estado" class="form-control">
                        <option value="">Seleccione un estado</option>
                        <option 
                            v-for="estado in estadosDisponibles" 
                            :key="estado.id" 
                            :value="estado.id.toString()"
                            :title="estado.descripcion"
                        >
                            {{ estado.nombre }}
                        </option>
                    </select>
                    <small v-if="errors.estado" class="error-message">{{ errors.estado }}</small>
                </div>

            </div>


            <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

            <div class="modal-actions">
                <button type="submit" class="btn-primary" :disabled="!isFormValid" >
                    {{ newBankAccount.id ? 'Guardar Cambios' : 'Crear Cuenta Bancaria' }}
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
    import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue';

    // Se importa el hook de las notificaciones toast
    import { useToast } from '../../../../src/services/notificacionesService';

    // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
    const { exito, error, info, warning } = useToast();
    
    import api from '../../../services/api'; 

  // ----------------------------------- Variables ----------------------------------------

          // Rutas

            // Ruta base prefijos
            const rutaBase = "/CuentaBancaria/"

            // Nueva ruta base para entidades
            const rutaBaseEntidades = "/Entidad/"

            // Ruta base bancos
            const rutaBaseBancos = "/Banco/"

            // Ruta base estados cuenta bancaria
            const rutaBaseEstados = "/EstadoCuentaBancaria/"

            // comprobar existencia de la cuenta
            const rutaComprobar = `${rutaBase}ComprobarExistencia`

            // Buscar Entidades
            const rutaBuscarEntidades = `${rutaBaseEntidades}Buscar`

             // Buscar bancos
            const rutaBuscarBancos = `${rutaBaseBancos}Buscar`

            // Buscar estados cuenta bancaria
            const rutaBuscarEstados = `${rutaBaseEstados}Buscar`


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
            const emit = defineEmits(['close', 'add-bankAccount', 'update-bankAccount']);



      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Cuenta Bancaria' : 'Crear Nueva Cuenta Bancaria';
            });
            
          
      // ----------------------------------- Formulario ----------------------------------------

            // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
            // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
            const newBankAccount = ref({
                id: null,
                numero_cuenta: '',   
                tipo_cuenta: '', 
                banco: '',           
                entidad: '',
                estado: ''   
            });


            // Variables reactivas para almacenar los datos del servidor
            const bancosDisponibles = ref([]);
            const estadosDisponibles = ref([]);


            // --- Variables de Búsqueda de Entidad Titular (NUEVAS) ---
            const entitySearchTerm = ref(''); // Lo que el usuario escribe para buscar entidad
            const entitySuggestions = ref([]); // Resultados de la búsqueda de entidades
            const isEntityLoading = ref(false); // Indicador de carga de entidades
            const entidadSeleccionada = ref(null); // Entidad completa seleccionada
            let entitySearchTimeout = null; // Para manejar el debouncing de la búsqueda de entidad


            // Propiedad que indíca si el modal está en modo edición
            const isEditMode = computed(() => !!newBankAccount.value.id);


            // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
            const errors = ref({
                numero_cuenta: '',   
                tipo_cuenta: '', 
                banco: '',           
                entidad: '',
                estado: ''
            });


            // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
            const isFormValid = computed(() => {
                
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input del número de cuenta. (para saber si es válido o no)
             */
            const numeroCuentaValidationClass = computed(() => {
    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.numero_cuenta) {
                    return 'is-invalid';
                }

                const numeroCuentaLength = newBankAccount.value.numero_cuenta.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (numeroCuentaLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });



            /**
             * Crea un mapa de los bancos disponibles, con la finalidad de simplemente buscar el objeto del banco según su ID.
             */
            const bancosMap = computed(() => {
                // Reduce el array de bancos a un objeto { id: { banco_data } }
                return bancosDisponibles.value.reduce((map, banco) => {
                    map[banco.id] = banco;
                    return map;
                }, {});
            });


  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Funciones de Carga de Datos ----------------------------------------

            /**
             * Carga la lista de bancos disponibles desde el servidor.
             */
            async function fetchBancos() {
                try {

                    const response = await api.get(rutaBuscarBancos); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    bancosDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar bancos', 'No se pudo obtener la lista de bancos del servidor.');
                }
            }

            /**
             * Carga la lista de estados de cuenta disponibles desde el servidor.
             */
            async function fetchEstados() {
                try {
                    
                    const response = await api.get(rutaBuscarEstados); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    estadosDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar estados', 'No se pudo obtener la lista de estados de cuenta del servidor.');
                    console.error(err);
                }
            }

            // Cargar los datos al montar el componente (cuando se carga la página)
            onMounted(() => {
                fetchBancos();
                fetchEstados();
            });



        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {

                // Conversión de ids a cadenas (para asegurar la selección en <select> en modo edición)
                const estadoInicial = initialData?.estado?.id?.toString() || '';

                    newBankAccount.value = {
                        id: initialData?.id || null,
                        numero_cuenta: initialData?.numero_cuenta || '',
                        tipo_cuenta: initialData?.tipo_cuenta || '',
                        banco: initialData?.banco || '',
                        entidad: initialData?.entidad || '',
                        estado: estadoInicial            
                    };


                    // Reinicio de variables de entidad
                    newBankAccount.value.entidad = initialData?.entidad || null; 
                    entitySuggestions.value = [];
                    entidadSeleccionada.value = null;
                    clearTimeout(entitySearchTimeout); 


                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.numero_cuenta = ''; 
                    errors.value.tipo_cuenta = ''; 
                    errors.value.banco = ''; 
                    errors.value.entidad = ''; 
                    errors.value.estado = ''; 

            };


        // ----------------------------------- Watcher (Apertura/Cierre del Modal) ----------------------------------------


            // Vigila cuando el modal se hace visible (se abre) y manda a reiniciar todos los campos
            watch(() => props.isVisible, (newVal) => {

                // Si el modal se está abriendo (newVal es true)
                if (newVal) {
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
                () => newBankAccount.value.numero_cuenta, 
                () => newBankAccount.value.tipo_cuenta, 
                () => newBankAccount.value.banco, 
                () => newBankAccount.value.entidad_titular,
                () => newBankAccount.value.estado,
                entidadSeleccionada

            ], async () => {
                await runValidations(); 
            });

            // --- Funciones de Búsqueda de Entidad Titular ---

            function searchEntities() {
                
                clearTimeout(entitySearchTimeout);
                entitySuggestions.value = []; 

                isEntityLoading.value = false;
                
                const query = entitySearchTerm.value.trim(); 

                // Si la caja de búsqueda está vacía, se deselecciona la entidad y salimos.
                if (query.length < 1) {
                    newBankAccount.value.entidad = null;
                    entidadSeleccionada.value = null; 
                    return;
                }

                isEntityLoading.value = true; // Activar el indicador de carga

                // Establecer un nuevo timeout (Debouncing: 300ms)
                entitySearchTimeout = setTimeout(async () => {
                    
                    let params = {};
                    
                    // -----------------------------------------------Regex para verificar si SOLO contiene números o letras
                    const isIdentification = /^[\d-]+$/.test(query);
                    const isOnlyLettersSpaces = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/.test(query);

                    if (isIdentification) {
                        params.numero_identificacion = query; // Buscar por número de identificación
                        params.estado = true;
                    } else if (isOnlyLettersSpaces) {
                        params.nombre = query; // Buscar por nombre
                        params.estado = true;
                    } else {
                        // Bloquea la búsqueda si el formato no es válido
                        isEntityLoading.value = false;
                        entitySuggestions.value = [];
                        return; 
                    }

                    try {
                        const response = await api.get(rutaBuscarEntidades, { params });
                        entitySuggestions.value = response.data.data; 

                    } catch (err) {
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
                        
                        error('Error al buscar entidades', mensajeError);
                        entitySuggestions.value = [];
                    } finally {
                        isEntityLoading.value = false;
                    }
                }, 300); 
            }


            function selectEntity(entity) {
                // 1. Asignar el ID al objeto principal del formulario que se enviará al backend
                newBankAccount.value.entidad = entity.id;

                // 2. Guardar el objeto completo para la UI
                entidadSeleccionada.value = entity;

                // 3. Actualizar el texto del input de búsqueda con la entidad seleccionada
                entitySearchTerm.value = `${entity.nombre} ${entity.apellido} (${entity.prefijo.letra_prefijo}-${entity.numero_identificacion})`;

                // 4. Ocultar el menú desplegable de sugerencias
                entitySuggestions.value = [];

                // 5. Limpiar el error si existía
                errors.value.entidad = '';
            }


            /**
             * Función de Validación del formulario.
             * @param {boolean} isSubmitting - Indica si el formulario se está enviando (esto es porque si un campo salia incorrecto se
             * hacía una cascada de errores para todos los campos, cuando si solo se está llenando el formulario, debe quitar los estilos
             * del campo si está vacío, pero si se están enviando datos, ahí es cuando debe mostrar error si el campo obligatorio está vacío)
             */
            async function runValidations(isSubmitting = false) {
                // Limpiar errores
                errors.value.numero_cuenta = ''; 
                errors.value.tipo_cuenta = ''; 
                errors.value.banco = ''; 
                errors.value.entidad_titular = ''; 
                errors.value.estado = '';
                errors.value.entidad = '';


                const numero_cuenta = newBankAccount.value.numero_cuenta.toString().trim() ?? '';
                const tipo_cuenta = newBankAccount.value.tipo_cuenta.toString() ?? '';
                const banco = newBankAccount.value.banco ?? '';
                const estado = newBankAccount.value.estado ?? '';
                const entidad = entidadSeleccionada.value;

                // Bandera para rastrear errores síncronos
                let hasSyncErrors = false; 


                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------
                
                // Validación de campos que solo se tienen en el modo creación
                if (!isEditMode.value) { 

                     // --- Número de cuenta ---
                    if (numero_cuenta === "") {
                        if (isSubmitting) {
                            errors.value.numero_cuenta = 'El número de cuenta es obligatorio.';
                            hasSyncErrors = true;
                        }

                    }else if(!/^\d{20}$/.test(numero_cuenta)) {
                        errors.value.numero_cuenta = 'El número de cuenta debe tener solo números (y 20 dígitos exactos)';
                        hasSyncErrors = true;

                    }else if (banco) { // Solo si ya se seleccionó un banco
                        
                        const selectedBank = bancosMap.value[banco];
                        
                        if (selectedBank) {
                            const codigoEsperado = selectedBank.codigo_nacional;
                            const codigoActual = numero_cuenta.substring(0, 4); 

                            if (codigoActual !== codigoEsperado) {
                                errors.value.numero_cuenta = `El número debe comenzar con el código de ${selectedBank.nombre} (${codigoEsperado}).`;
                                hasSyncErrors = true;
                            }
                        }
                    }


                    // --- Tipo de cuenta ---
                    if (tipo_cuenta === "") {
                        if (isSubmitting) {
                            errors.value.tipo_cuenta = 'La selección de un tipo de cuenta es obligatoria.';
                            hasSyncErrors = true;
                        }
                    // Se compara como string porque fue convertido arriba con .toString()
                    }else if(!['1', '2'].includes(tipo_cuenta)) {
                        errors.value.tipo_cuenta = 'Debe seleccionar un tipo de cuenta válido';
                        hasSyncErrors = true;
                    }


                    // --- Banco ---
                    if (banco === "") {
                        if (isSubmitting) {
                            errors.value.banco = 'La selección de un banco es obligatorio.';
                            hasSyncErrors = true;
                        }
                    }else if(!/^\d+$/.test(banco)) {
                        errors.value.banco = 'El banco no tiene un formato válido';
                        hasSyncErrors = true;
                    }


                    // --- Entidad Titular --- 
                    if (!entidad) { 
                        if (isSubmitting) {
                            errors.value.entidad = 'Debe seleccionar una entidad titular para la cuenta.';
                            hasSyncErrors = true;
                        }
                    }


                }else{ //si es modo edición

                    // --- Estado ---
                    if (estado === "") {
                        if (isSubmitting) {
                            errors.value.estado = 'La selección de un estado es obligatorio.';
                            hasSyncErrors = true;
                        }
                    }

                }


                // ----------------------------------------------------
                // VALIDACIONES ASÍNCRONAS (Unicidad)
                // ----------------------------------------------------

                // SOLO si las validaciones síncronas de longitud han pasado y se está enviando el formulario, se hace la petición:             
                if (!hasSyncErrors && isSubmitting) {


                    // Si es modo creación
                    if(!isEditMode.value){

                        // Se comprueba unicidad SOLO si los campos relevantes no tienen ya un error síncrono
                        const countUnique = !errors.value.numero_cuenta;
                        

                        if (countUnique) {
                            const { existeCuenta } = await comprobarCuentaBancaria(
                                numero_cuenta, 
                                banco
                            );
                            
                            if (existeCuenta) {
                                errors.value.numero_cuenta = 'Ya existe una cuenta con éste número de cuenta y banco.';
                            }                           
                        }
                    }        
                }
            
            }


            /**
             * Llama al backend para verificar si la cuenta bancaria ya existe en el sistema (por su número y banco)
             * @returns {Object} { isCodeUnique: Boolean, isNameUnique: Boolean }
             */
            async function comprobarCuentaBancaria(numero_cuenta, banco) {

                if (!numero_cuenta &&  !banco) {
                    return { existeCuenta: false };
                }
                
                // Este endpoint debe recibir el código, el nombre y la ID (para excluirse en edición)
                try {
                    const response = await api.post(rutaComprobar, {
                        numero_cuenta: numero_cuenta,
                        banco: banco
                    });
                    
                    // El backend retorna un objeto { existeCodigo: boolean, existeNombre: boolean }
                    return { 
                        existeCuenta: response.data.existeCuenta
                    };
                } catch (err) {

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

                    error('Error al verificar la existencia', mensajeError);
                    return { existeCuenta: false}; 
                }
            }


           
            // Mandar a realizar las validaciones y si todo es correcto, envía el formulario
            const submitForm = async () => {

                // Se hacen las validaciones
                await runValidations(true); 
                
                if (!isFormValid.value) {

                    error('Formulario no válido', "Deteniendo envío.");

                    return; 
                }

                // Determinar los datos a enviar
                let dataToSend = {};


                if (newBankAccount.value.id) {

                    // MODO EDICIÓN: Solo enviamos el ID y los campos a actualizar
                    dataToSend = {
                        id: newBankAccount.value.id, 
                        estado: newBankAccount.value.estado                 
                    };

                    emit('update-bankAccount', dataToSend);
                } else {

                    // MODO CREACIÓN: Enviamos todos los campos requeridos
                    dataToSend = {
                        numero_cuenta: newBankAccount.value.numero_cuenta,
                        tipo_cuenta: newBankAccount.value.tipo_cuenta,
                        banco: newBankAccount.value.banco,
                        entidad_titular: newBankAccount.value.entidad
                    };

                    emit('add-bankAccount', dataToSend);
                }
            };

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
/* Estilos de Botones */
.btn-outline-secondary-custom {
    --bs-btn-color: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #6c757d;
    --bs-btn-hover-border-color: #6c757d;
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
  background-color: rgba(0, 0, 0, 0.6); 
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

