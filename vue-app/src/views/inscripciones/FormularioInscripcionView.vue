<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">
            
            <div class="row">

      
                 <!-- Se oculta si es modo edición-->
                <div v-if="!newRegistration.id" class="form-group col-12 col-lg-6">
                    <label for="estudiante">Estudiante a Registrar: <span class="asterisc">*</span></label>
                
                    <div class="search-container">
                        <input 
                        type="text" 
                        id="estudiante" 
                        v-model="searchTermEstudiante" 
                        @input="handleEstudianteSearch"
                        @focus="handleEstudianteSearch"
                        autocomplete="off"
                        class="form-control"
                        :readonly="!!newRegistration.estudiante"
                        >
                        
                        <span 
                        v-if="newRegistration.estudiante && !errors.estudiante"
                        class="clear-icon"
                        @click="clearEstudiante"
                        title="Limpiar Estudiante Seleccionado"
                        >
                        <i class="bi bi-x-lg"></i>
                        </span>
                        
                        <small v-if="errors.estudiante" class="error-message">{{ errors.estudiante }}</small>
                        
                        <ul v-if="estudiantesDisponibles.length > 0" class="suggestions-list">
                        <li 
                            v-for="estudiante in estudiantesDisponibles" 
                            :key="estudiante.id" 
                            @click="selectEstudiante(estudiante)"
                        >
                            {{ estudiante.entidad.nombre }} {{ estudiante.entidad.apellido }} ({{ estudiante.entidad.prefijo.letra_prefijo }}-{{ estudiante.entidad.numero_identificacion }})
                        </li>
                        </ul>
                    </div>
                </div>

                <!-- Se oculta si es modo edición -->
                <div v-if="!newRegistration.id" class="form-group col-12 col-lg-6">
                <label for="grupo">Grupo a Asignar: <span class="asterisc">*</span></label>
                
                <div class="search-container">
                    <input 
                    type="text" 
                    id="grupo" 
                    v-model="searchTermGrupo" 
                    @input="handleGrupoSearch"
                    @focus="handleGrupoSearch"
                    autocomplete="off"
                    class="form-control"
                    :readonly="!!newRegistration.grupo"
                    >
                    
                    <span 
                    v-if="newRegistration.grupo && !errors.grupo"
                    class="clear-icon"
                    @click="clearGrupo"
                    title="Limpiar Grupo Seleccionado"
                    >
                    <i class="bi bi-x-lg"></i>
                    </span>
                    
                    <small v-if="errors.grupo" class="error-message">{{ errors.grupo }}</small>
                    
                    <ul v-if="gruposDisponibles.length > 0" class="suggestions-list">
                    <li 
                        v-for="grupo in gruposDisponibles" 
                        :key="grupo.id" 
                        @click="selectGrupo(grupo)"
                    >
                        {{ grupo.nombre }} ({{ grupo.periodo.nombre }})
                    </li>
                    </ul>
                </div>
                </div>
                

                <!-- Se oculta si es modo creación -->
                <div v-if="newRegistration.id" class="filter-group col-12 col-lg-6">
                    <label for="estado">Estado:</label>
                    <select id="estado" v-model="newRegistration.estado" class="form-control">
                        <option 
                            v-for="estado in estadosDisponibles" 
                            :key="estado.id" 
                            :value="estado.id"
                            :title="estado.descripcion"
                            :disabled="isEstadoDisabled(estado.id)"
                        >
                            {{ estado.nombre }}
                        </option>
                    </select>
                </div>

            </div>


            <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

            <div class="modal-actions">
                <button type="submit" class="btn-primary" :disabled="!isFormValid" >
                    {{ newRegistration.id ? 'Guardar Cambios' : 'Registrar Estudiante' }}
                </button>
                
                <button type="button" @click="$emit('close')" class="btn btn-outline-secondary-custom">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                
                </button>
            </div>

        </form>

        
        </div>

    </Transition>

    <changeStatusConfirmation
        :isVisible="showCycleCloseConfirmation"
        :inscriptionId="newRegistration.id"
        :statusName="selectedEstadoObject?.nombre || 'Cargando...'"
        @confirm="executeAction"
        @cancel="showCycleCloseConfirmation = false"
    />
  </div>
</template>

