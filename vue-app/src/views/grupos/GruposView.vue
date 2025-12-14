<template>

  <div class="account-type-manager">

    <h2>Gestión de Grupos</h2>
    <div class="mb-3">
        <!-- Botón para crear un nuevo curso -->
        <button @click="openModal" class="btn btn-outline-pink flex-fill py-2 shadow-sm ms-2 mb-2">
        + Agregar Nuevo Grupo
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
                    <label for="docente">Docente:</label>
                    <input 
                        type="text" 
                        id="docente" 
                        v-model="filters.docente" 
                        placeholder="Número de identificación..."
                        class="form-control"
                        @input="validateDocente"
                    >
                </div>


                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="nombre">Nombre del Grupo:</label>
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
                    <label for="modalidad">Modalidad:</label>
                    <select id="modalidad" v-model="filters.modalidad" class="form-control">
                        <option value="">Todas</option>
                        <option 
                            v-for="modalidad in modalidadesDisponibles" 
                            :key="modalidad.id" 
                            :value="modalidad.id"
                            :title="modalidad.descripcion"
                        >
                            {{ modalidad.nombre }}
                        </option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="estado">Estado:</label>
                    <select id="estado" v-model="filters.estado" class="form-control">
                        <option value="">Todos</option>
                        <option 
                            v-for="estado in estadosDisponibles" 
                            :key="estado.id" 
                            :value="estado.id"
                            :title="estado.descripcion"
                        >
                            {{ estado.nombre }}
                        </option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="periodo">Periodo:</label>
                    <select id="periodo" v-model="filters.periodo" class="form-control">
                        <option value="">Todos</option>
                        <option 
                            v-for="periodo in periodosDisponibles" 
                            :key="periodo.id" 
                            :value="periodo.id"
                            :title="periodo.descripcion"
                        >
                            {{ periodo.nombre }}
                        </option>
                    </select>
                </div>


                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="cupoDesde">Cupos desde:</label>
                    <input 
                        type="text" 
                        id="cupoDesde" 
                        v-model="filters.cupoDesde" 
                        placeholder="Buscar por cantidad de cupos desde..."
                        class="form-control"
                        @input="validateCupoDesde"
                    >
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="cupoHasta">Cupos hasta:</label>
                    <input 
                        type="text" 
                        id="cupoHasta" 
                        v-model="filters.cupoHasta" 
                        placeholder="Buscar por cantidad de cupos hasta..."
                        class="form-control"
                        @input="validateCupoHasta"
                    >
                </div>

                 <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="costoInscripcionDesde">Costo de inscripción desde:</label>
                    <input 
                        type="text" 
                        id="costoInscripcionDesde" 
                        v-model="filters.costoInscripcionDesde" 
                        placeholder="Buscar por costo de inscripción desde..."
                        class="form-control"
                        @input="validateCostoInscripcionDesde"
                    >
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="costoInscripcionHasta">Costo de inscripción hasta:</label>
                    <input 
                        type="text" 
                        id="costoInscripcionHasta" 
                        v-model="filters.costoInscripcionHasta" 
                        placeholder="Buscar por costo de inscripción hasta..."
                        class="form-control"
                        @input="validateCostoInscripcionHasta"
                    >
                </div>


                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="costoClaseDesde">Costo de clase desde:</label>
                    <input 
                        type="text" 
                        id="costoClaseDesde" 
                        v-model="filters.costoClaseDesde" 
                        placeholder="Buscar por costo de clase desde..."
                        class="form-control"
                        @input="validateCostoClaseDesde"
                    >
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="costoClaseHasta">Costo de clase hasta:</label>
                    <input 
                        type="text" 
                        id="costoClaseHasta" 
                        v-model="filters.costoClaseHasta" 
                        placeholder="Buscar por costo de clase hasta..."
                        class="form-control"
                        @input="validateCostoClaseHasta"
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
                

            </div>


        </div>

    </Transition>

    <!-- Mensaje de la cantidad de resultados encontrados -->
    <div 
    v-if="groupsTypes.length > 0 && !isLoadingTable" 
    class="mb-3 text-start"
    >
        <span class="results-summary" v-html="resultsText"></span>
    </div>

    <!-- Tabla de los grupos -->
    <div class="table-card-wrapper hover-lift">
        <div class="table-responsive">
            <table class="table table-striped table-hover table-bordered table-custom">

            <thead class="header-personalizado">
                <tr>
                    <th class="text-center col-nombre">Nombre</th>
                    <th class="text-center col-curso">Curso</th>
                    <th class="text-center col-modalidad">Modalidad</th>
                    <th class="text-center col-docente">Docente</th>
                    <th class="text-center col-inscripcion">Costo Inscripción</th>
                    <th class="text-center col-clase">Costo por Clase</th>
                    <th class="text-center col-estado">Estado</th>
                    <th class="text-center col-acciones">Acciones</th>
                </tr>
            </thead>

            
            <tbody>
                <tr v-if="isLoadingTable">
                    <td colspan="13" class="text-center">
                        <span class="loading-message">Cargando datos...</span>
                    </td>
                </tr>

                <tr v-if="groupsTypes.length > 0" v-for="group in groupsTypes" :key="group.id">
                    <td class="">{{ group.nombre }}</td>
                    <td class="">{{ group.curso.nombre }}</td>
                    <td class="">{{ group.modalidad.nombre }}</td>
                    <td class="">{{ group.docente.entidad.nombre }} {{ group.docente.entidad.apellido ?? "" }} ({{ group.docente.entidad.prefijo }}-{{ group.docente.entidad.numero_identificacion}})</td>
                    <td class="">{{ group.costo_inscripcion }}</td>
                    <td class="">{{ group.costo_clase}}</td>
                    <td class="">{{ group.estado.nombre }}</td>

                    <td class=" text-center">
                        <div class="d-flex flex-row flex-nowrap justify-content-center">

                            <router-link 
                                :to="{ 
                                    name: 'GroupDetails', 
                                    params: { id: group.id } 
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
        v-if="!isLoadingTable && groupsTypes.length === 0" 
        class="text-center py-5 mb-5"
    >
        <div class="no-results-center-badge">
            <i class="bi bi-x-circle-fill me-2"></i> No se encontraron grupos con los filtros aplicados.
            <p class="mt-2 mb-0 text-muted">Intenta ajustando o limpiando los filtros para ver la lista completa.</p>
        </div>
    </div>

    <!-- Modal para crear un curso -->
    <GroupFormModal
      :isVisible="isModalVisible"
      :initialData="groupToEdit" 
      @close="closeModal"
      @add-group="addGroup"
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

        import GroupFormModal from './FormularioGruposView.vue';

        // Se importa el objeto axios que permitirá la conexión con la api
        import api from '../../services/api'; 

    // ----------------------------------- Variables ----------------------------------------

        // Rutas
            // Ruta base
            const rutaBase = "/Grupo/"

            // Buscar grupo
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear grupo
            const rutaCrear = `${rutaBase}CrearGrupo`

            // Rutas de Estados 
            const rutaEstadosGrupo = "/EstadoGrupo/"
            const rutaBuscarEstados = `${rutaEstadosGrupo}ObtenerEstadosGrupo` 

            // Rutas de Modalidades 
            const rutaModalidades = "/ModalidadClase/"
            const rutaBuscarModalidades = `${rutaModalidades}ObtenerModalidades` 

            // Rutas de Periodos 
            const rutaPeriodos = "/Periodo/"
            const rutaBuscarPeriodos = `${rutaPeriodos}Buscar` 


        // Se inicializa como array vacío. Los datos se cargarán de la API al montar el componente.
        const groupsTypes = ref([]);

        // Propiedad computada para saber que mensaje se pondrá en la cantidad de resultados encontrados
        const resultsText = computed(() => {
            const count = groupsTypes.value.length;
            if (count === 1) {
                return `🔍 Se encontró ${count} grupo con los filtros aplicados.`;
            } else {
                return `🔍 Se encontraron ${count} grupos con los filtros aplicados.`;
            }
        });

        // Ésta variable reactiva permitirá controlar la visibilidad del modal
        const isModalVisible = ref(false);


        // Almacena el objeto de la cuenta que se está editando. Es 'null' en el modo creación y se pasa como argumento a la función respectiva
        // para que el modal se muestre en ése modo.
        const groupToEdit = ref(null); 

        // Variables reactivas para almacenar los datos del servidor
        const modalidadesDisponibles = ref([]);
        const estadosDisponibles = ref([]);
        const periodosDisponibles = ref([]);

        /* Indicador de carga para la tabla

        Nota: Se inicializa en "true" para que no salga el aviso de que no se encontraron cuentas nada mas se abre la pagina, la función de búsqueda será quien la ponga
        en "false" cuando se ejecute */
        const isLoadingTable = ref(true);

        // Este objeto es la plantilla para el reset (para reiniciar los filtros)
        const initialFilters = {
            nombre: '',
            estado: '',
            docente: '',
            modalidad: '',
            periodo: '',
            cupoDesde: '',
            cupoHasta: '',
            costoInscripcionDesde: '',
            costoInscripcionHasta: '',
            costoClaseDesde: '',
            costoClaseHasta: '',
            creadosDesde: '',
            creadosHasta: '',
            modificadosDesde: '',
            modificadosHasta: '',
        };




        // Utiliza ese estado inicial para el objeto reactivo
        const filters = ref({ ...initialFilters });

        // Variable reactiva para controlar la visibilidad del contenedor de filtros
        const areFiltersVisible = ref(false);

    
        // Variables que almacenan el último valor de filtro que fue válido
        const lastValidNombre = ref('');
        const lastValidDocente = ref('');
        const lastValidCupoDesde = ref('');
        const lastValidCupoHasta = ref('');
        const lastValidInscripcionDesde = ref('');
        const lastValidInscripcionHasta = ref('');
        const lastValidCostoClaseDesde = ref('');
        const lastValidCostoClaseHasta = ref('');

        let searchTimeout = null; // Para manejar el debouncing de la búsqueda


  // ----------------------------------- Funciones ----------------------------------------

      // ----------------------------------- API ----------------------------------------

            /**
             * Carga los datos desde la API, AHORA aceptando filtros.
             * @param {object} currentFilters - Objeto con los filtros a aplicar.
             */
            const loadGroups = async (currentFilters = {}) => {
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

                    groupsTypes.value = response.data.data; 

                } catch (err) {
                    error('Error de Servidor', 'No se pudieron obtener los datos de los grupos. Intente de nuevo.');
                } finally {
                    isLoadingTable.value = false;
                }
            };

            
            

            /**
            * Maneja el evento 'add-group' del modal llamando a la API.
            */   
            const addGroup = async (newData) => {
                try {

                    // 1. Llama a la API (POST) para creación
                    const response = await api.post(rutaCrear, newData);

                    exito('Éxito', 'Curso creado correctamente.');

                    await loadGroups(); 

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
            
                const nombreValido = newFilters.nombre.length <= 50;
                
                const cuposDesdeValidos = newFilters.cupoDesde.trim() === '' || /^\d+$/.test(newFilters.cupoDesde);
                const cuposHastaValidos = newFilters.cupoHasta.trim() === '' || /^\d+$/.test(newFilters.cupoHasta);

                const costoInscripcionDesdeValido = newFilters.costoInscripcionDesde.trim() === '' || /^[0-9]+\.?[0-9]*$/.test(newFilters.costoInscripcionDesde);
                const costoInscripcionHastaValido = newFilters.costoInscripcionHasta.trim() === '' || /^[0-9]+\.?[0-9]*$/.test(newFilters.costoInscripcionHasta);
                
                const costoClaseDesdeValido = newFilters.costoClaseDesde.trim() === '' || /^[0-9]+\.?[0-9]*$/.test(newFilters.costoClaseDesde);
                const costoClaseHastaValido = newFilters.costoClaseHasta.trim() === '' || /^[0-9]+\.?[0-9]*$/.test(newFilters.costoClaseHasta);
                



                // 2. Compuerta de seguridad: CANCELAR la búsqueda si algún filtro es inválido
                // Esto captura el estado intermedio inválido (ej. '1A') y lo ignora.
                if (!nombreValido || 
                    !cuposDesdeValidos || 
                    !cuposHastaValidos || 
                    !costoInscripcionDesdeValido || 
                    !costoInscripcionHastaValido ||
                    !costoClaseDesdeValido || 
                    !costoClaseHastaValido 
                ) {
                    // console.log("Búsqueda cancelada: Filtro con formato inválido.");
                    return; 
                }

                // 3. Debounce: Limpia el temporizador anterior y establece uno nuevo
                clearTimeout(searchTimeout);

                searchTimeout = setTimeout(() => {

                    // VALIDACIÓN CRUZADA: Minima > Maxima
                    /* Nota: Se debe colocar dentro del setTimeout para garantizar que no se dispare cada vez que el usuario
                    escribe un número (por ejemplo, que con cada número escrito salga el error de que el número de cupo "Hasta" 
                    debe ser mayor que el número de cupo "Desde", a pesar de que el usuario apenas ha comenzado a escribir el
                    número y no ha terminado, es horrible, por lo que meterlo dentro del retrase de tiempo le da un margen 
                    mínimo de tiempo al usuario de escribir el número*/
                   if (!validarRangosFiltros(newFilters)) {
                        return; // Detiene la acción de búsqueda y ya mostró el error dentro de la función
                    }

                    // Llama a la función de carga de cuentas con el valor (el objeto) de los filtros si todo está correcto
                    loadGroups(newFilters);
                }, 300); // 300ms de espera para estabilizar los inputs de texto
                
                }, 
                { 
                    deep: true, 
                    immediate: true //  Fuerza la ejecución al montar el componente
                }
            );

            function validarRangosFiltros(newFilters){

            
                const cupoDesde = newFilters.cupoDesde ? parseInt(newFilters.cupoDesde, 10) : null;
                const cupoHasta = newFilters.cupoHasta ? parseInt(newFilters.cupoHasta, 10) : null;

                const costoInscripcionDesde = newFilters.costoInscripcionDesde ? parseFloat(newFilters.costoInscripcionDesde) : null;
                const costoInscripcionHasta = newFilters.costoInscripcionHasta ? parseFloat(newFilters.costoInscripcionHasta) : null;

                const costoClaseDesde = newFilters.costoClaseDesde ? parseFloat(newFilters.costoClaseDesde) : null;
                const costoClaseHasta = newFilters.costoClaseHasta ? parseFloat(newFilters.costoClaseHasta) : null;


                // Validación de Cupos
                if (cupoDesde !== null && cupoHasta !== null && cupoDesde > cupoHasta) {
                    error('Error de Rango', `El cupo 'Desde' (${cupoDesde}) no puede ser mayor que el cupo 'Hasta' (${cupoHasta}).`);
                    return false;
                }

                // Validación de Costo de Inscripción
                if (costoInscripcionDesde !== null && costoInscripcionHasta !== null && costoInscripcionDesde > costoInscripcionHasta) {
                    error('Error de Rango', `El costo de inscripción 'Desde' (${costoInscripcionDesde}) no puede ser mayor que 'Hasta' (${costoInscripcionHasta}).`);
                    return false;
                }

                // Validación de Costo de Clase
                if (costoClaseDesde !== null && costoClaseHasta !== null && costoClaseDesde > costoClaseHasta) {
                    error('Error de Rango', `El costo de clase 'Desde' (${costoClaseDesde}) no puede ser mayor que 'Hasta' (${costoClaseHasta}).`);
                    return false;
                }

                return true;
                
            }


        // ----------------------------------- Funciones de Carga de Datos ----------------------------------------

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

            // Cargar los datos al montar el componente (cuando se carga la página)
            onMounted(() => {
                fetchModalidades();
                fetchEstados();
                fetchPeriodos();
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
             * Valida que el campo 'nombre' no supere los 50 caracteres
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
             * Valida que el campo 'docente' solo contenga números (0-9)
            */            
            const validateDocente = () => {

                let value = filters.value.docente;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    filters.value.docente = '';
                    lastValidDocente.value = ''; // Resetear el estado válido
                    return; 
                }

                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                if(/[^0-9]/.test(value)){
                    error("Error en el número de identificación docente", `Sólo puedes ingresar números.`);
                    filters.value.docente = lastValidDocente.value;
                    return;
                }

                // Si ha pasado todas las validaciones, actualiza el valor válido
                lastValidDocente.value = value;
            
            };




            /**
             * Valida que el campo 'cupoDesde' solo contenga números (0-9). 
            */            
            const validateCupoDesde = () => {

                let value = filters.value.cupoDesde;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    filters.value.cupoDesde = '';
                    lastValidCupoDesde.value = ''; // Resetear el estado válido
                    return; 
                }

                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                if(/[^0-9]/.test(value)){
                    error("Error en el cupo 'Desde'", `Sólo puedes ingresar números.`);
                    filters.value.cupoDesde = lastValidCupoDesde.value;
                    return;
                }

                // Validación de límite de valor (después de validar el formato)
                const numericValue = parseInt(value, 10);
                if (numericValue > 400) {
                    error("Error en el cupo 'Desde'", `La cantidad no puede sobrepasar 400`);
                    // REVERTIR al último valor válido conocido
                    filters.value.cupoDesde = lastValidCupoDesde.value;
                    return;
                }

                // Si ha pasado todas las validaciones, actualiza el valor válido
                lastValidCupoDesde.value = value;
            
            };


            /**
             * Valida que el campo 'cupoHasta' solo contenga números (0-9). 
            */            
            const validateCupoHasta = () => {

                let value = filters.value.cupoHasta;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                    filters.value.cupoHasta = '';
                    lastValidCupoHasta.value = ''; // Resetear el estado válido
                    return; 
                }


                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                if(/[^0-9]/.test(value)){
                    error("Error en el cupo 'Hasta'", `Sólo puedes ingresar números.`);
                     filters.value.cupoHasta = lastValidCupoHasta.value;
                    return;
                }

                // Validación de límite de valor (después de validar el formato)
                const numericValue = parseInt(value, 10);
                if (numericValue > 400) {
                    error("Error en el cupo 'Hasta'", `La cantidad no puede sobrepasar 400`);
                    filters.value.cupoHasta = lastValidCupoHasta.value;
                    return;
                }

                // Si ha pasado todas las validaciones, actualiza el valor válido
                lastValidCupoHasta.value = value;

            };


            /**
             * Valida que el campo 'costoInscripcionDesde' solo contenga números enteros o decimales. 
            */            
            const validateCostoInscripcionDesde = () => {

                let value = filters.value.costoInscripcionDesde;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    filters.value.costoInscripcionDesde = '';
                    lastValidInscripcionDesde.value = ''; // Resetear el estado válido
                    return; 
                }

                /* Patrón: ^ inicio, $ fin
                 [0-9]+  al menos un dígito
                 \.?     opcionalmente un punto (el punto debe escaparse con \.)
                [0-9]* cero o más dígitos después del punto */
                if (!/^[0-9]+\.?[0-9]*$/.test(value)) {
                    error("Error en el costo de inscripción 'Desde'", `Sólo puedes ingresar números y un punto como separador decimal`);
                    filters.value.costoInscripcionDesde = lastValidInscripcionDesde.value;
                    return;
                }
        
                if(value > 1000){
                    error("Error en el costo de inscripción 'Desde'", `La cantidad no puede sobrepasar 1000$`);
                    filters.value.costoInscripcionDesde = lastValidInscripcionDesde.value;
                    return;
                }

                lastValidInscripcionDesde.value = value;
            
            };


            /**
             * Valida que el campo 'costoInscripcionHasta' solo contenga números (0-9). 
            */            
            const validateCostoInscripcionHasta = () => {

                let value = filters.value.costoInscripcionHasta;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                    filters.value.costoInscripcionHasta = '';
                    lastValidInscripcionHasta.value = ''; // Resetear el estado válido
                    return; 
                }

  
                 if (!/^[0-9]+\.?[0-9]*$/.test(value)) {
                    error("Error en el costo de inscripción 'Hasta'", `Sólo puedes ingresar números y un punto como separador decimal`);
                    filters.value.costoInscripcionHasta = lastValidInscripcionHasta.value;
                    return;

                } 

                if(value > 1000){
                    error("Error en el costo de inscripción 'Hasta'", `La cantidad no puede sobrepasar 1000$`);
                    filters.value.costoInscripcionHasta = lastValidInscripcionHasta.value;
                    return;
                }

                lastValidInscripcionHasta.value = value;

            };



            /**
             * Valida que el campo 'costoClaseDesde' solo contenga números enteros o decimales. 
            */            
            const validateCostoClaseDesde = () => {

                let value = filters.value.costoClaseDesde;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    filters.value.costoClaseDesde = '';
                    lastValidCostoClaseDesde.value = ''; // Resetear el estado válido
                    return; 
                }


                if (!/^[0-9]+\.?[0-9]*$/.test(value)) {        
                    error("Error en el costo de clase 'Desde'", `Sólo puedes ingresar números y un punto como separador decimal`);
                    filters.value.costoClaseDesde = lastValidCostoClaseDesde.value;
                    return;

                }
                
                if(value > 50){
                    error("Error en el costo de clase 'Desde'", `La cantidad no puede sobrepasar 50$`);
                    filters.value.costoClaseDesde = lastValidCostoClaseDesde.value;
                    return;
                }

                lastValidCostoClaseDesde.value = value;
            
            };

            /**
             * Valida que el campo 'costoClaseHasta' solo contenga números enteros o decimales. 
            */            
            const validateCostoClaseHasta = () => {

                let value = filters.value.costoClaseHasta;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                    filters.value.costoClaseHasta = '';
                    lastValidCostoClaseHasta.value = ''; // Resetear el estado válido
                    return; 
                }

  
                if (!/^[0-9]+\.?[0-9]*$/.test(value)) {
                    error("Error en el costo de clase 'Hasta'", `Sólo puedes ingresar números y un punto como separador decimal`);
                    filters.value.costoClaseHasta = lastValidCostoClaseHasta.value;
                    return;

                }


                if(value > 50){
                    error("Error en el costo de clase 'Hasta'", `La cantidad no puede sobrepasar 50$`);
                    filters.value.costoClaseHasta = lastValidCostoClaseHasta.value;
                    return;
                }

                lastValidCostoClaseHasta.value = value;

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
                loadGroups();
            };





      // ----------------------------------- Modals ----------------------------------------

            // ----------------------------------- Creación ----------------------------------------

                /**
                * Abre el modal y lo configura en modo Creación.
                * @param {object|null} account - El objeto de cuenta para editar, o null para crear.
                */
                const openModal = () => {

                    // Modo Creación
                    groupToEdit.value = null;

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
                    groupToEdit.value = null;
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
            width: 20%;
            min-width: 130px; 
            max-width: 250px;
        }

        /* Columna Curso */
        .col-curso {
            width: 24%;
            min-width: 140px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Modalidad */
        .col-modalidad {
            width: 9%;
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Docente */
        .col-docente {
            width: 21%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

    
        /* Columna Inscripción */
        .col-inscripcion {
            width: 5%;
            min-width: 120px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Ultima fecha de actualización */
        .col-clase {
            width: 5%;
            min-width: 120px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }


        /* Columna Estado */
        .col-estado {
            width: 8%;
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

