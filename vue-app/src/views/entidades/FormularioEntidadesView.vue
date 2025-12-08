<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">
            
            <div class="row">

                <!-- Se oculta si es modo edición -->
                <div v-if="!newEntity.id" class="form-group col-12 col-lg-6">
                    <label for="tipo_identificacion">Tipo de identificación: <span class="asterisc">*</span></label>
                    <select 
                        id="tipo_identificacion" 
                        v-model="newEntity.tipo_identificacion"      
                        class="form-control"
                    >
                        <option value="" disabled selected>Seleccione el tipo de identificación</option>
                        <option value="1">Cédula de identidad</option>
                        <option value="2">Pasaporte</option>
                        <option value="3">Registro de Información Fiscal (RIF)</option>
                        <option value="4">Partida de Nacimiento</option>
                    </select>
                    <small v-if="errors.tipo_identificacion" class="error-message">{{ errors.tipo_identificacion }}</small>
                </div>


                <!-- Se oculta si es modo edición -->
                <div v-if="!newEntity.id" class="form-group col-12 col-lg-6">
                    <label for="prefijo">Prefijo: <span class="asterisc">*</span></label>
                    <select 
                        id="prefijo" 
                        v-model="newEntity.prefijo"  
                        class="form-control"
                        :disabled="!newEntity.tipo_identificacion" 
                    >
                        <option value="" disabled selected>
                            {{ newEntity.tipo_identificacion ? 'Seleccione el prefijo' : 'Seleccione primero el tipo de identificación' }}
                        </option>
                        
                        <option 
                            v-for="prefijo in prefijosDisponibles" 
                            :key="prefijo.id_prefijo" 
                            :value="prefijo.id_prefijo"
                        >
                            {{ prefijo.letra_prefijo }} ({{ prefijo.descripcion }})
                        </option>
                        
                    </select>
                    <small v-if="errors.prefijo" class="error-message">{{ errors.prefijo }}</small>
                </div>


                <!-- Se oculta si es modo edición -->
                <div v-if="!newEntity.id" class="form-group col-12 col-lg-6">
                    <label for="codigo">Número de identificación: <span class="asterisc">*</span></label>
                    <input 
                        type="text" 
                        id="numero_identificacion" 
                        v-model="newEntity.numero_identificacion" 
                        class="form-control"
                        :class="numeroIdentificacionValidationClass"
                    >
                    <small v-if="errors.numero_identificacion" class="error-message">{{ errors.numero_identificacion }}</small>
                </div>

                
                <div class="form-group col-12 col-lg-6">
                <label for="nombre">Nombre: <span class="asterisc">*</span></label>
                <input 
                        type="text" 
                        id="nombre" 
                        v-model="newEntity.nombre"  
                        class="form-control"
                        :class="nombreValidationClass"
                    >
                <small v-if="errors.nombre" class="error-message">{{ errors.nombre }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                <label for="apellido">Apellido: <span class="asterisc">*</span></label>
                <input 
                        type="text" 
                        id="apellido" 
                        v-model="newEntity.apellido"       
                        class="form-control"
                        :class="apellidoValidationClass"
                    >
                <small v-if="errors.apellido" class="error-message">{{ errors.apellido }}</small>
                </div>


                <div class="form-group col-12 col-lg-6">
                <label for="email">Email: <span class="asterisc">*</span></label>
                <input 
                        type="text" 
                        id="email" 
                        v-model="newEntity.email" 
                        class="form-control"
                        :class="emailValidationClass"
                    >
                <small v-if="errors.email" class="error-message">{{ errors.email }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                <label for="telefono">Teléfono: <span class="asterisc">*</span></label>
                <input 
                        type="text" 
                        id="telefono" 
                        v-model="newEntity.telefono" 
                        class="form-control"
                        :class="telefonoValidationClass"
                    >
                <small v-if="errors.telefono" class="error-message">{{ errors.telefono }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                <label for="direccion">Dirección: <span class="asterisc">*</span></label>
                <input 
                        type="text" 
                        id="direccion" 
                        v-model="newEntity.direccion" 
                        class="form-control"
                        :class="direccionValidationClass"
                    >
                <small v-if="errors.direccion" class="error-message">{{ errors.direccion }}</small>
                </div>
            
            </div>


            <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

            <div class="modal-actions">
                <button type="submit" class="btn-primary" :disabled="!isFormValid" >
                    {{ newEntity.id ? 'Guardar Cambios' : 'Crear Entidad' }}
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

            // Ruta base prefijos
            const rutaBase = "/Entidad/"

            // Ruta base prefijos
            const rutaBasePrefijos = "/Prefijo/"

            // Buscar prefijos
            const rutaBuscar = `${rutaBasePrefijos}BuscarPrefijos`

            // Modificar entidad
            const rutaComprobar = `${rutaBase}ComprobarEntidad`


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
            const emit = defineEmits(['close', 'add-entity', 'update-entity']);



      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Entidad' : 'Crear Nueva Entidad';
            });
            
          

      // ----------------------------------- Formulario ----------------------------------------

            // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
            // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
            const newEntity = ref({
                id: null,
                tipo_identificacion: '',   
                prefijo: '', 
                numero_identificacion: '',           
                nombre: '',
                apellido: '', 
                email: '',
                telefono: "",        
                direccion: ""      
            });

            // Variable para almacenar los prefijos traídos del servidor
            const prefijosDisponibles = ref([]); // Es un array vacío por defecto


            // Propiedad que indíca si el modal está en modo edición
            const isEditMode = computed(() => !!newEntity.value.id);

            let searchTimeout = null; // Para manejar el debouncing de la búsqueda


            // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
            const errors = ref({
                tipo_identificacion: '',   
                prefijo: '',
                numero_identificacion: '',
                nombre: '', 
                apellido: '',
                email: "",
                telefono: '',
                direccion: '' 
            });


            // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
            const isFormValid = computed(() => {
                
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input del nombre. (para saber si es válido o no)
             */
            const numeroIdentificacionValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.numero_identificacion) {
                    return 'is-invalid';
                }

                const numeroIdentificacionLength = newEntity.value.numero_identificacion.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (numeroIdentificacionLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input del nombre. (para saber si es válido o no)
             */
            const nombreValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.nombre) {
                    return 'is-invalid';
                }

                const nombreLength = newEntity.value.nombre.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (nombreLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });

            /**
             * Retorna la clase de validación de Bootstrap para el input del nombre. (para saber si es válido o no)
             */
            const apellidoValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.apellido) {
                    return 'is-invalid';
                }

                const apellidoLength = newEntity.value.apellido.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (apellidoLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });


            const emailValidationClass = computed(() => {

                const emailLength = newEntity.value.email.length;
                
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.email) {
                    return 'is-invalid';
                }
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (emailLength > 0) {
                    return 'is-valid';
                }
                
                // No se aplica alguna clase.
                return '';
            });


            const telefonoValidationClass = computed(() => {

                const telefonoLength = newEntity.value.telefono.length;
                
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.telefono) {
                    return 'is-invalid';
                }
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (telefonoLength > 0) {
                    return 'is-valid';
                }
                
                // No se aplica alguna clase.
                return '';
            });


            const direccionValidationClass = computed(() => {

                const direccionLength = newEntity.value.direccion.length;
                
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.direccion) {
                    return 'is-invalid';
                }
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (direccionLength > 0) {
                    return 'is-valid';
                }
                
                // No se aplica alguna clase.
                return '';
            });
        



  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {

                    // Reinicia los datos principales (newEntity)
                    newEntity.value = {
                        id: initialData?.id || null,
                        tipo_identificacion: initialData?.tipo_identificacion || '',
                        prefijo: initialData?.prefijo || '',
                        numero_identificacion: initialData?.numero_identificacion || '',
                        nombre: initialData?.nombre || '',
                        apellido: initialData?.apellido || '',
                        email: initialData?.email || '',
                        telefono: initialData?.telefono || '',      
                        direccion: initialData?.direccion || ''     
                    };


                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);

                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.tipo_identificacion = ''; 
                    errors.value.prefijo = ''; 
                    errors.value.numero_identificacion = ''; 
                    errors.value.nombre = ''; 
                    errors.value.apellido = ''; 
                    errors.value.email = ''; 
                    errors.value.telefono = '';
                    errors.value.direccion = '';
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


            // Este watch solo debe reaccionar a CAMBIOS del usuario en modo creación.
            watch(() => newEntity.value.tipo_identificacion, (newTipoId) => {

                // 1. Si estamos editando, se ignora esta lógica.
                if (newEntity.value.id) { 
                    return;
                }
                
                // 2. Si el tipo de ID está vacío (ej: el usuario seleccionó la opción deshabilitada), limpiar.
                if (!newTipoId || newTipoId === '') {
                    prefijosDisponibles.value = [];
                    newEntity.value.prefijo = '';
                    return;
                }

                // 3. Si estamos en modo creación, procede a buscar prefijos:
                fetchPrefijos(newTipoId); 
            }, { immediate: false });

        // ----------------------------------- Funciones del Formulario ----------------------------------------


            /**
            * Función para cargar los prefijos desde el servidor basados en el tipo de identificación.
            * @param {number|string} tipoId - El ID del tipo de identificación seleccionado.
            */
            async function fetchPrefijos(tipoId) {

                // Si no hay un ID válido (p.ej., la opción deshabilitada), se limpia y sale.
                if (!tipoId || tipoId === '') {
                    prefijosDisponibles.value = [];
                    newEntity.value.prefijo = ''; // Limpiar el valor seleccionado
                    return;
                }

                try {
                    // Construye la URL con el ID de la identificación
                    const response = await api.get(`${rutaBuscar}/${tipoId}`);
                    
                    // Asigna la propiedad 'data' de la respuesta a la variable reactiva.
                    // Se asume que el backend envía un array en la propiedad 'data'.
                    prefijosDisponibles.value = response.data.data; 

                    // Opcional: Si el prefijo actual no está en la nueva lista, se elimina
                    const currentPrefijo = newEntity.value.prefijo;
                    const exists = prefijosDisponibles.value.some(p => p.id_prefijo.toString() === currentPrefijo.toString());
                    
                    if (!exists) {
                        newEntity.value.prefijo = '';
                    }

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

                    error('Error al cargar prefijos', mensajeError);

                    prefijosDisponibles.value = []; 
                    newEntity.value.prefijo = ''; // Limpiar el valor ante un error
                }
            }

            // Monitorear los campos clave para validar en tiempo real
            watch([
                () => newEntity.value.tipo_identificacion, 
                () => newEntity.value.prefijo,
                () => newEntity.value.numero_identificacion, 
                () => newEntity.value.nombre, 
                () => newEntity.value.apellido, 
                () => newEntity.value.email, 
                () => newEntity.value.telefono, 
                () => newEntity.value.direccion

            ], async () => {
                await runValidations(); 
            });


            /**
             * Función de Validación del formulario.
             * @param {boolean} isSubmitting - Indica si el formulario se está enviando (esto es porque si un campo salia incorrecto se
             * hacía una cascada de errores para todos los campos, cuando si solo se está llenando el formulario, debe quitar los estilos
             * del campo si está vacío, pero si se están enviando datos, ahí es cuando debe mostrar error si el campo obligatorio está vacío)
             */
            async function runValidations(isSubmitting = false) {
                // Limpiar errores
                errors.value.tipo_identificacion = ''; 
                errors.value.prefijo = ''; 
                errors.value.numero_identificacion = ''; 
                errors.value.nombre = ''; 
                errors.value.apellido = ''; 
                errors.value.email = ''; 
                errors.value.telefono = '';
                errors.value.direccion = '';

                
                const tipo_identificacion = newEntity.value.tipo_identificacion.toString() ?? '';
                const prefijo = newEntity.value.prefijo.toString() ?? '';
                const numero_identificacion = newEntity.value.numero_identificacion.toString().trim() ?? '';
                const nombre = newEntity.value.nombre.toString().trim() ?? '';
                const apellido = newEntity.value.apellido.toString().trim() ?? '';
                const email = newEntity.value.email.toString().trim() ?? '';
                const telefono = newEntity.value.telefono.toString().trim() ?? '';
                const direccion = newEntity.value.direccion.toString().trim() ?? '';

                // Bandera para rastrear errores síncronos
                let hasSyncErrors = false; 

                // Banderas para detectar errores en los del nombre y el apellido (no es necesario en los demás)
                let nombreHasError = false; 
                let apellidoHasError = false; 


                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------
                
                // --- Nombre --- (SIEMPRE REQUERIDA)
                if (nombre.length === 0) {
                    if (isSubmitting) { // Si se está enviando el formulario
                        errors.value.nombre = 'El nombre es obligatorio.';
                        hasSyncErrors = true;
                        nombreHasError = true; // Establece la bandera local
                    }
                } else if (nombre.length > 100) {
                    errors.value.nombre = 'El nombre no debe exceder los 100 caracteres.';
                    hasSyncErrors = true;
                    nombreHasError = true; // Establece la bandera local
                }

                // Si no hay un error asignado ya
                if (!nombreHasError && nombre.length > 0) { 

                    // Otro if-else individual ya que antes se tenían uno después de otro y se superponían
                    if (/\d/.test(nombre)) {
                        errors.value.nombre = 'El nombre no puede contener números.';
                        hasSyncErrors = true;
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
                        errors.value.nombre = 'El nombre sólo puede tener letras y espacios.';
                        hasSyncErrors = true;
                    }
                }


                // --- Apellido --- (SIEMPRE REQUERIDA)
                if (apellido.length > 100) {
                    errors.value.apellido = 'El apellido no debe exceder los 100 caracteres.';
                    hasSyncErrors = true;
                    apellidoHasError = true; // Establece la bandera local
                }
                
                if (!apellidoHasError && apellido.length > 0) { // <-- Solo si no tiene un error ya asignado
                    if (/\d/.test(apellido)) {
                        errors.value.apellido = 'El apellido no puede contener números.';
                        hasSyncErrors = true;
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
                        errors.value.apellido = 'El apellido sólo puede tener letras y espacios.';
                        hasSyncErrors = true;
                    }
                }


                // --- Email --- (SIEMPRE REQUERIDA)
                let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email.length === 0) {
                    if (isSubmitting) {
                        errors.value.email = 'El email es obligatorio.';
                        hasSyncErrors = true;
                    }
                } else if (email.length > 100) {
                    errors.value.email = 'El email no debe exceder los 100 caracteres.';
                    hasSyncErrors = true;
                } else if(!re.test(String(email).toLowerCase())){ // Se usa `else if` aquí porque es una validación de formato
                    errors.value.email = 'El email no tiene un formato válido.';
                    hasSyncErrors = true;
                }


                // --- Teléfono --- (SIEMPRE REQUERIDA)
                re = /^\d{11}$/;
                if (telefono.length === 0) {
                    if (isSubmitting) {
                        errors.value.telefono = 'El teléfono es obligatorio.';
                        hasSyncErrors = true;
                    }
                } else if (telefono.length > 11) {
                    errors.value.telefono = 'El teléfono no debe exceder los 11 dígitos.';
                    hasSyncErrors = true;
                } else if (!/^\d+$/.test(telefono)) {
                    // Validación para solo números. Usamos `else if` para no las validaciones previas del teléfono
                    errors.value.telefono = 'El teléfono debe contener solo números.';
                    hasSyncErrors = true;
                } else if(!re.test(String(telefono))){
                    // Validación estricta de 11 dígitos.
                    errors.value.telefono = 'El teléfono debe tener exactamente 11 dígitos.';
                    hasSyncErrors = true;
                }
           

                // --- Dirección --- (SIEMPRE REQUERIDA)
                if (direccion.length === 0) {
                    if (isSubmitting) {
                        errors.value.direccion = 'La dirección es obligatoria.';
                        hasSyncErrors = true;
                    }
                } else if (direccion.length > 255) {
                    errors.value.direccion = 'La dirección no debe exceder los 255 caracteres.';
                    hasSyncErrors = true;
                }


        
                // Validación de campos que solo se tienen en el modo creación
                if (!isEditMode.value) { 

                    // --- Tipo de Identificación ---
                    if (tipo_identificacion === "") {
                        if (isSubmitting) {
                            errors.value.tipo_identificacion = 'La selección de un tipo de identificación es obligatoria.';
                            hasSyncErrors = true;
                        }
                    // Se compara como string porque fue convertido arriba con .toString()
                    }else if(!['1', '2', '3', '4'].includes(tipo_identificacion)) {
                        errors.value.tipo_identificacion = 'Debe seleccionar un tipo de identificación válido';
                        hasSyncErrors = true;
                    }


                    // --- Prefijo --- 
                    if (prefijo === "") {
                        if (isSubmitting) {
                            errors.value.prefijo = 'La selección de un prefijo es obligatorio.';
                            hasSyncErrors = true;
                        }
                    // Se compara como string porque fue convertido arriba con .toString()
                    } else if(!['1', '2', '3', '4', '5'].includes(prefijo)) {
                        errors.value.prefijo = 'Debe seleccionar un prefijo válido';
                        hasSyncErrors = true;
                    }


                    // --- Número de Identificación ---
                    if (numero_identificacion.length === 0) {
                        if (isSubmitting) {
                            errors.value.numero_identificacion = 'El número de identificación es obligatorio.';
                            hasSyncErrors = true;
                        }
                    } else if (numero_identificacion.length > 20) {
                        errors.value.numero_identificacion = 'El número de identificación no debe exceder los 20 caracteres.';
                        hasSyncErrors = true;
                    } else if (!/^[0-9-]+$/.test(numero_identificacion)) {
                        errors.value.numero_identificacion = "El número de identificación debe contener solo números (dígitos 0-9) o guión (-).";
                        hasSyncErrors = true;
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
                        const shouldCheckUniqueness = !errors.value.email && !errors.value.tipo_identificacion && !errors.value.prefijo && !errors.value.numero_identificacion;
                        

                        if (shouldCheckUniqueness) {
                            const { existeEmail, existeIdentidad } = await comprobarEntidad(
                                email, 
                                tipo_identificacion, 
                                prefijo,
                                numero_identificacion,
                                newEntity.value.id // Se pasa el ID para excluir la entidad actual en edición
                            );
                            
                            if (existeEmail) {
                                errors.value.email = 'Ya existe una entidad con este email.';
                            }
                            
                            if (existeIdentidad) {
                                errors.value.numero_identificacion = 'Ya existe una entidad con este tipo de identificación, prefijo y número de identificación.';
                            }
                        }

                    }else{ // Modo edición

                        if (!errors.value.email) {
                            const { existeEmail } = await comprobarEntidad(
                                email, "", "", "", newEntity.value.id 
                            );
                            
                            if (existeEmail) {
                                errors.value.email = 'Ya existe una entidad con este email.';
                            }
                            
                        }

                    }
                    
                }

            }


            /**
             * Llama al backend para verificar si el código o nombre de la cuenta ya existen.
             * @returns {Object} { isCodeUnique: Boolean, isNameUnique: Boolean }
             */
            async function comprobarEntidad(email, tipo_identificacion, prefijo, numero_identificacion, id) {

                if (!email &&  !tipo_identificacion && !prefijo && !numero_identificacion && !id) {
                    return { existeEmail: false, existeIdentidad: false };
                }
                
                // Este endpoint debe recibir el código, el nombre y la ID (para excluirse en edición)
                try {
                    const response = await api.post(rutaComprobar, {
                        email: email,
                        tipo_identificacion: tipo_identificacion,
                        prefijo: prefijo,
                        numero_identificacion: numero_identificacion,
                        idExcluido: id 
                    });
                    
                    // El backend retorna un objeto { existeCodigo: boolean, existeNombre: boolean }
                    return { 
                        existeEmail: response.data.existeEmail, 
                        existeIdentidad: response.data.existeIdentidad 
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

                    error('Error al verificar unicidad', mensajeError);
                    return { existeEmail: true, existeIdentidad: true }; 
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

                if (newEntity.value.id) {

                    // MODO EDICIÓN: Solo enviamos el ID y los campos a actualizar
                    dataToSend = {
                        id: newEntity.value.id, 
                        nombre: newEntity.value.nombre,
                        apellido: newEntity.value.apellido,
                        email: newEntity.value.email,
                        telefono: newEntity.value.telefono,
                        direccion: newEntity.value.direccion,
                        // No enviamos código, naturaleza, ni padreId
                    };

                    emit('update-entity', dataToSend);
                } else {

                    // MODO CREACIÓN: Enviamos todos los campos requeridos
                    dataToSend = {
                        tipo_identificacion: newEntity.value.tipo_identificacion,
                        prefijo: newEntity.value.prefijo,
                        numero_identificacion: newEntity.value.numero_identificacion,
                        nombre: newEntity.value.nombre,
                        apellido: newEntity.value.apellido,
                        email: newEntity.value.email,
                        telefono: newEntity.value.telefono,
                        direccion: newEntity.value.direccion,
                    };

                    emit('add-account', dataToSend);
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

