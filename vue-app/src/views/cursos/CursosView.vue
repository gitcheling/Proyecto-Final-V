<template>

  <div class="account-type-manager">

    <h2>Gestión de Cursos</h2>
    <div class="mb-3">
        <!-- Botón para crear un nuevo curso -->
        <button @click="openModal" class="btn btn-outline-pink flex-fill py-2 shadow-sm ms-2 mb-2">
        + Agregar Nuevo Curso
        </button>

        <button @click="toggleFiltersVisibility" class="btn btn-outline-info flex-fill py-2 shadow-sm ms-2 mb-2">
            {{ areFiltersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
        
            <!-- :class se encarga de cambiar el icono según la variable areFiltersVisible -->
            <i :class="['bi', areFiltersVisible ? 'bi-arrow-up-circle' : 'bi-arrow-down-circle', 'ms-2']"></i>
        
        </button>
        <button 
            @click="clearAllFilters" 
            class="btn btn-outline-secondary flex-fill py-2 shadow-sm ms-2 mb-2"
            title="Restablecer todos los campos de filtro"
        >
            🗑️ Limpiar Todos los Filtros
        </button>
    </div>

    <Transition name="fade-slide">
        <div class="filters-container hover-lift" v-if="areFiltersVisible">
            <h3>Filtros</h3>

            <div class="row">

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="nombre">Nombre:</label>
                    <input 
                        type="text" 
                        id="nombre" 
                        v-model="filters.nombre" 
                        placeholder="Buscar por nombre..."
                        class="form-control"
                        @input="validateNombre"
                    >
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="categoria">Categoría:</label>
                    <select 
                        id="categoria" 
                        v-model="filters.categoria" 
                        class="form-control"
                    >
                        <option value="">Todas</option>
                        <option 
                            v-for="categoria in categories" 
                            :key="categoria.id" 
                            :value="categoria.id"
                        >
                            {{ categoria.nombre }}
                        </option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="subcategoria">Sub-Categoría:</label>
                    <select 
                        id="subcategoria" 
                        v-model="filters.subcategoria" 
                        class="form-control"
                        :disabled="!filters.categoria"
                    >
                        <option value="">Todas</option>
                        <option 
                            v-for="subcategoria in subcategories" 
                            :key="subcategoria.id" 
                            :value="subcategoria.id"
                        >
                            {{ subcategoria.nombre }}
                        </option>
                    </select>
                </div>


                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="cantidad_clases_minima">Cantidad de clases mínima:</label>
                    <input 
                        type="text" 
                        id="cantidad_clases_minima" 
                        v-model="filters.cantidad_clases_minima" 
                        placeholder="Buscar por cantidad de clases mínimas..."
                        class="form-control"
                        @input="validateClasesMinimas"
                    >
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="cantidad_clases_maxima">Cantidad de clases máxima:</label>
                    <input 
                        type="text" 
                        id="cantidad_clases_maxima" 
                        v-model="filters.cantidad_clases_maxima" 
                        placeholder="Buscar por cantidad de clases máxima..."
                        class="form-control"
                        @input="validateClasesMaximas"
                    >
                </div>
            
                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="creadosDesde">Creados Desde:</label>
                    <input type="date" id="creadosDesde" v-model="filters.creadosDesde" class="form-control" :max="filters.creadosHasta || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="creadosHasta">Creados Hasta:</label>
                    <input type="date" id="creadosHasta" v-model="filters.creadosHasta" class="form-control" :min="filters.creadosDesde || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="modificadosDesde">Modificados Desde:</label>
                    <input type="date" id="modificadosDesde" v-model="filters.modificadosDesde" class="form-control" :max="filters.modificadosHasta || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="modificadosHasta">Modificados Hasta:</label>
                    <input type="date" id="modificadosHasta" v-model="filters.modificadosHasta" class="form-control" :min="filters.modificadosDesde || undefined">
                </div>
                
                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="estado">Estado:</label>
                    <select id="estado" v-model="filters.estado" class="form-control">
                        <option value="">Todos</option>
                        <option value="1">Activos</option>
                        <option value="2">En revisión</option>
                        <option value="3">Descontinuados</option>
                    </select>
                </div>

 
            </div>


        </div>

    </Transition>

    <!-- Mensaje de la cantidad de resultados encontrados -->
    <div 
    v-if="courseTypes.length > 0 && !isLoadingTable" 
    class="mb-3 text-start"
    >
        <span class="results-summary" v-html="resultsText"></span>
    </div>

    <!-- Tabla de los cursos -->
    <div class="table-card-wrapper hover-lift">
        <div class="table-responsive">
            <table class="table table-striped table-hover table-bordered table-custom">

            <thead class="header-personalizado">
                <tr>
                    <th class="text-center col-nombre">Nombre</th>
                    <th class="text-center col-categoria">Categoría</th>
                    <th class="text-center col-subcategoria">Sub-Categoría</th>
                    <th class="text-center col-total">Total de Clases</th>
                    <th class="text-center col-fecha_creacion">Fecha de creación</th>
                    <th class="text-center col-fecha_actualizacion">Última modificación</th>
                    <th class="text-center col-estado">Estado</th>
                    <th class="text-center col-permite_grupos">¿Permite nuevos grupos?</th>
                    <th class="text-center col-acciones">Acciones</th>
                </tr>
            </thead>

            
            <tbody>
                <tr v-if="isLoadingTable">
                    <td colspan="13" class="text-center">
                        <span class="loading-message">Cargando datos...</span>
                    </td>
                </tr>

                <tr v-if="courseTypes.length > 0" v-for="course in courseTypes" :key="course.id">
                    <td class="">{{ course.nombre }}</td>
                    <td class="">{{ course.categoria.categoria_padre.nombre }}</td>
                    <td class="">{{ course.categoria.nombre }}</td>
                    <td class="">{{ course.total_clases }}</td>
                    <td class="">{{ formatDateTime(course.fechaCreacion) }}</td>
                    <td class="">{{ formatDateTime(course.fechaActualizacion) }}</td>
                    <td class="">{{ course.estado.nombre }}</td>
                    <td class="">{{ course.estado.permite_grupos }}</td>


                    <td class=" text-center">
                        <div class="d-flex flex-row flex-nowrap justify-content-center">

                            <router-link 
                                :to="{ 
                                    name: 'CourseDetails', 
                                    params: { id: course.id } 
                                }" 
                                class="btn btn-sm btn-outline-primary me-1" 
                                title="Ver detalles del Curso"
                            >
                                <i class="bi bi-eye-fill"></i> 
                            </router-link> 

                        </div>           
                    </td>
                </tr>
            </tbody>
            

            </table>
        </div>
    </div>

    <!-- Mensaje de que no se encontraron resultados -->
    <div 
        v-if="!isLoadingTable && courseTypes.length === 0" 
        class="text-center py-5 mb-5"
    >
        <div class="no-results-center-badge">
            <i class="bi bi-x-circle-fill me-2"></i> No se encontraron cursos con los filtros aplicados.
            <p class="mt-2 mb-0 text-muted">Intenta ajustando o limpiando los filtros para ver la lista completa.</p>
        </div>
    </div>

    <!-- Modal para crear un curso -->
    <AccountFormModal
      :isVisible="isModalVisible"
      :initialData="courseToEdit" 
      @close="closeModal"
      @add-course="addCourse"
    />

  </div>
  
    
</template>


<script setup>

    // ----------------------------------- Importaciones ----------------------------------------
       
        import { ref, watch, computed, onMounted} from 'vue';

        // Se importa el hook de las notificaciones toast
        import { useToast } from '../../services/notificacionesService';

        // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
        const { exito, error, info, warning } = useToast();

        import AccountFormModal from './FormularioCursosView.vue';

        // Se importa el objeto axios que permitirá la conexión con la api
        import api from '../../services/api'; 

    // ----------------------------------- Variables ----------------------------------------

        // Rutas
            // Ruta base
            const rutaBase = "/Curso/"

            // Buscar cursos
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear curso
            const rutaCrear = `${rutaBase}CrearCurso`

            // Rutas de Categoría 
            const rutaCategoriasBase = "/CategoriaCurso/"
            const rutaBuscarCategorias = `${rutaCategoriasBase}BuscarCategorias` 


        // Se inicializa como array vacío. Los datos se cargarán de la API al montar el componente.
        const courseTypes = ref([]);

        // Propiedad computada para saber que mensaje se pondrá en la cantidad de resultados encontrados
        const resultsText = computed(() => {
            const count = courseTypes.value.length;
            if (count === 1) {
                return `🔍 Se encontró ${count} curso con los filtros aplicados.`;
            } else {
                return `🔍 Se encontraron ${count} cursos con los filtros aplicados.`;
            }
        });

        // Ésta variable reactiva permitirá controlar la visibilidad del modal
        const isModalVisible = ref(false);


        // Almacena el objeto de la cuenta que se está editando. Es 'null' en el modo creación y se pasa como argumento a la función respectiva
        // para que el modal se muestre en ése modo.
        const courseToEdit = ref(null); 

        /* Indicador de carga para la tabla

        Nota: Se inicializa en "true" para que no salga el aviso de que no se encontraron cuentas nada mas se abre la pagina, la función de búsqueda será quien la ponga
        en "false" cuando se ejecute */
        const isLoadingTable = ref(true);

        // Este objeto es la plantilla para el reset (para reiniciar los filtros)
        const initialFilters = {
            nombre: '',
            categoria: '',
            subcategoria: '',
            cantidad_clases_minima: '',
            cantidad_clases_maxima: '',
            estado: '',
            creadosDesde: '',
            creadosHasta: '',
            modificadosDesde: '',
            modificadosHasta: '',
        };

        // Utiliza ese estado inicial para el objeto reactivo
        const filters = ref({ ...initialFilters });

        // Variable reactiva para controlar la visibilidad del contenedor de filtros
        const areFiltersVisible = ref(false);

    

        // Variables que almacenan el último valor de filtro que fue válido (para el número de identificación, el nombre y el apellido)
        const lastValidNombre = ref('');
        const lastValidCantidadClasesMinima = ref('');
        const lastValidCantidadClasesMaxima = ref('');


        let searchTimeout = null; // Para manejar el debouncing de la búsqueda


        // Almacena la lista completa de categorías principales
        const categories = ref([]); 
        // Almacena la lista de subcategorías (dependientes del select de categoría)
        const subcategories = ref([]);


  // ----------------------------------- Funciones ----------------------------------------

      // ----------------------------------- API ----------------------------------------

            /**
             * Carga los datos desde la API, AHORA aceptando filtros.
             * @param {object} currentFilters - Objeto con los filtros a aplicar.
             */
            const loadCourses = async (currentFilters = {}) => {
                isLoadingTable.value = true;
                try {
                    // Eliminar filtros con valores vacíos para que la URL sea más limpia
                    const validFilters = Object.fromEntries(
                        Object.entries(currentFilters).filter(([, value]) => value !== '' && value !== null)
                    );
                    
                    // Se envía el objeto validFilters como 'params' en la petición GET
                    const response = await api.get(rutaBuscar, { 
                        params: validFilters 
                    }); 

                    courseTypes.value = response.data.data; 

                } catch (err) {
                    error('Error de Servidor', 'No se pudieron obtener los datos de los cursos. Intente de nuevo.');
                } finally {
                    isLoadingTable.value = false;
                }
            };



            /**
            * Maneja el evento 'add-course' del modal llamando a la API.
            */   
            const addCourse = async (newData) => {
                try {

                    // 1. Llama a la API (POST) para creación
                    const response = await api.post(rutaCrear, newData);

                    exito('Éxito', 'Curso creado correctamente.');

                    await loadCourses(); 

                    // 4. Cerrar el modal.
                    closeModal();

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

                    error('Error al crear el curso', mensajeError);
                }
            };



            watch(
                filters, // Monitorea la referencia ref directamente
                (newFilters) => {
                
                // El Nombre debe ser vacío o contener SOLO caracteres permitidos (letras o espacios)
                const nombreValido = newFilters.nombre.trim() === '' || newFilters.nombre.length > 30;
                
                const clasesMinimasValidas = newFilters.cantidad_clases_minima.trim() === '' || /^\d+$/.test(newFilters.cantidad_clases_minima);
                
                const clasesMaximasValidas = newFilters.cantidad_clases_maxima.trim() === '' || /^\d+$/.test(newFilters.cantidad_clases_maxima);
                

                // 2. Compuerta de seguridad: CANCELAR la búsqueda si algún filtro es inválido
                // Esto captura el estado intermedio inválido (ej. '1A') y lo ignora.
                if (!nombreValido || !clasesMinimasValidas || !clasesMaximasValidas) {
                    // console.log("Búsqueda cancelada: Filtro con formato inválido.");
                    return; 
                }

                // 3. Debounce: Limpia el temporizador anterior y establece uno nuevo
                clearTimeout(searchTimeout);

                searchTimeout = setTimeout(() => {

                    // VALIDACIÓN CRUZADA: Minima > Maxima
                    /* Nota: Se debe colocar dentro del setTimeout para garantizar que no se dispare cada vez que el usuario
                    escribe un número (por ejemplo, que con cada número escrito salga el error de que el número de clases mayor 
                    debe ser mayor que el número de clases menor, a pesar de que el usuario apenas ha comenzado a escribir el
                    número y no ha terminado, es horrible, por lo que meterlo dentro del retrase de tiempo le da un margen 
                    mínimo de tiempo al usuario de escribir el número*/
                    const minVal = newFilters.cantidad_clases_minima ? parseInt(newFilters.cantidad_clases_minima, 10) : null;
                    const maxVal = newFilters.cantidad_clases_maxima ? parseInt(newFilters.cantidad_clases_maxima, 10) : null;

                    // Condición: Si ambos tienen un valor Y Mínima es mayor que Máxima
                    if (minVal !== null && maxVal !== null && minVal > maxVal) {

                        // El error solo se muestra después de los 300ms
                        error('Error de Rango', `La cantidad de clases mínima (${minVal}) no puede ser mayor que la máxima (${maxVal}).`);
                        return; // Detiene la acción de búsqueda

                    
                    }else if(minVal > 160 || maxVal > 160){ // No se puede buscar mas de 160 clases
                        return;
                    }


                    // Llama a la función de carga de cuentas con el valor (el objeto) de los filtros si todo está correcto
                    loadCourses(newFilters);
                }, 300); // 300ms de espera para estabilizar los inputs de texto
                
                }, 
                { 
                    deep: true, 
                    immediate: true //  Fuerza la ejecución al montar el componente
                }
            );


            /**
             * Carga la lista de categorías principales para el select.
             */
            const loadCategories = async () => {
                try {
                    const response = await api.get(rutaBuscarCategorias); 
                    categories.value = response.data.data;
                } catch (err) {
                    // En un entorno real, es mejor usar un toast de advertencia/info si esto falla.
                    error('Error de Servidor', 'No se pudieron cargar las categorías. Intente de nuevo.');
                }
            };

            /**
             * Carga las subcategorías basadas en el ID de la categoría padre.
             * @param {string|number} parentId - ID de la categoría principal seleccionada.
             */
            const loadSubcategories = async (parentId) => {
                // 1. Resetear el array de subcategorías y el filtro actual
                subcategories.value = [];
                filters.value.subcategoria = ''; 

                if (!parentId) {
                    return;
                }

                try {
                    // 2. Llamar a la API con el ID de la categoría padre
                    const response = await api.get(rutaBuscarCategorias, {
                        params: { 
                            padre: parentId // Aquí se envía el ID a la URL como ?padre=X
                        }
                    });
                    subcategories.value = response.data.data;
                } catch (err) {
                    error('Error de Servidor', 'No se pudieron cargar las subcategorías.');
                }
            };
            


            // WATCH para la dependencia Categoría -> Subcategoría
            // Este watch solo se ejecuta cuando cambia el 'filters.categoria'
            watch(() => filters.value.categoria, (newCategoryId) => {
                // Nota: El nombre del filtro es 'categoria' en tu template y filters, no 'categoria_id'
                loadSubcategories(newCategoryId);
                
                // La búsqueda general (loadCourses) se disparará automáticamente 
                // gracias al watch principal con deep: true, después de 300ms.
            });

            onMounted(() => {
                // 1. Cargar la lista inicial de categorías principales (para llenar el primer select)
                loadCategories(); 
                
                // 2. La función loadCourses se llama automáticamente gracias a { immediate: true } 
                // en el watch principal, por lo que no es necesario llamarla aquí.
            });


        // ----------------------------------- Bloque de los filtros ----------------------------------------
            /**
             * Muestra u oculta la sección de filtros.
             */
            const toggleFiltersVisibility = () => {
                areFiltersVisible.value = !areFiltersVisible.value;
            };


        // ----------------------------------- Validaciones de los filtros ----------------------------------------


            /**
             * Valida que el campo 'nombre' solo contenga letras y espacios.
             */
            const validateNombre = () => {

            let value = filters.value.nombre;

            // 1. Manejar solo espacios
            if (value.trim() === '') {
                // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                filters.value.nombre = '';
                lastValidNombre.value = ''; // Resetear el estado válido
                return; 
            }

            // Patrón: Si contiene algo que NO es una letra (con acentos/ñ) O espacio.
            const hasInvalidChar = value.trim().length > 50;

                if (hasInvalidChar) {
                    // 1. Mostrar la alerta
                    error('Error en el nombre', `Puede ser de hasta 50 caracteres.`);

                    // 2. Revertir el valor del filtro al último estado válido conocido.
                    filters.value.nombre = lastValidNombre.value;

                } else {
                    // 3. Si es válido, actualizar la variable de estado válido.
                    lastValidNombre.value = value;
                }
            };

        
            /**
             * Valida que el campo 'cantidad_clases_minima' solo contenga números (0-9). 
            */            
            const validateClasesMinimas = () => {

                let valueMin = filters.value.cantidad_clases_minima;

                // 1. Manejar solo espacios
                if (valueMin.trim() === '') {
                    // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                    filters.value.cantidad_clases_minima = '';
                    lastValidCantidadClasesMinima.value = ''; // Resetear el estado válido
                    return; 
                }

                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                const hasInvalidChar = /[^0-9]/.test(valueMin); 

                    if (hasInvalidChar) {
                        // 1. Mostrar la alerta

                        error('Error en la cantidad de clases mínima', `Sólo puedes ingresar números.`);

                        // 2. Revertir el valor del filtro al último estado válido conocido.
                        // Esto hace que el carácter inválido parezca "borrarse" del input al instante, 
                        // pero la búsqueda no se dispara con el valor incorrecto.
                        filters.value.cantidad_clases_minima = lastValidCantidadClasesMinima.value;

                    } else {
                        // 3. Si es válido, actualizar la variable de estado válido.
                        lastValidCantidadClasesMinima.value = valueMin;
                    }
                
                // Se valida ahora que no supere la cantidad de clases máxima permitida en el sistema
                if(valueMin > 160){
                    error('Error en la cantidad de clases mínima', `La cantidad de clases no puede sobrepasar 160`);
                    filters.value.cantidad_clases_minima = lastValidCantidadClasesMinima.value;
                }
            
            };


            /**
             * Valida que el campo 'cantidad_clases_maxima' solo contenga números (0-9). 
            */            
            const validateClasesMaximas = () => {

                let valueMax = filters.value.cantidad_clases_maxima;

                // 1. Manejar solo espacios
                if (valueMax.trim() === '') {
                    // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                    filters.value.cantidad_clases_maxima = '';
                    lastValidCantidadClasesMaxima.value = ''; // Resetear el estado válido
                    return; 
                }

                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                const hasInvalidChar = /[^0-9]/.test(valueMax); 

                if (hasInvalidChar) {
                    // 1. Mostrar la alerta

                    error('Error en la cantidad de clases máxima', `Sólo puedes ingresar números.`);

                    // 2. Revertir el valor del filtro al último estado válido conocido.
                    // Esto hace que el carácter inválido parezca "borrarse" del input al instante, 
                    // pero la búsqueda no se dispara con el valor incorrecto.
                    filters.value.cantidad_clases_maxima = lastValidCantidadClasesMaxima.value;

                } else {
                    // 3. Si es válido, actualizar la variable de estado válido.
                    lastValidCantidadClasesMaxima.value = valueMax;
                }

                // Se valida ahora que no supere la cantidad de clases máxima permitida en el sistema
                if(valueMax > 160){
                    error('Error en la cantidad de clases máxima', `La cantidad de clases no puede sobrepasar 160`);
                    filters.value.cantidad_clases_maxima = lastValidCantidadClasesMaxima.value;
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


            // Limpia los filtros
            const clearAllFilters = () => {

                // RESTABLECER FILTROS: Asigna una COPIA del estado inicial al valor del ref
                filters.value = { ...initialFilters }; 

                // RECARGAR TABLA
                loadCourses();
            };





      // ----------------------------------- Modals ----------------------------------------

            // ----------------------------------- Creación ----------------------------------------

                /**
                * Abre el modal y lo configura en modo Creación.
                * @param {object|null} account - El objeto de cuenta para editar, o null para crear.
                */
                const openModal = () => {

                    // Modo Creación
                    courseToEdit.value = null;

                    // En cualquier caso, el modal debe hacerse visible
                    isModalVisible.value = true;

                };


                /**
                * Cierra el modal y resetea el estado de edición.
                */
                const closeModal = () => {

                    // Modal oculto
                    isModalVisible.value = false;

                    // Sin objeto a editar
                    courseToEdit.value = null;
                };



</script>




<style scoped>

    .account-type-manager {
    padding: 20px;
    }
    

/* ------------------------- Botón de agregar ------------------------*/

    .btn-outline-pink {
        /* Color de borde y texto por defecto */
        color: #e24cd6; /* Un rosa oscuro para el texto */
        border-color: #e24cd6; /* El borde de color rosa */
    }

    .btn-outline-pink:hover,
    .btn-outline-pink:focus,
    .btn-outline-pink:active {
        /* Color de fondo y borde al pasar el ratón o hacer clic */
        background-color: #db5cd1;
        border-color: #d348c7;
        color: #ffffff; /* Texto blanco para contraste */
        box-shadow: 0 0 0 0.25rem rgba(255, 105, 180, 0.5); /* Sombra de enfoque rosa */
    }



/* ------------------------- Mensajes ------------------------*/


    /* --- Estilo para el contador de resultados (Discreto y a la izquierda) --- */
    .results-summary {
        /* Muestra como un bloque pero que solo ocupa el ancho del contenido */
        display: inline-block;
        
        /* Fondo: Un verde muy claro, sutil */
        background-color: #f2c4fc; 
        /* Texto: Un verde más oscuro para legibilidad */
        color: #7426bd; 

        /* Borde */
        border: 1px solid #8001c9;
        border-radius: 4px;
        
        /* Relleno interno para que se vea como un "tag" o pastilla */
        padding: 5px 10px; 
        
        font-size: 0.9rem; /* Letra un poco más pequeña */
        font-weight: 500; /* Hace que el texto resalte ligeramente */
    }


    /* --- Estilo para el mensaje de "Sin Resultados" (Badge Central) --- */
    .no-results-center-badge {
        /* Estilos base de una pastilla o badge */
        display: inline-block;
        padding: 15px 30px;
        border-radius: 12px;
        
        /* Colores llamativos de advertencia */
        background-color: #ffedcc; /* Naranja/Amarillo muy claro */
        color: #cc8400; /* Texto naranja oscuro */
        border: 1px solid #ffdc9c; 
        
        /* Fuente */
        font-size: 1.15rem; /* Más grande */
        font-weight: 600; /* Seminegrita */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra sutil para destacarse */
    }

    /* Estilo para el texto de sugerencia dentro del badge */
    .no-results-center-badge p {
        font-size: 0.9rem;
        font-weight: 400;
    }



/* ------------------------- La tabla ------------------------*/

    /* --- Estilos para la Tarjeta Contenedora de la Tabla --- */
    .table-card-wrapper {
        /* Darle apariencia de tarjeta */
        border: 1px solid #e9ecef; /* Borde muy claro */
        border-radius: 8px; /* Bordes redondeados */
        background-color: #fff; /* Fondo blanco */
        margin-bottom: 20px; /* Margen debajo */
        
        /* Muy importante: el overflow debe estar visible para que el box-shadow no se recorte */
        overflow: visible;
    }

    /* El table-responsive puede necesitar un ligero ajuste */
    .table-card-wrapper .table-responsive {
        /* El table-responsive ya tiene el overflow-x: auto, pero debe estar dentro del wrapper */
        border-radius: 8px;
        overflow-x: auto; 
    }


    .table-custom {
        margin-bottom: 0; 
    }

    .table-custom td, th  {
        vertical-align: middle; /* Centrar el contenido verticalmente de cada celda*/
    }

    .header-personalizado th{
        /* Color de fondo personalizado (ej. un tono de morado) */
        background-color: #7b19a8; 
        /* Color del texto */
        color: #ffffff; 
    }

    /* ESTILO PARA ANCHO FIJO DE BOTONES DE ACCIÓN */
    .btn-action-fixed {
        /* Define un ancho fijo para estandarizar (ajusta este valor) */
        width: 100px; 
        
        /* Agrega un poco de margen entre botones (si usas 'Editar' y 'Activar' juntos) */
        margin: 2px 4px;
        
        /* Asegura que el texto que exceda el tamaño no sea visible (si fuese el caso) */
        white-space: nowrap; 
    }

    .loading-message {
        font-style: italic;
        color: #6c757d;
        padding: 20px;
    }


    /* Estilos para el control de ancho de las columnas */
    /* Nota: Asegurarse de que el total de anchos sea 100% o la suma de min-width no exceda el ancho de la pantalla */

        /* Columna Nombre */
        .col-nombre {
            width: 10%;
            min-width: 130px; 
            max-width: 250px;
        }

        /* Columna Categoría */
        .col-categoria {
            width: 24%;
            min-width: 140px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Sub-Categoría */
        .col-subcategoria {
            width: 18%;
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Total */
        .col-total {
            width: 10%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

    
        /* Columna Fecha creación */
        .col-fecha_creacion {
            width: 10%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Ultima fecha de actualización */
        .col-fecha_actualizacion {
            width: 10%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Permite grupos */
        .col-permite_grupos {
            width: 6%;
            min-width: 140px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Estado */
        .col-estado {
            width: 6%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 200px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 4. Columna Acciones */
        .col-acciones {
            width: 6%; 
            min-width: 100px; /* CLAVE: El ancho mínimo debe ser suficiente para tus 3 botones */
        }


/* Estilos para el contenedor de filtros */
    .filters-container {
        /* Define el estado visible final */
        padding: 15px; /* Un padding base que animaremos */
        margin-bottom: 20px; /* Un margin base que animaremos */
        
        /* Propiedades para la animación */
        overflow: hidden; /* ¡Crucial! Oculta el contenido extra al colapsar */
        /* Otros estilos de borde, fondo, etc. */
        border: 1px solid #ddd;
        border-radius: 6px;
        background-color: #f8f9fa;
    }
    .filters-container h3 {
        margin-top: 0;
        font-size: 1.2em;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
        margin-bottom: 15px;
    }

/* --- Estilos de Transición para "fade-slide" --- */

    /* Clase activa: define las propiedades y la duración */
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: 
            opacity 0.3s ease-in-out,
            max-height 0.5s ease-in-out,
            padding 0.5s ease-in-out,
            margin 0.5s ease-in-out; /* ¡IMPORTANTE! Animamos padding y margin */
    }

    /* Estado de Inicio (Entrada) y de Fin (Salida) */
    .fade-slide-enter-from,
    .fade-slide-leave-to {
        opacity: 0;
        max-height: 0; /* Colapsa la altura */
        
        /* COLAPSA EL ESPACIO QUE OCUPAN PADRE Y MARGEN */
        padding-top: 0;
        padding-bottom: 0;
        margin-bottom: 0;
        
        /* Si usaste transform: */
        transform: translateY(-10px); 
    }

    /* Estado de Fin (Entrada) y de Inicio (Salida) */
    .fade-slide-enter-to,
    .fade-slide-leave-from {
        opacity: 1;
        /* Un valor grande, pero lo suficientemente grande para cubrir todo el contenido */
        max-height: 500px; 
        
        /* RESTAURA EL ESPACIO ORIGINAL */
        padding-top: 15px; 
        padding-bottom: 15px;
        margin-bottom: 20px; 

        /* Si usaste transform: */
        transform: translateY(0);
    }
</style>

