<template>

  <div class="account-type-manager">

    <h2>Gestión de Obligaciones Financieras</h2>
    <div class="mb-3">
        <!-- Botón para crear una nueva obligación -->
        <button @click="openModal" class="btn btn-outline-pink flex-fill py-2 shadow-sm ms-2 mb-2">
        + Crear Obligación Financiera
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
                    <label for="prefijo">Prefijo:</label>
                    <select id="prefijo" v-model="filters.prefijo" class="form-control">
                        <option value="">Todos</option>
                        <option value="1">V (Venezolano)</option>
                        <option value="2">E (Extranjero)</option>
                        <option value="3">P (Pasaporte)</option>
                        <option value="4">J (Persona Jurídica)</option>
                        <option value="5">G (Gubernamental)</option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="numero_identificacion">Número de Identificación:</label>
                    <input 
                        type="text" 
                        id="numero_identificacion" 
                        v-model="filters.numero_identificacion" 
                        placeholder="Número de identificación..."
                        class="form-control"
                        @input="validateNumeroIdentificacion"
                    >
                </div>


                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="nombre">Nombre de la Entidad:</label>
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
                    <label for="apellido">Apellido de la Entidad:</label>
                    <input 
                        type="text" 
                        id="apellido" 
                        v-model="filters.apellido" 
                        placeholder="Buscar por apellido..."
                        class="form-control"
                        @input="validateApellido"
                    >
                </div>




                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="montoDesde">Monto Desde:</label>
                    <input 
                        type="text" 
                        id="montoDesde" 
                        v-model="filters.montoDesde" 
                        placeholder="Buscar por monto..."
                        class="form-control"
                        @input="validateMontoDesde"
                    >
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="montoHasta">Monto Hasta:</label>
                    <input 
                        type="text" 
                        id="montoHasta" 
                        v-model="filters.montoHasta" 
                        placeholder="Buscar por monto..."
                        class="form-control"
                        @input="validateMontoHasta"
                    >
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
                    <label for="tipo_comprobante">Tipo de Comprobante:</label>
                    <select id="tipo_comprobante" v-model="filters.tipo_comprobante" class="form-control">
                        <option value="">Todos</option>
                        <option 
                            v-for="tipo in tiposDisponibles" 
                            :key="tipo.id" 
                            :value="tipo.id"
                        >
                            {{ tipo.nombre }}
                        </option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="divisa">Divisa:</label>
                    <select id="divisa" v-model="filters.divisa" class="form-control">
                        <option value="">Todas</option>
                        <option 
                            v-for="divisa in divisasDisponibles" 
                            :key="divisa.id" 
                            :value="divisa.id"
                        >
                            {{ divisa.nombre }} ({{ divisa.codigo }})
                        </option>
                    </select>
                </div>



                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="emisionDesde">Emitidos Desde:</label>
                    <input type="date" id="emisionDesde" v-model="filters.emisionDesde" class="form-control" :max="filters.emisionHasta || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="emisionHasta">Emitidos Hasta:</label>
                    <input type="date" id="emisionHasta" v-model="filters.emisionHasta" class="form-control" :min="filters.emisionDesde || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="vencimientoDesde">Vencimiento Desde:</label>
                    <input type="date" id="vencimientoDesde" v-model="filters.vencimientoDesde" class="form-control" :max="filters.vencimientoHasta || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="vencimientoHasta">Vencimiento Hasta:</label>
                    <input type="date" id="vencimientoHasta" v-model="filters.vencimientoHasta" class="form-control" :min="filters.vencimientoDesde || undefined">
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
    v-if="obligationsTypes.length > 0 && !isLoadingTable" 
    class="mb-3 text-start"
    >
        <span class="results-summary" v-html="resultsText"></span>
    </div>

    <!-- Tabla de las obligaciones -->
    <div class="table-card-wrapper hover-lift">
        <div class="table-responsive">
            <table class="table table-striped table-hover table-bordered table-custom">

            <thead class="header-personalizado">
                <tr>
                    <th class="text-center col-numero">Número de Documento</th>
                    <th class="text-center col-tipo">Tipo de Comprobante</th>
                    <th class="text-center col-monto">Monto</th>
                    <th class="text-center col-divisa">Divisa</th>
                    <th class="text-center col-entidad">Entidad</th>
                    <th class="text-center col-emision">Fecha de Emisión</th>
                    <th class="text-center col-vencimiento">Fecha de Vencimiento</th>                  
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

                <tr v-if="obligationsTypes.length > 0" v-for="obligation in obligationsTypes" :key="obligation.id">
                    <td class="">{{ obligation.numero_documento }}</td>
                    <td class="">{{ obligation.tipo_comprobante.nombre }}</td>
                    <td class="">{{ obligation.divisa.simbolo }} {{ obligation.montos.monto_original }}</td>
                    <td class="">{{ obligation.divisa.nombre }}</td>
                    <td class="">{{ obligation.entidad.nombre }} {{ obligation.entidad.apellido }} ({{ obligation.entidad.identificacion.prefijo }}-{{ obligation.entidad.identificacion.numero }})</td>
                    <td class="">{{ obligation.fechas.emision }}</td>
                    <td class="">{{ obligation.fechas.vencimiento }}</td>
                    <td class="">{{ obligation.estado.nombre }}</td>

                    <td class=" text-center">
                        <div class="d-flex flex-row flex-nowrap justify-content-center">

                             <button 
                                class="btn btn-sm btn-outline-info me-1" 
                                @click="showDetailsModal(obligation)" 
                                title="Ver detalles de la Cuenta"
                            >
                                <i class="bi bi-eye-fill"></i> 
                            </button>

                        </div>           
                    </td>
                </tr>
            </tbody>
            

            </table>
        </div>
    </div>

    <!-- Mensaje de que no se encontraron resultados -->
    <div 
        v-if="!isLoadingTable && obligationsTypes.length === 0" 
        class="text-center py-5 mb-5"
    >
        <div class="no-results-center-badge">
            <i class="bi bi-x-circle-fill me-2"></i> No se encontraron obligaciones financieras con los filtros aplicados.
            <p class="mt-2 mb-0 text-muted">Intenta ajustando o limpiando los filtros para ver la lista completa.</p>
        </div>
    </div>

    <!-- Modal para crear  -->
    <FormModal
      :isVisible="isModalVisible"
      :initialData="groupToEdit" 
      @close="closeModal"
      @add-obligation="addObligation"
    />

    <!-- Modal para ver los datos -->
    <DataDetailsModal
        :isVisible="isDetailsModalVisible"
        :Data="registrationToView"
        @close="closeDetailsModal"
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

        import FormModal from './FormularioObligacionFinancieraView.vue';

        import DataDetailsModal from './ObligacionFinancieraDetailsModal.vue';

        // Se importa el objeto axios que permitirá la conexión con la api
        import api from '../../services/api'; 

    // ----------------------------------- Variables ----------------------------------------

        // Rutas
            // Ruta base
            const rutaBase = "/ObligacionFinanciera/"

            // Buscar obligaciones
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear obligación
            const rutaCrear = `${rutaBase}CrearObligacionFinanciera`

            // Rutas de Estados 
            const rutaEstados = "/EstadoObligacion/"
            const rutaBuscarEstados = `${rutaEstados}ObtenerEstadosObligacion` 

            // Rutas de tipos de comprobantes 
            const rutaTipos = "/TipoComprobante/"
            const rutaBuscarComprobantes = `${rutaTipos}ObtenerTiposComprobante` 

            // Rutas de divisas 
            const rutaDivisas = "/Divisa/"
            const rutaBuscarDivisas = `${rutaDivisas}ObtenerDivisas` 


            // Rutas de conceptos financieros 
            const rutaConceptos = "/ConceptoFinanciero/"
            const rutaBuscarConceptos = `${rutaConceptos}BuscarConceptosFinancieros` 


        // Se inicializa como array vacío. Los datos se cargarán de la API al montar el componente.
        const obligationsTypes = ref([]);

        // Propiedad computada para saber que mensaje se pondrá en la cantidad de resultados encontrados
        const resultsText = computed(() => {
            const count = obligationsTypes.value.length;
            if (count === 1) {
                return `🔍 Se encontró ${count} obligación financiera con los filtros aplicados.`;
            } else {
                return `🔍 Se encontraron ${count} obligaciones financieras con los filtros aplicados.`;
            }
        });

        // Ésta variable reactiva permitirá controlar la visibilidad del modal
        const isModalVisible = ref(false);

        // Para controlar la visibilidad del modal de visualización (sólo lectura)
        const isDetailsModalVisible = ref(false); 

         // Para ver los datos 
        const registrationToView = ref(null);


        // Almacena el objeto de la cuenta que se está editando. Es 'null' en el modo creación y se pasa como argumento a la función respectiva
        // para que el modal se muestre en ése modo.
        const registrationToEdit = ref(null); 

        // Variables reactivas para almacenar los datos del servidor
            const estadosDisponibles = ref([]);
            const tiposDisponibles = ref([]);
            const divisasDisponibles = ref([]);

            // Almacena la lista completa de conceptos principales
            const conceptos = ref([]); 
            // Almacena la lista de subconceptos (dependientes del select de concepto)
            const subconceptos = ref([]);

        /* Indicador de carga para la tabla

        Nota: Se inicializa en "true" para que no salga el aviso de que no se encontraron cuentas nada mas se abre la pagina, la función de búsqueda será quien la ponga
        en "false" cuando se ejecute */
        const isLoadingTable = ref(true);

        // Este objeto es la plantilla para el reset (para reiniciar los filtros)
        const initialFilters = {
            nombre: '',
            apellido: '',
            prefijo: '',
            numero_identificacion: '',
            estado: '',
            divisa: '',  
            tipo_comprobante: "",
            emisionDesde: '',
            emisionHasta: '',
            vencimientoDesde: '',
            vencimientoHasta: '',
            montoDesde: '',
            montoHasta: '',
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
        const lastValidApellido = ref('');
        const lastValidNumeroIdentificacion = ref('');
        const lastValidMontoDesde = ref('');
        const lastValidMontoHasta = ref('');
      

        let searchTimeout = null; // Para manejar el debouncing de la búsqueda


  // ----------------------------------- Funciones ----------------------------------------

      // ----------------------------------- API ----------------------------------------

            /**
             * Carga los datos desde la API, AHORA aceptando filtros.
             * @param {object} currentFilters - Objeto con los filtros a aplicar.
             */
            const loadData = async (currentFilters = {}) => {
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

                    obligationsTypes.value = response.data.data; 

                } catch (err) {
                    error('Error de Servidor', 'No se pudieron obtener los datos de las obligaciones financieras. Intente de nuevo.');
                } finally {
                    isLoadingTable.value = false;
                }
            };

            
            

            /**
            * Maneja el evento 'add-obligation' del modal llamando a la API.
            */   
            const addObligation = async (newData) => {
                try {

                    // 1. Llama a la API (POST) para creación
                    const response = await api.post(rutaCrear, newData);

                    exito('Éxito', 'Obligación financiera creada correctamente.');

                    await loadData(); 

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

                    /* El Código debe ser vacío o contener SOLO números (^\d+$).
                    (El .trim() maneja la validación de solo espacios, convirtiéndolos en '') */
                    const numeroIdentificacionValido = newFilters.numero_identificacion.trim() === '' || /^\d+$/.test(newFilters.numero_identificacion);

                    // El Nombre debe ser vacío o contener SOLO caracteres permitidos (letras o espacios)
                    const nombreValido = newFilters.nombre.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(newFilters.nombre);
                    
                    // El Apellido debe ser vacío o contener SOLO caracteres permitidos (letras o espacios)
                    const apellidoValido = newFilters.apellido.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(newFilters.apellido);
            
                    const montoDesdeValidos = newFilters.montoDesde.trim() === '' || /^\d+$/.test(newFilters.montoDesde);
                    const montoHastaValidos = newFilters.montoHasta.trim() === '' || /^\d+$/.test(newFilters.montoHasta);

                    if (!nombreValido || 
                        !apellidoValido || 
                        !numeroIdentificacionValido || 
                        !montoDesdeValidos || 
                        !montoHastaValidos
                    ) {
                        // console.log("Búsqueda cancelada: Filtro con formato inválido.");
                        return; 
                    }

                    // 3. Debounce: Limpia el temporizador anterior y establece uno nuevo
                    clearTimeout(searchTimeout);

                    searchTimeout = setTimeout(() => {

                        // Llama a la función de carga de cuentas con el valor (el objeto) de los filtros si todo está correcto
                        loadData(newFilters);
                    }, 300); // 300ms de espera para estabilizar los inputs de texto
                    
                }, 
                { 
                    deep: true, 
                    immediate: true //  Fuerza la ejecución al montar el componente
                }
            );


            /**
             * Carga la lista de conceptos principales para el select.
             */
            const loadConceptos = async () => {
                try {
                    const response = await api.get(rutaBuscarConceptos); 
                    conceptos.value = response.data.data;
                } catch (err) {
                    // En un entorno real, es mejor usar un toast de advertencia/info si esto falla.
                    error('Error de Servidor', 'No se pudieron cargar las conceptos. Intente de nuevo.');
                }
            };


            /**
             * Carga los subconceptos basadas en el ID del concepto padre.
             * @param {string|number} parentId - ID de la categoría principal seleccionada.
             */
            const loadSubConceptos = async (parentId) => {
                // 1. Resetear el array de subcategorías y el filtro actual
                subconceptos.value = [];
                filters.value.subconceptos = ''; 

                if (!parentId) {
                    return;
                }

                try {
                    // 2. Llamar a la API con el ID de la categoría padre
                    const response = await api.get(rutaBuscarConceptos, {
                        params: { 
                            padre: parentId // Aquí se envía el ID a la URL como ?padre=X
                        }
                    });
                    subconceptos.value = response.data.data;
                } catch (err) {
                    error('Error de Servidor', 'No se pudieron cargar los subconceptos.');
                }
            };

            // WATCH para la dependencia Concepto -> Subconcepto
            // Este watch solo se ejecuta cuando cambia el 'filters.concepto'
            watch(() => filters.value.concepto, (newConceptId) => {
                // Nota: El nombre del filtro es 'categoria' en tu template y filters, no 'categoria_id'
                loadSubConceptos(newConceptId);
                
                // La búsqueda general (loadCourses) se disparará automáticamente 
                // gracias al watch principal con deep: true, después de 300ms.
            });

            onMounted(() => {

                // Cargar la lista inicial de conceptos principales (para llenar el primer select)
                loadConceptos(); 
                
            });




        // ----------------------------------- Funciones de Carga de Datos ----------------------------------------

            /**
             * Carga la lista de estados disponibles desde el servidor.
             */
            async function fetchEstados() {
                try {
                    
                    const response = await api.get(rutaBuscarEstados); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    estadosDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar estados', 'No se pudo obtener la lista de estados del servidor.');
                }
            }

            /**
             * Carga la lista de comprobantes disponibles desde el servidor.
             */
            async function fetchComprobantes() {
                try {
                    
                    const response = await api.get(rutaBuscarComprobantes); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    tiposDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar tipos de comprobantes', 'No se pudo obtener la lista del servidor.');
                }
            }

             /**
             * Carga la lista de divisas disponibles desde el servidor.
             */
            async function fetchDivisas() {
                try {
                    
                    const response = await api.get(rutaBuscarDivisas); 
                    
                    // El servidor devuelve un array de objetos en response.data.data
                    divisasDisponibles.value = response.data.data;

                } catch (err) {
                    error('Error al cargar divisas', 'No se pudo obtener la lista del servidor.');
                }
            }


            // Cargar los datos al montar el componente (cuando se carga la página)
            onMounted(() => {
                fetchEstados();
                fetchComprobantes();
                fetchDivisas();
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
            const hasInvalidChar = /[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/.test(value);

                if (hasInvalidChar) {
                    // 1. Mostrar la alerta
                    error('Error en el nombre', `Sólo puedes ingresar letras y espacios.`);

                    // 2. Revertir el valor del filtro al último estado válido conocido.
                    filters.value.nombre = lastValidNombre.value;

                } else {
                    // 3. Si es válido, actualizar la variable de estado válido.
                    lastValidNombre.value = value;
                }
            };


            /**
             * Valida que el campo 'apellido' solo contenga letras y espacios.
             */
            const validateApellido = () => {

            let value = filters.value.apellido;

            // 1. Manejar solo espacios
            if (value.trim() === '') {
                // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                filters.value.apellido = '';
                lastValidApellido.value = ''; // Resetear el estado válido
                return; 
            }

            // Patrón: Si contiene algo que NO es una letra (con acentos/ñ) O espacio.
            const hasInvalidChar = /[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/.test(value);

                if (hasInvalidChar) {
                    // 1. Mostrar la alerta
                    error('Error en el apellido', `Sólo puedes ingresar letras y espacios.`);

                    // 2. Revertir el valor del filtro al último estado válido conocido.
                    filters.value.apellido = lastValidApellido.value;

                } else {
                    // 3. Si es válido, actualizar la variable de estado válido.
                    lastValidApellido.value = value;
                }

            }


            /**
             * Valida que el campo 'numero_identificacion' solo contenga números (0-9)
            */            
            const validateNumeroIdentificacion = () => {

                let value = filters.value.numero_identificacion;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    filters.value.numero_identificacion = '';
                    lastValidNumeroIdentificacion.value = ''; // Resetear el estado válido
                    return; 
                }

                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                if(/[^0-9]/.test(value)){
                    error("Error en el número de identificación", `Sólo puedes ingresar números.`);
                    filters.value.numero_identificacion = lastValidNumeroIdentificacion.value;
                    return;
                }

                // Si ha pasado todas las validaciones, actualiza el valor válido
                lastValidNumeroIdentificacion.value = value;
            
            };
        

            /**
             * Valida que el campo 'montoDesde' solo contenga números (0-9)
            */            
            const validateMontoDesde = () => {

                let value = filters.value.montoDesde;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    filters.value.montoDesde = '';
                    lastValidMontoDesde.value = ''; // Resetear el estado válido
                    return; 
                }


                if(!/^[0-9]+\.?[0-9]*$/.test(value)){
                    error("Error en el monto 'Desde'", `Sólo puedes ingresar números y un punto como separador decimal.`);
                    filters.value.montoDesde = lastValidMontoDesde.value;
                    return;
                }

                // Si ha pasado todas las validaciones, actualiza el valor válido
                lastValidMontoDesde.value = value;
            
            };

            /**
             * Valida que el campo 'montoHasta' solo contenga números (0-9)
            */            
            const validateMontoHasta = () => {

                let value = filters.value.montoHasta;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    filters.value.montoHasta = '';
                    lastValidMontoHasta.value = ''; // Resetear el estado válido
                    return; 
                }


                if(!/^[0-9]+\.?[0-9]*$/.test(value)){
                    error("Error en el monto 'Hasta'", `Sólo puedes ingresar números y un punto como separador decimal.`);
                    filters.value.montoHasta = lastValidMontoHasta.value;
                    return;
                }

                // Si ha pasado todas las validaciones, actualiza el valor válido
                lastValidMontoHasta.value = value;
            
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
                loadData();
            };





      // ----------------------------------- Modals ----------------------------------------

            // ----------------------------------- Creación ----------------------------------------

                /**
                * Abre el modal y lo configura en modo Creación.
                * @param {object|null} account - El objeto de cuenta para editar, o null para crear.
                */
                const openModal = () => {

                    // Modo Creación
                    registrationToEdit.value = null;

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
                    registrationToEdit.value = null;
   
                };

            // ----------------------------------- Visualización de datos ----------------------------------------

                /**
                 * Muestra el modal de detalles (solo vista) para una entidad.
                 * @param {Object} entity - La entidad seleccionada de la tabla.
                 */
                function showDetailsModal(registration) {
                    registrationToView.value = registration;
                    isDetailsModalVisible.value = true;
                }

                /**
                 * Cierra el modal de detalles.
                 */
                function closeDetailsModal() {
                    isDetailsModalVisible.value = false;
                    registrationToView.value = null; // Limpiar los datos al cerrar
                    loadData();
                }




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
        .col-numero {
            width: 16%;
            min-width: 130px; 
            max-width: 250px;
        }

        .col-tipo {
            width: 15%;
            min-width: 140px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        .col-monto {
            width: 9%;
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        .col-divisa {
            width: 16%;
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        .col-entidad {
            width: 20%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }
 
        .col-emision {
            width: 5%;
            min-width: 120px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        .col-vencimiento {
            width: 5%;
            min-width: 120px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }


        .col-estado {
            width: 8%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 200px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

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

