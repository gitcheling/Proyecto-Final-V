<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">
            
            <div class="row">

      
                <div class="form-group col-12 col-lg-6">
                    <label for="nombre">Nombre: <span class="asterisc">*</span></label>
                    <input 
                            type="text" 
                            id="nombre" 
                            v-model="newGroup.nombre"  
                            class="form-control"
                            :class="nombreValidationClass"
                        >
                    <small v-if="errors.nombre" class="error-message">{{ errors.nombre }}</small>
                </div>

                <!-- Se oculta si es modo edición-->
                <div v-if="!newGroup.id" class="form-group col-12 col-lg-6">
                    <label for="curso">Curso: <span class="asterisc">*</span></label>
                    <div class="docente-search-container"> 
                        <input 
                            type="text" 
                            id="curso" 
                            v-model="searchTermCurso" 
                            @input="handleCursoSearch"
                            @focus="handleCursoSearch"
                            autocomplete="off"
                            class="form-control"
                            :readonly="!!newGroup.curso"
                        >
                        
                        <span 
                            v-if="newGroup.curso && !errors.curso"
                            class="clear-icon"
                            @click="clearCurso"
                            title="Limpiar Curso Seleccionado"
                        >
                            <i class="bi bi-x-lg"></i>
                        </span>

                        <small v-if="errors.curso" class="error-message">{{ errors.curso }}</small>
                        
                        <ul v-if="cursosDisponibles.length > 0" class="suggestions-list">
                            <li 
                                v-for="curso in cursosDisponibles" 
                                :key="curso.id" 
                                @click="selectCurso(curso)"
                            >
                                {{ curso.nombre }}
                            </li>
                        </ul>
                    </div>
                </div>
                

                <div class="form-group col-12 col-lg-6">
                    <label for="modalidad">Modalidad: <span class="asterisc">*</span></label>
                    <select id="modalidad" v-model="newGroup.modalidad" class="form-control">
                        <option value="" disabled>Seleccione una modalidad</option>
                        <option 
                            v-for="modalidad in modalidadesDisponibles" 
                            :key="modalidad.id" 
                            :value="modalidad.id"
                            :title="modalidad.descripcion"
                        >
                            {{ modalidad.nombre }}
                        </option>
                    </select>
                    <small v-if="errors.modalidad" class="error-message">{{ errors.modalidad }}</small>
                </div>

                
                <!-- Se oculta si es modo edición-->
                <div v-if="!newGroup.id" class="form-group col-12 col-lg-6">
                    <label for="periodo">Periodo: <span class="asterisc">*</span></label>
                    <select id="periodo" v-model="newGroup.periodo" class="form-control">
                        <option value="" disabled>Seleccione un periodo</option>
                        <option 
                            v-for="periodo in periodosDisponibles" 
                            :key="periodo.id" 
                            :value="periodo.id"
                            :title="periodo.descripcion"
                        >
                            {{ periodo.nombre }}
                        </option>
                    </select>
                    <small v-if="errors.periodo" class="error-message">{{ errors.periodo }}</small>
                </div>


                <div class="form-group col-12 col-lg-6">
                    <label for="docente">Docente a Asignar: <span class="asterisc">*</span></label>
                    
                    <div class="docente-search-container">
                        
                        <input 
                            type="text" 
                            id="docente" 
                            v-model="searchTermDocente" 
                            @input="handleDocenteSearch"
                            @focus="handleDocenteSearch"
                            autocomplete="off"
                            class="form-control"
                            :readonly="!!newGroup.docente" >
                        
                        <span 
                            v-if="newGroup.docente && !errors.docente"
                            class="clear-icon"
                            @click="clearDocente"
                            title="Limpiar Docente Seleccionado"
                        >
                            <i class="bi bi-x-lg"></i>
                        </span>
                        
                        <ul v-if="docentesDisponibles.length > 0" class="suggestions-list">
                            <li 
                                v-for="docente in docentesDisponibles" 
                                :key="docente.id" 
                                @click="selectDocente(docente)"
                            >
                                {{ docente.entidad.nombre }} {{ docente.entidad.apellido }} ({{ docente.entidad.prefijo.letra_prefijo }}-{{ docente.entidad.numero_identificacion }})
                            </li>
                        </ul>
                    </div>
                    <small v-if="errors.docente" class="error-message">{{ errors.docente }}</small>
                
                </div>
                

                <div class="form-group col-12 col-lg-6">
                    <label for="cupo_maximo">Cupo Máximo: <span class="asterisc">*</span></label>
                    <input 
                            type="text" 
                            id="cupo_maximo" 
                            v-model="newGroup.cupo_maximo"       
                            class="form-control"
                            :class="cupoMaximoValidationClass"
                        >
                    <small v-if="errors.cupo_maximo" class="error-message">{{ errors.cupo_maximo }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="costo_inscripcion">Costo de Inscripción: <span class="asterisc">*</span></label>
                    <input 
                            type="text" 
                            id="costo_inscripcion" 
                            v-model="newGroup.costo_inscripcion"       
                            class="form-control"
                            :class="costoInscripcionValidationClass"
                        >
                    <small class="text-secondary">El costo debe ser expresado en dolares</small>
                    <small v-if="errors.costo_inscripcion" class="error-message">{{ errors.costo_inscripcion }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="costo_clase">Costo por Clase: <span class="asterisc">*</span></label>
                    <input 
                            type="text" 
                            id="costo_clase" 
                            v-model="newGroup.costo_clase"       
                            class="form-control"
                            :class="costoClaseValidationClass"
                        >
                    <small class="text-secondary">El costo debe ser expresado en dolares</small>
                    <small v-if="errors.costo_clase" class="error-message">{{ errors.costo_clase }}</small>
                </div>


                <!-- Se oculta si es modo creación -->
                <div v-if="newGroup.id" class="filter-group col-12 col-lg-6">
                    <label for="estado">Estado:</label>
                    <select id="estado" v-model="newGroup.estado" class="form-control">
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
                    {{ newGroup.id ? 'Guardar Cambios' : 'Crear Curso' }}
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

            // Rutas de Estados 
            const rutaEstadosGrupo = "/EstadoGrupo/"
            const rutaBuscarEstados = `${rutaEstadosGrupo}ObtenerEstadosGrupo` 

            // Rutas de Modalidades 
            const rutaModalidades = "/ModalidadClase/"
            const rutaBuscarModalidades = `${rutaModalidades}ObtenerModalidades` 

            // Rutas de Periodos 
            const rutaPeriodos = "/Periodo/"
            const rutaBuscarPeriodos = `${rutaPeriodos}Buscar` 

            // Rutas de Docentes 
            const rutaDocentes = "/Docente/";
            const rutaBuscarDocentes = `${rutaDocentes}Buscar`; 

            // Rutas de Cursos 
            const rutaCursos = "/Curso/";
            const rutaBuscarCursos = `${rutaCursos}Buscar`;

            



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
            const emit = defineEmits(['close', 'add-course', 'update-course']);



      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Grupo' : 'Crear Nuevo Grupo';
            });
            
          

      // ----------------------------------- Formulario ----------------------------------------

            // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
            // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
            const newGroup = ref({
                id: null,              
                curso: '',
                periodo: '',
                modalidad: '',
                docente: '',
                nombre: '',
                cupo_maximo: '',
                costo_inscripcion: '',
                costo_clase: '',
                estado: ''         
            });



            const isLoadingInitialData = ref(false);

            // Variables reactivas para almacenar los datos del servidor
            const modalidadesDisponibles = ref([]);
            const estadosDisponibles = ref([]);
            const periodosDisponibles = ref([]);

            // Variables reactivas para el campo de búsqueda de docente
            const searchTermDocente = ref('');
            const docentesDisponibles = ref([]);

            // Variables reactivas para el campo de búsqueda de curso 
            const searchTermCurso = ref('');
            const cursosDisponibles = ref([]);

           
            let searchTimeout = null; // Para manejar el debouncing de la búsqueda


            // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
            const errors = ref({         
                curso: '',
                periodo: '',
                modalidad: '',
                docente: '',
                nombre: '',
                cupo_maximo: '',
                costo_inscripcion: '',
                costo_clase: '',
                estado: ''  
            });

             // Propiedad que indíca si el modal está en modo edición
            const isEditMode = computed(() => !!newGroup.value.id);


            // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
            const isFormValid = computed(() => {
                
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input del nombre. (para saber si es válido o no)
             */
            const nombreValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.nombre) {
                    return 'is-invalid';
                }

                const nombreLength = newGroup.value.nombre.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (nombreLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input del cupo máximo. (para saber si es válido o no)
             */
            const cupoMaximoValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.cupo_maximo) {
                    return 'is-invalid';
                }

                const cupoMaximoLength = newGroup.value.cupo_maximo.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (cupoMaximoLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });

            /**
             * Retorna la clase de validación de Bootstrap para el input del costo de inscripción. (para saber si es válido o no)
             */
            const costoInscripcionValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.costo_inscripcion) {
                    return 'is-invalid';
                }

                const costoInscripcionLength = newGroup.value.costo_inscripcion.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (costoInscripcionLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });

            /**
             * Retorna la clase de validación de Bootstrap para el input del costo de clase. (para saber si es válido o no)
             */
            const costoClaseValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.costo_clase) {
                    return 'is-invalid';
                }

                const costoClaseLength = newGroup.value.costo_clase.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (costoClaseLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });


           


  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {

                    isLoadingInitialData.value = !!initialData;

                    // Reinicia los datos principales (newGroup)
                    newGroup.value = {
                        id: initialData?.id || null,        
                        curso: initialData?.curso?.id || '',
                        periodo: initialData?.periodo?.id || '',
                        modalidad: initialData?.modalidad?.id || '',
                        docente: initialData?.docente?.id || '',    
                        nombre: initialData?.nombre || '',
                        cupo_maximo: initialData?.cupo_maximo || '',
                        costo_inscripcion: initialData?.costo_inscripcion || '',
                        costo_clase: initialData?.costo_clase || '',
                        estado: initialData?.estado.id || ''        
                    };

                    // --- Lógica del Docente para el input de texto ---
                    // Si hay datos iniciales (edición), se llena el campo de búsqueda con el nombre.
                    if (initialData && initialData.docente) {
                        searchTermDocente.value = `${initialData.docente.entidad.nombre} ${initialData.docente.entidad.apellido} (${initialData.docente.entidad.prefijo}-${initialData.docente.entidad.numero_identificacion})`;
                    } else {
                        // Si no hay datos iniciales (creación o cierre), se limpia el campo de búsqueda.
                        searchTermDocente.value = '';
                    }
                    docentesDisponibles.value = [];


                    // --- Lógica del Curso para el input de texto ---
                    if (initialData && initialData.curso) {
                        searchTermCurso.value = initialData.curso.nombre || '';
                    } else {
                        searchTermCurso.value = '';
                    }
                    cursosDisponibles.value = [];

                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);


                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.curso = ''; 
                    errors.value.periodo = ''; 
                    errors.value.modalidad = ''; 
                    errors.value.docente = ''; 
                    errors.value.nombre = ''; 
                    errors.value.cupo_maximo = '';
                    errors.value.costo_inscripcion = '';
                    errors.value.costo_clase = '';
                    errors.value.estado = '';
            };

    

            // ----------------------------------- Carga de datos ----------------------------------------

            /**
             * Carga la lista de modalidades disponibles desde el servidor.
             */
            async function fetchModalidades() {
                try {

                    const response = await api.get(rutaBuscarModalidades); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    modalidadesDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar modalidades', 'No se pudo obtener la lista de modalidades del servidor.');
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



            /**
             * Carga la lista de periodos de cuenta disponibles desde el servidor.
             */
            async function fetchPeriodos() {
                try {
                    
                    const response = await api.get(rutaBuscarPeriodos); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    periodosDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar periodos', 'No se pudo obtener la lista de periodos del servidor.');
                }
            }

        // ----------------------------------- Lógica de Docentes ----------------------------------------

            /**
             * Carga la lista de docentes disponibles desde el servidor, usando un término de búsqueda.
             * Ahora con lógica avanzada de filtrado por tipo de dato (Identificación o Nombre).
             * @param {string} query - Término para filtrar la búsqueda.
             */
            async function fetchDocentes(query) {
                // 1. Si ya se seleccionó un docente, se asume que el input está llenado y no se debe buscar.
                if (newGroup.value.docente) {
                    docentesDisponibles.value = [];
                    return;
                }

                const trimmedQuery = query.trim();

                // Si la consulta es muy corta, no buscamos, pero si es una identificación, sí
                if (trimmedQuery.length < 3 && !/^[0-9-]+$/.test(trimmedQuery)) {
                    docentesDisponibles.value = [];
                    return;
                }
                
                let params = {};
                
                // Regex para verificar si SOLO contiene números o guiones (Identificación)
                const isIdentification = /^[0-9-]+$/.test(trimmedQuery);

                // Regex para verificar si SOLO contiene letras, espacios y acentos (Nombre)
                const isOnlyLettersSpaces = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/.test(trimmedQuery);

                if (isIdentification) {
                    params.numero_identificacion = trimmedQuery;
                    params.estado = 1; // Asume que solo quieres activos
                } else if (isOnlyLettersSpaces) {
                    params.nombre = trimmedQuery;
                    params.estado = 1; // Asume que solo quieres activos
                } else {
                    // Alfanumérico o Símbolos (no permitidos): Bloquea la búsqueda y vacía la lista
                    docentesDisponibles.value = [];
                    return; 
                }
                
                try {
                    // Usamos la ruta y los parámetros dinámicos calculados
                    const response = await api.get(rutaBuscarDocentes, { 
                        params: params 
                    }); 
                    
                    docentesDisponibles.value = response.data.data;
                    
                } catch (err) {
                    error('Error al buscar docentes', 'No se pudo obtener la lista de docentes del servidor.');
                    docentesDisponibles.value = [];
                }
            }

            /**
             * Maneja la búsqueda con un retardo (debouncing).
             */
            function handleDocenteSearch() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    // Solo busca si no hay un docente seleccionado ya (el input no es el valor de un docente)
                    if (!newGroup.value.docente) {
                        fetchDocentes(searchTermDocente.value.trim());
                    }
                }, 300); // 300ms de retardo para el debouncing
            }

            /**
             * Asigna el docente seleccionado al formulario y limpia las sugerencias.
             * @param {Object} docente - El objeto docente seleccionado.
             */
            function selectDocente(docente) {
                newGroup.value.docente = docente.id;
                searchTermDocente.value = `${docente.entidad.nombre} ${ docente.entidad.apellido} (${ docente.entidad.prefijo.letra_prefijo}-${ docente.entidad.numero_identificacion})`;
                docentesDisponibles.value = []; // Oculta la lista de sugerencias
                // Borrar error de validación
                errors.value.docente = '';
            }

            /**
             * Limpia la selección del docente.
             */
            function clearDocente() {
                newGroup.value.docente = '';
                searchTermDocente.value = '';
                docentesDisponibles.value = [];
            }



        // ----------------------------------- Lógica de Cursos ----------------------------------------

            /**
             * Carga la lista de cursos disponibles, buscando solo por nombre.
             * @param {string} searchTerm - Nombre del curso a buscar.
             */
            async function fetchCursos(searchTerm) {
                // Si ya se seleccionó un curso, no cargamos sugerencias
                if (newGroup.value.curso) {
                    cursosDisponibles.value = [];
                    return;
                }
                
                if (searchTerm.length < 3) {
                    cursosDisponibles.value = [];
                    return;
                }
                
                try {
                    const response = await api.get(rutaBuscarCursos, { 
                        params: { nombre: searchTerm, estado: 1 } // Asumimos búsqueda por nombre y estado activo
                    }); 
                    
                    cursosDisponibles.value = response.data.data;
                    
                } catch (err) {
                    error('Error al buscar cursos', 'No se pudo obtener la lista de cursos del servidor.');
                    cursosDisponibles.value = [];
                }
            }

            /**
             * Maneja la búsqueda de cursos con un retardo (debouncing).
             */
            function handleCursoSearch() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    // Solo busca si no hay un curso seleccionado ya 
                    if (!newGroup.value.curso) {
                        fetchCursos(searchTermCurso.value.trim());
                    }
                }, 300); // 300ms de retardo para el debouncing
            }

            /**
             * Asigna el curso seleccionado al formulario y limpia las sugerencias.
             * @param {Object} curso - El objeto curso seleccionado.
             */
            function selectCurso(curso) {
                newGroup.value.curso = curso.id;
                searchTermCurso.value = curso.nombre;
                cursosDisponibles.value = []; // Oculta la lista de sugerencias
                // Borrar error de validación
                errors.value.curso = '';
            }

            /**
             * Limpia la selección del curso.
             */
            function clearCurso() {
                newGroup.value.curso = '';
                searchTermCurso.value = '';
                cursosDisponibles.value = [];
            }    


        // ----------------------------------- Watcher (Apertura/Cierre del Modal) ----------------------------------------

            // Vigila cuando el modal se hace visible (se abre) y manda a reiniciar todos los campos
            watch(() => props.isVisible, async (newVal) => {

                // Si el modal se está abriendo (newVal es true)
                if (newVal) {

                    fetchModalidades();
                    fetchEstados();
                    fetchPeriodos();

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
                () => newGroup.value.curso, 
                () => newGroup.value.periodo, 
                () => newGroup.value.modalidad, 
                () => newGroup.value.docente, 
                () => newGroup.value.nombre,
                () => newGroup.value.cupo_maximo,
                () => newGroup.value.costo_inscripcion,
                () => newGroup.value.costo_clase,
                () => newGroup.value.estado

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
                errors.value.curso = ''; 

                errors.value.periodo = ''; 
                errors.value.modalidad = ''; 
                errors.value.docente = ''; 
                errors.value.nombre = ''; 
                errors.value.cupo_maximo = '';
                errors.value.costo_inscripcion = '';
                errors.value.costo_clase = '';
                errors.value.estado = '';

                const curso = newGroup.value.curso.toString().trim() ?? '';
                const periodo = newGroup.value.periodo.toString().trim() ?? '';
                const modalidad = newGroup.value.modalidad.toString().trim() ?? '';
                const docente = newGroup.value.docente.toString().trim() ?? '';
                const nombre = newGroup.value.nombre.toString().trim() ?? '';
                const cupo_maximo = newGroup.value.cupo_maximo.toString().trim() ?? '';
                const costo_inscripcion = newGroup.value.costo_inscripcion.toString().trim() ?? '';
                const costo_clase = newGroup.value.costo_clase.toString().trim() ?? '';
                const estado = newGroup.value.estado.toString().trim() ?? '';

                // Bandera para rastrear errores síncronos
                let hasSyncErrors = false; 

                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------
                
                    // --- Periodo --- (SIEMPRE REQUERIDA)
                    if (periodo === "") {
                        if (isSubmitting) {
                            errors.value.periodo = 'La selección de un periodo es obligatorio.';
                            hasSyncErrors = true;
                        }
                    }

                    // --- Modalidad --- (SIEMPRE REQUERIDA)
                    if (modalidad === "") {
                        if (isSubmitting) {
                            errors.value.modalidad = 'La selección de una modalidad es obligatoria.';
                            hasSyncErrors = true;
                        }
                    }


                    // --- Nombre --- (SIEMPRE REQUERIDA)
                    if (nombre.length === 0) {
                        if (isSubmitting) { // Si se está enviando el formulario
                            errors.value.nombre = 'El nombre es obligatorio.';
                            hasSyncErrors = true;
                        }
                    } else if (nombre.length < 5) {
                        errors.value.nombre = 'El nombre debe tener mínimo 5 caracteres.';
                        hasSyncErrors = true;
                    }else if (nombre.length > 50) {
                        errors.value.nombre = 'El nombre no debe exceder los 50 caracteres.';
                        hasSyncErrors = true;
                    }


                    
                    // --- Cupo máximo --- (SIEMPRE REQUERIDA)
                    // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                    const hasInvalid = /[^0-9]/.test(cupo_maximo); 
                    if (cupo_maximo.length === 0) {

                        if (isSubmitting) { // Si se está enviando el formulario
                            errors.value.cupo_maximo = 'La cantidad de cupos es obligatoria.';
                            hasSyncErrors = true;
                        }

                    } else if(hasInvalid){

                        errors.value.cupo_maximo = 'La cantidad de cupos sólo puede tener números.';
                        hasSyncErrors = true;

                    }else if (cupo_maximo < 5) {
                        errors.value.cupo_maximo = 'La cantidad de cupos no puede ser menor a 5.';
                        hasSyncErrors = true;
                    }else if (cupo_maximo > 400) {
                        errors.value.cupo_maximo = 'La cantidad de cupos no puede exceder las 400.';
                        hasSyncErrors = true;
                    }


                    // --- Costo de inscripción --- (SIEMPRE REQUERIDA)
                    const hasValidInscripcion = /^[0-9]+\.?[0-9]*$/.test(costo_inscripcion); 
                    if (costo_inscripcion.length === 0) {

                        if (isSubmitting) { // Si se está enviando el formulario
                            errors.value.costo_inscripcion = 'El costo de inscripción es obligatorio.';
                            hasSyncErrors = true;
                        }

                    } else if(!hasValidInscripcion){

                        errors.value.costo_inscripcion = 'El costo de inscripción sólo puede tener números y un punto como separador decimal.';
                        hasSyncErrors = true;

                    }else if (costo_inscripcion < 1) {
                        errors.value.costo_inscripcion = 'El costo de inscripción no puede ser menor a 1$.';
                        hasSyncErrors = true;
                    }else if (costo_inscripcion > 1000) {
                        errors.value.costo_inscripcion = 'El costo de inscripción no puede ser mayor a 1000$.';
                        hasSyncErrors = true;
                    }



                    // --- Costo de clase --- (SIEMPRE REQUERIDA)
                    const hasValidClase = /^[0-9]+\.?[0-9]*$/.test(costo_clase); 
                    if (costo_clase.length === 0) {

                        if (isSubmitting) { // Si se está enviando el formulario
                            errors.value.costo_clase = 'El costo unitario por cada clase es obligatorio.';
                            hasSyncErrors = true;
                        }

                    } else if(!hasValidClase){

                        errors.value.costo_clase = 'El costo unitario por cada clase sólo puede tener números y un punto como separador decimal.';
                        hasSyncErrors = true;

                    }else if (costo_clase < 1) {
                        errors.value.costo_clase = 'El costo unitario por cada clase no puede ser menor a 1$.';
                        hasSyncErrors = true;
                    }else if (costo_clase > 50) {
                        errors.value.costo_clase = 'El costo unitario por cada clase no puede ser mayor a 50$.';
                        hasSyncErrors = true;
                    }


                    // --- Docente --- (SIEMPRE REQUERIDA)
                    if (docente === "") {
                        if (isSubmitting) {
                            errors.value.docente = 'La selección de un docente es obligatoria.';
                            hasSyncErrors = true;
                        }
                    }



                // Si es edición
                if (isEditMode.value) { 

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
             
                if (newGroup.value.id) {

                    // MODO EDICIÓN: 
                    dataToSend = {
                        id: newGroup.value.id, 
                        modalidad: newGroup.value.modalidad,
                        docente: newGroup.value.docente,
                        nombre: newGroup.value.nombre,
                        cupo_maximo: newGroup.value.cupo_maximo,
                        costo_inscripcion: newGroup.value.costo_inscripcion,
                        costo_clase: newGroup.value.costo_clase,
                        estado: newGroup.value.estado
                    };

                    emit('update-group', dataToSend);
                } else {

                    // MODO CREACIÓN:
                    dataToSend = {
                        curso: newGroup.value.curso,
                        periodo: newGroup.value.periodo,
                        modalidad: newGroup.value.modalidad,
                        docente: newGroup.value.docente,
                        nombre: newGroup.value.nombre,
                        cupo_maximo: newGroup.value.cupo_maximo,
                        costo_inscripcion: newGroup.value.costo_inscripcion,
                        costo_clase: newGroup.value.costo_clase
                    };

                    emit('add-group', dataToSend);
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


/* Estilos del input del docente */

    .docente-search-container {
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
    .docente-search-container input {
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

