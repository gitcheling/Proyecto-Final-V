<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">

            <div class="row">

                <!-- Se oculta si es modo edición -->
                <div v-if="!newTeacher.id" class="form-group col-12 col-lg-6">
                    <label for="entity-search">Buscar Entidad: <span class="asterisc">*</span></label>
                    <input type="text" 
                        id="entity-search" 
                        v-model="searchTerm" 
                        @input="searchEntities" placeholder="Escribe nombre o número de identificación (ej. 12345678)"
                        class="form-control"
                    >

                    <small v-if="isLoading">Cargando...</small>
                    
                    <ul v-if="suggestions.length > 0 && !isLoading" class="suggestions-list">
                        <li v-for="entity in suggestions" 
                            :key="entity.id" 
                            @click="selectEntity(entity)"> {{ entity.numero_identificacion }} - {{ entity.nombre }} {{ entity.apellido ? entity.apellido : "" }}
                        </li>
                    </ul>

                    <small v-if="errors.entidad" class="error-message">{{ errors.entidad }}</small>
                </div>


                <!-- Se oculta si es modo creación -->
                <div v-if="newTeacher.id" class="form-group col-12 col-lg-6">
                    <label for="estado">Estado Docente: <span class="asterisc">*</span></label>
                    <select 
                        id="estado" 
                        v-model="newTeacher.estado"  
                        class="form-control"
                    >
                        <option value="" disabled selected> Seleccione un estado... </option>
                        
                        <option 
                            v-for="estado in estadosDisponibles" 
                            :key="estado.id" 
                            :value="estado.id"
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
                    {{ newTeacher.id ? 'Guardar Cambios' : 'Registrar Docente' }}
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
            // Ruta base
            const rutaBase = "/Entidad/"

            // Ruta base estados docente
            const rutaBaseEstadoDocente = "/EstadoDocente/"

            // Buscar entidades
            const rutaBuscar = `${rutaBase}Buscar`

            // obtener estados docente
            const rutaObtenerEstadosDocente = `${rutaBaseEstadoDocente}ObtenerEstadosDocente`


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
            const emit = defineEmits(['close', 'add-teacher', 'update-status']);



      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Docente' : 'Registrar Nuevo Docente';
            }); 
            
          

      // ----------------------------------- Formulario ----------------------------------------

        // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
        // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
        const newTeacher = ref({
        id: null,
        estado: '',
        entidadId: null,
        });
    
        // Antes: padreSeleccionado
        const entidadSeleccionada = ref(null); // Variable que va a almacenar la Entidad que el usuario seleccione

        // Variables de búsqueda (las mantienes iguales, solo cambia su propósito)
        const searchTerm = ref(''); 
        const suggestions = ref([]); 

        /* Indica si estamos esperando la respuesta. Es un booleano que controla el estado de la aplicación. 
        Se cambia a true justo antes de llamar al servicio de búsqueda (asíncrono) y se cambia a false cuando el 
        servicio responde. Se usa para mostrar un indicador visual al usuario (como un spinner o la palabra 
        "Cargando...") mientras espera los resultados de la búsqueda. */
        const isLoading = ref(false); 

        // Para manejar el debouncing de la búsqueda
        let searchTimeout = null;

        // Variable para almacenar los estados académicos traídos del servidor
        const estadosDisponibles = ref([]); // Es un array vacío por defecto


        // Propiedad que indíca si el modal está en modo edición
        const isEditMode = computed(() => !!newTeacher.value.id);


        // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
        const errors = ref({
            estado: '',
            entidad: ''
        });


          // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
          const isFormValid = computed(() => {
              
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
          });



  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {
                    // Reinicia los datos principales (newAccount)
                    newTeacher.value = {
                        // Usa initialData para pre-cargar en modo Edición, o null/'' en modo Creación
                        id: initialData?.id || null,
                        estado: initialData?.estado?.id || '',
                        entidadId: initialData?.entidadId || null           
                    };
                
                    // Reinicia los estados de búsqueda y entidad
                    suggestions.value = [];
                    entidadSeleccionada.value = null; 

                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);

                    // Reinicia el campo de búsqueda 
                    searchTerm.value = '';

                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.estado = ''; 
                    errors.value.entidad = '';
            };


        // ----------------------------------- Watcher (Apertura/Cierre del Modal) ----------------------------------------


            // Vigila cuando el modal se hace visible (se abre) y manda a reiniciar todos los campos
            watch(() => props.isVisible, (newVal) => {

                // Si el modal se está abriendo (newVal es true)
                if (newVal) {
                    resetFormState(props.initialData); 
                    fetchEstados();
                } else {
                    // En modo "cerrar", se limpia todo.
                    resetFormState(null);
                }
            }, { immediate: true });



        // ----------------------------------- Funciones del Formulario ----------------------------------------

            function searchEntities() {
                clearTimeout(searchTimeout);
                suggestions.value = []; 
                isLoading.value = false;
                
                const query = searchTerm.value.trim(); 

                // Si la caja de búsqueda está vacía, se deselecciona la entidad y se sale.
                if (query.length < 2) { // Se recomienda buscar solo con 2 o más caracteres
                    newTeacher.value.entidadId = null;
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
                        params.estado = true;
                        params.solo_personas_naturales = true;
                    } else if (isOnlyLettersSpaces) {
                        params.nombre = query;
                        params.estado = true;
                        params.solo_personas_naturales = true;
                    } else {
                        // Alfanumérico o Símbolos: Bloquea la búsqueda y muestra la lista vacía
                        isLoading.value = false;
                        suggestions.value = [];
                        return; 
                    }

                    try { 
                        const response = await api.get(rutaBuscar, { params });
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
                newTeacher.value.entidadId = entity.id; 
                
                // Guardar el objeto completo de la entidad seleccionada
                entidadSeleccionada.value = entity; 
                
                // Lo que se imprime en el input de selección: ID y Nombre
                searchTerm.value = `${entity.numero_identificacion} - ${entity.nombre} ${ entity.apellido ? entity.apellido : ""}`;

                // Limpiar la lista de sugerencias para ocultar el menú desplegable
                suggestions.value = [];
            }

            // Monitorear los campos clave para validar en tiempo real
            watch([
                () => newTeacher.value.estado
            ], async () => {
                await runValidations(); 
            });


            /**
            * Función para cargar los estados docente desde el servidor basados
            */
            async function fetchEstados() {

                try {
                    // Construye la URL con el ID de la identificación
                    const response = await api.get(rutaObtenerEstadosDocente);
                    
                    // Asigna la propiedad 'data' de la respuesta a la variable reactiva.
                    // Se asume que el backend envía un array en la propiedad 'data'.
                    estadosDisponibles.value = response.data.data; 


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

                    error('Error al cargar estados docente', mensajeError);

                    estadosDisponibles.value = []; 
                    newTeacher.value.estado = ''; // Limpiar el valor ante un error
                }
            }



            /**
             * Función de Validación del formulario.
             * @param {boolean} isSubmitting - Indica si el formulario se está enviando (esto es porque si un campo salia incorrecto se
             * hacía una cascada de errores para todos los campos, cuando si solo se está llenando el formulario, debe quitar los estilos
             * del campo si está vacío, pero si se están enviando datos, ahí es cuando debe mostrar error si el campo obligatorio está vacío)
             */
            async function runValidations(isSubmitting = false) {
                // Limpiar errores
                errors.value.estado = '';
                errors.value.entidad = '';
                const estado = newTeacher.value.estado?.toString() ?? '';
                const entidadId = newTeacher.value.entidadId?.toString() ?? '';


                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------

                // Si es creación
                if (!isEditMode.value) { 
                    
                    if (!entidadId && isSubmitting) {
                        errors.value.entidad = 'Debe seleccionar una entidad para el docente.';
                    }
     
                }else{

                    // Validación del estado
                    if (estado === "") {
                        if (isSubmitting) {
                            errors.value.estado = 'La selección de un estado docente es obligatorio.';
                        }
                    
                    }else{
 
                        // La lista de estados válidos se asume que son los IDs 1 al 5
                        // Se compara como string porque fue convertido arriba con .toString()
                        if(!['1', '2', '3', '4'].includes(estado)) {
                            errors.value.estado = 'Debe seleccionar un estado docente válido';
                        }
                    }
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

                if (newTeacher.value.id) {
                    // MODO EDICIÓN: Solo enviamos el ID y el campo a actualizar (estado)
                    dataToSend = {
                        id: newTeacher.value.id, 
                        estado: newTeacher.value.estado,
                    };

                    emit('update-status', dataToSend);

                } else {
                    // MODO CREACIÓN: Enviamos todos los campos requeridos
                    dataToSend = {
                        id: newTeacher.value.entidadId
                    };
                    emit('add-teacher', dataToSend);
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