<script setup>

  // ----------------------------------- Importaciones ----------------------------------------
  import { ref, computed, defineProps, defineEmits, watch } from 'vue';

  // Se importa el hook de las notificaciones toast
  import { useToast } from '../../services/notificacionesService';

  import changeStatusConfirmation from './ConfirmChangeStatus.vue';

  // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
  const { exito, error, info, warning } = useToast();
 
  import api from '../../services/api'; 

  // ----------------------------------- Variables ----------------------------------------

        // Rutas

            // Rutas de Estados 
            const rutaEstados = "/EstadoInscripcion/"
            const rutaBuscarEstados = `${rutaEstados}ObtenerEstadosInscripcion` 

            // Rutas de Estudiantes 
            const rutaEstudiantes = "/Estudiante/";
            const rutaBuscarEstudiantes = `${rutaEstudiantes}Buscar`; 

            // Rutas de Grupos
            const rutaGrupos = "/Grupo/";
            const rutaBuscarGrupos = `${rutaGrupos}Buscar`;

            



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
            const emit = defineEmits(['close', 'add-registration', 'update-registration']);


      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Inscripción' : 'Inscribir Estudiante';
            });



            const showCycleCloseConfirmation = ref(false);

            // Propiedad computada para obtener el objeto de estado completo (incluyendo ciclo_cerrado)
            const selectedEstadoObject = computed(() => {
                // Si estamos en edición y hay un estado seleccionado
                if (isEditMode.value && newRegistration.value.estado) {
                    // Busca el estado en la lista por su ID
                    return estadosDisponibles.value.find(
                        estado => estado.id === newRegistration.value.estado
                    );
                }
                return null;
            });
            
            // Propiedad computada que verifica la condición (Modo Edición + Ciclo Cerrado TRUE)
            const requiresCycleCloseWarning = computed(() => {
                // 1. Debe ser modo edición
                if (!isEditMode.value) return false;

                const estado = selectedEstadoObject.value;

                // 2. Debe haber un estado seleccionado
                if (!estado) return false;

                // 3. El estado debe tener el flag ciclo_cerrado en 'true'
                return estado.ciclo_cerrado ===  true; 

            });
          

      // ----------------------------------- Formulario ----------------------------------------

            // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
            // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
            const newRegistration = ref({
                id: null,              
                estudiante: '', 
                grupo: '',  
                estado: ''         
            });



            const isLoadingInitialData = ref(false);

            // Variables reactivas para almacenar los datos del servidor
            const estadosDisponibles = ref([]);


            let searchTimeout = null; // Para manejar el debouncing de la búsqueda


            // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
            const errors = ref({         
                estudiante: '', 
                grupo: '',
                estado: ''  
            });


            // Variables reactivas para el campo de búsqueda de estudiante
            const searchTermEstudiante = ref('');
            const estudiantesDisponibles = ref([]);

            // Variables reactivas para el campo de búsqueda de grupo
            const searchTermGrupo = ref('');
            const gruposDisponibles = ref([]);

             // Propiedad que indíca si el modal está en modo edición
            const isEditMode = computed(() => !!newRegistration.value.id);


            // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
            const isFormValid = computed(() => {
                
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
            });


           

  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {

                    isLoadingInitialData.value = !!initialData;

                    // Reinicia los datos principales (newRegistration)
                    newRegistration.value = {
                        id: initialData?.id || null,        
                        estudiante: '',
                        grupo: '',
                        estado: initialData?.estado.id || ''        
                    };

                    // Reinicia los términos de búsqueda y sugerencias
                    searchTermEstudiante.value = '';
                    estudiantesDisponibles.value = [];
                    searchTermGrupo.value = '';
                    gruposDisponibles.value = [];

                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);


                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.estudiante = ''; 
                    errors.value.grupo = ''; 
                    errors.value.estado = ''; 
            };

    

            // ----------------------------------- Carga de datos ----------------------------------------

    
            /**
             * Carga la lista de estados de cuenta disponibles desde el servidor.
             */
            async function fetchEstados() {
                try {
                    
                    const response = await api.get(rutaBuscarEstados); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    estadosDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar estados', 'No se pudo obtener la lista de estados de grupo del servidor.');
                }
            }


            /**
             * Determina si una opción de estado debe estar deshabilitada.
             * @param {number} estadoId - El ID del estado a evaluar.
             * @returns {boolean} - true si debe estar deshabilitado, false en caso contrario.
             */
            function isEstadoDisabled(estadoId) {
                // Ejemplo 1: Deshabilitar el estado con ID 1 (ej. "Planificado")
                const disabledIds = [1]; 
                
                // Ejemplo 2 (Más complejo): Deshabilitar un estado si el grupo ya está en otro estado específico
                // const esGrupoTerminado = newGroup.value.estado === 4;
                // if (esGrupoTerminado && estadoId === 1) { // No puedes volver a "Pendiente" si ya está "Terminado"
                //     return true;
                // }

                return disabledIds.includes(estadoId);
            }



        // ----------------------------------- Lógica de Búsqueda: Estudiante ----------------------------------------

            /**
             * Carga la lista de estudiantes disponibles, filtrando por ID o Nombre.
             * Se reutiliza la lógica del componente de Docente.
             * @param {string} query - Término para filtrar la búsqueda.
             */
            async function fetchEstudiantes(query) {
                if (newRegistration.value.estudiante) {
                    estudiantesDisponibles.value = [];
                    return;
                }

                const trimmedQuery = query.trim();

                if (trimmedQuery.length < 3 && !/^[0-9-]+$/.test(trimmedQuery)) {
                    estudiantesDisponibles.value = [];
                    return;
                }
                
                let params = {};
                
                // Regex para verificar si SOLO contiene números o guiones (Identificación)
                const isIdentification = /^[0-9-]+$/.test(trimmedQuery);

                // Regex para verificar si SOLO contiene letras, espacios y acentos (Nombre)
                const isOnlyLettersSpaces = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/.test(trimmedQuery);

                if (isIdentification) {
                    params.numero_identificacion = trimmedQuery;
                    params.permite_inscripcion = true; // Solo los que permiten inscripción
                } else if (isOnlyLettersSpaces) {
                    params.nombre = trimmedQuery;
                    params.permite_inscripcion = true; 
                } else {
                    estudiantesDisponibles.value = [];
                    return; 
                }
                
                try {
                    const response = await api.get(rutaBuscarEstudiantes, { 
                        params: params 
                    }); 
                    
                    estudiantesDisponibles.value = response.data.data;
                    
                } catch (err) {
                    error('Error al buscar estudiantes', 'No se pudo obtener la lista de estudiantes del servidor.');
                    estudiantesDisponibles.value = [];
                }
            }

            /**
             * Maneja la búsqueda de estudiante con un retardo (debouncing).
             */
            function handleEstudianteSearch() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (!newRegistration.value.estudiante) {
                        fetchEstudiantes(searchTermEstudiante.value.trim());
                    }
                }, 300); // 300ms de retardo
            }

            /**
             * Asigna el estudiante seleccionado al formulario y limpia las sugerencias.
             * @param {Object} estudiante - El objeto estudiante seleccionado.
             */
            function selectEstudiante(estudiante) {
                newRegistration.value.estudiante = estudiante.id;
                searchTermEstudiante.value = `${estudiante.entidad.nombre} ${ estudiante.entidad.apellido} (${ estudiante.entidad.prefijo.letra_prefijo}-${ estudiante.entidad.numero_identificacion})`;
                estudiantesDisponibles.value = []; // Oculta la lista de sugerencias
                errors.value.estudiante = '';
            }

            /**
             * Limpia la selección del estudiante.
             */
            function clearEstudiante() {
                newRegistration.value.estudiante = '';
                searchTermEstudiante.value = '';
                estudiantesDisponibles.value = [];
            }



        // ----------------------------------- Lógica de Búsqueda: Grupo ----------------------------------------

            /**
             * Carga la lista de grupos disponibles, buscando por nombre o información relevante.
             * @param {string} searchTerm - Nombre o detalle del grupo a buscar.
             */
            async function fetchGrupos(searchTerm) {
                if (newRegistration.value.grupo) {
                    gruposDisponibles.value = [];
                    return;
                }
                
                if (searchTerm.length < 3) {
                    gruposDisponibles.value = [];
                    return;
                }
                
                try {
                    // En este caso, la búsqueda podría ser por nombre, o un campo "query"
                    const response = await api.get(rutaBuscarGrupos, { 
                        params: { nombre: searchTerm, permite_inscripcion: true } // Solo los que permiten inscripción
                    }); 
                    
                    gruposDisponibles.value = response.data.data;
                    
                } catch (err) {
                    error('Error al buscar grupos', 'No se pudo obtener la lista de grupos del servidor.');
                    gruposDisponibles.value = [];
                }
            }

            /**
             * Maneja la búsqueda de grupos con un retardo (debouncing).
             */
            function handleGrupoSearch() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (!newRegistration.value.grupo) {
                        fetchGrupos(searchTermGrupo.value.trim());
                    }
                }, 300); // 300ms de retardo
            }

            /**
             * Asigna el grupo seleccionado al formulario y limpia las sugerencias.
             * @param {Object} grupo - El objeto grupo seleccionado.
             */
            function selectGrupo(grupo) {
                newRegistration.value.grupo = grupo.id;
                // Formatear el texto de visualización para el grupo
                searchTermGrupo.value = `${grupo.nombre} - ${grupo.curso.nombre} (${grupo.periodo.nombre})`;
                gruposDisponibles.value = []; // Oculta la lista de sugerencias
                errors.value.grupo = '';
            }

            /**
             * Limpia la selección del grupo.
             */
            function clearGrupo() {
                newRegistration.value.grupo = '';
                searchTermGrupo.value = '';
                gruposDisponibles.value = [];
            }


        // ----------------------------------- Watcher (Apertura/Cierre del Modal) ----------------------------------------

            // Vigila cuando el modal se hace visible (se abre) y manda a reiniciar todos los campos
            watch(() => props.isVisible, async (newVal) => {

                // Si el modal se está abriendo (newVal es true)
                if (newVal) {

                    fetchEstados();

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
                () => newRegistration.value.estudiante, 
                () => newRegistration.value.grupo, 
                () => newRegistration.value.estado,

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

                errors.value.estudiante = ''; 
                errors.value.grupo = ''; 
                errors.value.estado = ''; 

                const estudiante = newRegistration.value.estudiante.toString().trim() ?? '';
                const grupo = newRegistration.value.grupo.toString().trim() ?? '';
                const estado = newRegistration.value.estado.toString().trim() ?? '';

                // Bandera para rastrear errores síncronos
                let hasSyncErrors = false; 

                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------

                // Si es creación
                if (!isEditMode.value) { 
                
                    // --- Estudiante --- (SIEMPRE REQUERIDA)
                    if (estudiante === "") {
                        if (isSubmitting) {
                            errors.value.estudiante = 'La selección de un estudiante es obligatorio.';
                            hasSyncErrors = true;
                        }
                    }

                    // --- Grupo --- (SIEMPRE REQUERIDA)
                    if (grupo === "") {
                        if (isSubmitting) {
                            errors.value.grupo = 'La selección de un grupo es obligatoria.';
                            hasSyncErrors = true;
                        }
                    }


                // Si es edición
                }else{ 

                    if (estado === "") {
                        if (isSubmitting) {
                            errors.value.estado = 'La selección de un estado es obligatorio.';
                        }
                    }
     
                }
            
                // ----------------------------------------------------
                // VALIDACIONES ASÍNCRONAS (Unicidad)
                // ----------------------------------------------------      

            }


            // FUNCIÓN PARA EMITIR LA ACCIÓN REAL (Se llama después de la confirmación si aplica)
            const executeAction = () => {
                let dataToSend = {};
            
                if (newRegistration.value.id) {
                    // MODO EDICIÓN:
                    dataToSend = {
                        id: newRegistration.value.id,
                        nuevoEstado: newRegistration.value.estado
                    };
                    emit('update-registration', dataToSend);
                } else {
                    // MODO CREACIÓN:
                    dataToSend = {
                        estudiante: newRegistration.value.estudiante,
                        grupo: newRegistration.value.grupo,
                    };
                    emit('add-registration', dataToSend);
                }
                
                // Asegura que se oculte la advertencia después de la acción
                showCycleCloseConfirmation.value = false;
            };

            // FUNCIÓN PRINCIPAL DE ENVÍO (Maneja la lógica de advertencia)
            const submitForm = async () => {
                // 1. Validar
                await runValidations(true); 
                
                if (!isFormValid.value) {
                    error('Formulario no válido', "Deteniendo envío.");
                    return; 
                }
                
                // 2. Comprobar Advertencia de Cierre de Ciclo
                if (requiresCycleCloseWarning.value) {
                    // Muestra el modal de confirmación y detiene el proceso de envío
                    showCycleCloseConfirmation.value = true;
                    return; 
                }

                // 3. Ejecutar acción (si no es necesario advertir)
                executeAction();
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


/* Estilos del input del docente */

    .search-container {
        /* Es la base de referencia para el posicionamiento absoluto del ul y el ícono */
        position: relative; 
    }

    /* Estilos de la lista de sugerencias */
    .suggestions-list {
        /* ... estilos existentes ... */
        
        /* SOLUCIÓN AL SALTO: Hace que la lista flote por encima */
        position: absolute; /* Permite posicionar respecto al padre */
        top: 100%; /* Coloca la lista justo debajo del input (en el 100% de la altura del input) */
        left: 0;
        right: 0;
        
        /* Asegura que la lista se muestre y tenga el ancho completo del input */
        width: 100%; 
        z-index: 100; /* Asegura que esté por encima de otros elementos */
        
        /* ... el resto de tus estilos .suggestions-list ... */
        list-style: none;
        padding: 0;
        margin-top: 2px; /* Pequeño ajuste para separación */
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 150px;
        overflow-y: auto;
        background-color: white;
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

