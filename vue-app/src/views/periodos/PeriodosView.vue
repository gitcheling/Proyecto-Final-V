<template>

  <div class="account-type-manager">

    <h2>Gestión de Periodos</h2>
    <div class="mb-3">
        <!-- Botón para crear una nueva cuenta -->
        <button @click="openModal" class="btn btn-outline-pink flex-fill py-2 shadow-sm ms-2 mb-2">
        + Agregar Nuevo Periodo
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
                    <label for="iniciadosDesde">Iniciados Desde:</label>
                    <input type="date" id="iniciadosDesde" v-model="filters.iniciadosDesde" class="form-control" :max="filters.iniciadosHasta || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="iniciadosHasta">Iniciados Hasta:</label>
                    <input type="date" id="iniciadosHasta" v-model="filters.iniciadosHasta" class="form-control" :min="filters.iniciadosDesde || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="finalizadosDesde">Finalizados Desde:</label>
                    <input type="date" id="finalizadosDesde" v-model="filters.finalizadosDesde" class="form-control" :max="filters.finalizadosHasta || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="finalizadosHasta">Finalizados Hasta:</label>
                    <input type="date" id="finalizadosHasta" v-model="filters.finalizadosHasta" class="form-control" :min="filters.finalizadosDesde || undefined">
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
    v-if="periodTypes.length > 0 && !isLoadingTable" 
    class="mb-3 text-start"
    >
        <span class="results-summary" v-html="resultsText"></span>
    </div>

    <!-- Tabla de las cuentas -->
    <div class="table-card-wrapper hover-lift">
        <div class="table-responsive">
            <table class="table table-striped table-hover table-bordered table-custom">

            <thead class="header-personalizado">
                <tr>
                    <th class="text-center col-nombre">Nombre</th>
                    <th class="text-center col-inicio">Fecha de inicio</th>
                    <th class="text-center col-fin">Fecha de finalización</th>
                    <th class="text-center col-meses">Duración (Meses)</th>
                    <th class="text-center col-dias">Duración (Días)</th>
                    <th class="text-center col-fecha_creacion">Fecha de creación</th>
                    <th class="text-center col-fecha_actualizacion">Última modificación</th>
                    <th class="text-center col-estado">Estado</th>
                    <th class="text-center col-acciones">Acciones</th>
                </tr>
            </thead>

            
            <tbody>
                <tr v-if="isLoadingTable">
                    <td colspan="10" class="text-center">
                        <span class="loading-message">Cargando datos...</span>
                    </td>
                </tr>

                <tr v-if="periodTypes.length > 0" v-for="period in periodTypes" :key="period.id">
                    <td>{{ period.nombre }}</td>
                    <td>{{ formatDateTime(period.inicio) }}</td>
                    <td>{{ formatDateTime(period.fin) }}</td>
                    <td>{{ calculatePeriodDuration(period.inicio, period.fin).meses }}</td>
                    <td>{{ calculatePeriodDuration(period.inicio, period.fin).dias }}</td>
                    <td>{{ formatDateTime(period.fechaCreacion) }}</td>
                    <td>{{ formatDateTime(period.fechaActualizacion) }}</td>

                    <td>
                        {{ period.estado ?? "N/A"}}
                    </td>
                    <td class="text-center">           
                    
                        <button 
                        class="btn btn-sm btn-outline-info"
                        :disabled="isPeriodFinalizado(period.estado)"
                        @click="openModal(period)"          
                        >
                        <i class="bi bi-pencil"></i>
                        </button>               
                    </td>
                </tr>
            </tbody>
            

            </table>
        </div>
    </div>

    <!-- Mensaje de que no se encontraron resultados -->
    <div 
        v-if="!isLoadingTable && periodTypes.length === 0" 
        class="text-center py-5 mb-5"
    >
        <div class="no-results-center-badge">
            <i class="bi bi-x-circle-fill me-2"></i> No se encontraron periodos con los filtros aplicados.
            <p class="mt-2 mb-0 text-muted">Intenta ajustando o limpiando los filtros para ver la lista completa.</p>
        </div>
    </div>

    <!-- Modal para crear o editar un periodo -->
    <PeriodFormModal
      :isVisible="isModalVisible"
      :initialData="periodToEdit" 
      @close="closeModal"
      @add-period="addPeriod"
      @update-period="updatePeriod" 
    />

  </div>
  
    
</template>


<script setup>

    // ----------------------------------- Importaciones ----------------------------------------
     
        import { ref, watch, computed } from 'vue';

        // Se importa el hook de las notificaciones toast
        import { useToast } from '../../services/notificacionesService';

        // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
        const { exito, error, info, warning } = useToast();

        import PeriodFormModal from './FormularioPeriodosView.vue';

        // Se importa el objeto axios que permitirá la conexión con la api
        import api from '../../services/api'; 

        import dayjs from 'dayjs';
        // Se necesita el plugin de diferencia avanzada para meses/años con precisión
        import duration from 'dayjs/plugin/duration';
        import isBetween from 'dayjs/plugin/isBetween';
        dayjs.extend(duration);
        dayjs.extend(isBetween);

        // Rutas
            // Ruta base
            const rutaBase = "/Periodo/"

            // Buscar periodos
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear periodo
            const rutaCrear= `${rutaBase}CrearPeriodo`

            // Modificar cuenta
            const rutaModificar = `${rutaBase}Modificar`



    // ----------------------------------- Variables ----------------------------------------

        // Se inicializa como array vacío. Los datos se cargarán de la API al montar el componente.
        const periodTypes = ref([]);

        // Propiedad computada para saber que mensaje se pondrá en la cantidad de resultados encontrados
        const resultsText = computed(() => {
            const count = periodTypes.value.length;
            if (count === 1) {
                return `🔍 Se encontró ${count} periodo con los filtros aplicados.`;
            } else {
                return `🔍 Se encontraron ${count} periodos con los filtros aplicados.`;
            }
        });


        // Ésta variable reactiva permitirá controlar la visibilidad del modal
        const isModalVisible = ref(false);

        // Almacena el objeto del periodo que se está editando. Es 'null' en el modo creación y se pasa como argumento a la función respectiva
        // para que el modal se muestre en ése modo.
        const periodToEdit = ref(null); 

        /* Indicador de carga para la tabla
        
        Nota: Se inicializa en "true" para que no salga el aviso de que no se encontraron cuentas nada mas se abre la pagina, la función de búsqueda será quien la ponga
        en "false" cuando se ejecute */
        const isLoadingTable = ref(true);


        // Este objeto es la plantilla para el reset (para reiniciar los filtros)
        const initialFilters = {
            nombre: '', 
            iniciadosDesde: '',
            iniciadosHasta: '',
            finalizadosDesde: '',
            finalizadosHasta: '',
            creadosDesde: '',
            creadosHasta: '',
            modificadosDesde: '',
            modificadosHasta: '',
        };

        // Utiliza ese estado inicial para el objeto reactivo
        const filters = ref({ ...initialFilters });

        // Variable reactiva para controlar la visibilidad del contenedor de filtros
        const areFiltersVisible = ref(false);

        // Variables que almacenan el último valor de filtro que fue válido (para nombre y código)
        const lastValidNombre = ref('');

        let searchTimeout = null; // Para manejar el debouncing de la búsqueda


    // ----------------------------------- Funciones ----------------------------------------

      // ----------------------------------- API ----------------------------------------
      
            /**
             * Carga los datos desde la API, AHORA aceptando filtros.
             * @param {object} currentFilters - Objeto con los filtros a aplicar.
             */
            const loadPeriods = async (currentFilters = {}) => {
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

                    periodTypes.value = response.data.data; 

                } catch (err) {
                    error('Error de Servidor', 'No se pudieron obtener los datos de los periodos. Intente de nuevo.');
                } finally {
                    isLoadingTable.value = false;
                }
            };


            watch(
                filters, // Monitorea la referencia ref directamente
                (newFilters) => {
                
             
                // El Nombre debe ser vacío o contener SOLO caracteres permitidos (letras, espacios, guiones, etc.)
                const nombreValido = newFilters.nombre.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\-/]+$/.test(newFilters.nombre);
            
                
                // 2. Compuerta de seguridad: CANCELAR la búsqueda si algún filtro es inválido
                // Esto captura el estado intermedio inválido (ej. '1A') y lo ignora.
                if (!nombreValido) {
                    // console.log("Búsqueda cancelada: Filtro con formato inválido.");
                    return; 
                }

                // 3. Debounce: Limpia el temporizador anterior y establece uno nuevo
                clearTimeout(searchTimeout);

                searchTimeout = setTimeout(() => {
                    // Llama a la función de carga de cuentas con el valor (el objeto) de los filtros si todo está correcto
                    loadPeriods(newFilters);
                }, 300); // 300ms de espera para estabilizar los inputs de texto
                
                }, 
                { 
                    deep: true, 
                    immediate: true //  Fuerza la ejecución al montar el componente
                }
            );


            /**
            * Maneja el evento 'add-period' del modal llamando a la API.
            */   
            const addPeriod = async (newData) => {
                try {
                    
                    const response = await api.post(rutaCrear, newData);

                    // Mostrar alerta de éxito al usuario
                    exito('Éxito', 'Periodo creada correctamente.');

                    await loadPeriods(); 

                    // 4. Cerrar el modal.
                    closeModal();

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

                    error('Error al crear el periodo', mensajeError);
                }
            };


            /**
             * Maneja el evento 'update-period' del modal llamando a la API.
             */
            const updatePeriod = async (updatedData) => {
                try {
                // 1. Llama a la API (PUT) para actualizar la cuenta.
                // La ruta incluye el ID: /api/accounts/:id
                const response = await api.put(`${rutaModificar}/${updatedData.id}`, updatedData);

                // Mostrar alerta de éxito al usuario
                exito('Éxito', 'Periodo modificada correctamente.');

                await loadPeriods(); 

                // 4. Cerrar el modal.
                closeModal();


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

                    error('Error al modificar el periodo', mensajeError);
                }
            };

        // ----------------------------------- Lógica de Deshabilitado ----------------------------------------

            /**
             * Verifica si el periodo está en estado "Finalizado".
             * @param {string} estado - El estado actual del periodo.
             * @returns {boolean} True si el estado es 'Finalizado', false en caso contrario.
             */
            const isPeriodFinalizado = (estado) => {
                // Hacemos una comprobación simple y sensible a mayúsculas/minúsculas.
                // Si quieres que sea insensible, puedes usar: estado?.toLowerCase() === 'finalizado'.
                return estado === 'Finalizado';
            };



        // ----------------------------------- Bloque de los filtros ----------------------------------------
            /**
             * Muestra u oculta la sección de filtros.
             */
            const toggleFiltersVisibility = () => {
                areFiltersVisible.value = !areFiltersVisible.value;
            };


        // ----------------------------------- Filtros ----------------------------------------

            /**
             * Valida que el campo 'Nombre' solo contenga letras, espacios, guiones y barras.
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

                // Patrón: Si contiene algo que NO es una letra (con acentos/ñ), espacio, guión o barra.
                const hasInvalidChar = /[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s\-/]/.test(value);

                if (hasInvalidChar) {
                    // 1. Mostrar la alerta
                    error('Error en el nombre', `Sólo puedes ingresar letras, espacios, guiones y barras.`);

                    // 2. Revertir el valor del filtro al último estado válido conocido.
                    filters.value.nombre = lastValidNombre.value;

                } else {
                    // 3. Si es válido, actualizar la variable de estado válido.
                    lastValidNombre.value = value;
                }
            };

            // Limpia los filtros
            const clearAllFilters = () => {

                // RESTABLECER FILTROS: Asigna una COPIA del estado inicial al valor del ref
                filters.value = { ...initialFilters }; 

                // RECARGAR TABLA
                loadPeriods();
            };



        // ----------------------------------- Service ----------------------------------------


            /**
             * Formatea una cadena de fecha/hora ISO a un formato local legible.
             * @param {string} isoString - La cadena de fecha ISO (ej: "2025-11-07T23:16:53.982Z").
             * @returns {string} La fecha y hora formateadas.
             */
            const formatDateTime = (isoString) => {

                if (!isoString) return ''; // Manejar valores nulos o vacíos

                try {

                    // Patrón 1: YYYY-MM-DD (Fecha simple, sin hora)
                    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/; 

                    let date = null;

                    // Si es solo fecha sin hora pasa por aquí
                    if (dateOnlyRegex.test(isoString)) {
                        // Al añadir 'T00:00:00.000Z', forzamos a new Date() a interpretar la fecha como UTC,
                        date = new Date(isoString + 'T00:00:00');
                    }else{
                        date = new Date(isoString);
                    }

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

            /**
             * Calcula la duración en meses (decimal) y días entre dos fechas.
             * @param {string} startStr - Fecha de inicio (ISO string).
             * @param {string} endStr - Fecha de fin (ISO string).
             * @returns {object} { meses: number, dias: number }
             */
            const calculatePeriodDuration = (startStr, endStr) => {
                if (!startStr || !endStr) {
                    return { meses: 0, dias: 0 };
                }

                const start = dayjs(startStr);
                const end = dayjs(endStr);

                if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
                    return { meses: 0, dias: 0 };
                }

                // Calculamos la duración en días (incluyendo ambos días, si se requiere).
                // Usamos diff con 'day' + 1 si quieres que un periodo '2025-01-01' a '2025-01-01' sea 1 día.
                // Si la API lo maneja como rangos inclusivos:
                const diffInDays = end.diff(start, 'day') + 1; 

                // Calculamos la duración en meses con precisión decimal.
                const diffInMonths = end.diff(start, 'month', true);

                return { 
                    meses: diffInMonths.toFixed(1), // Mantenemos 1 decimal para precisión
                    dias: diffInDays 
                };
            };






      // ----------------------------------- Modal ----------------------------------------

            /**
            * Abre el modal y lo configura en modo Creación o Edición.
            * @param {object|null} period - El objeto de period para editar, o null para crear.
            */
            const openModal = (period = null) => {

                if (period) { 
                    
                    // Crear el objeto que se enviará al modal.
                    periodToEdit.value = { ...period };

                } else { // En modo creación el valor del objeto del periodo es null, ya que no hay un objeto a editar

                    // Modo Creación
                    periodToEdit.value = null;
                }

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
                periodToEdit.value = null;
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

    .table-custom td {
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
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna inicio */
        .col-inicio {
            width: 14%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Fin */
        .col-fin {
            width: 14%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Meses */
        .col-meses {
            width: 6%;
            min-width: 80px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Días */
        .col-dias {
            width: 6%;
            min-width: 80px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }


        /* Columna Fecha creación*/
        .col-fecha_creacion {
            width: 15%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Ultima fecha de actualización */
        .col-fecha_actualizacion {
            width: 15%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Estado */
        .col-estado {
            width: 10%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 200px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Acciones */
        .col-acciones {
            width: 10%; 
            min-width: 130px; /* CLAVE: El ancho mínimo debe ser suficiente para tus 3 botones */
        }



/* Estilos para el filtro de búsqueda de la cuenta padre */

    /* Contenedor relativo para el dropdown de autocomplete */
    .filter-parent {
        position: relative;
    }

/* Estilos para el dropdown de resultados */
    .autocomplete-results {
        position: absolute;
        z-index: 10; /* Asegura que esté por encima de otros elementos */
        list-style: none;
        padding: 0;
        margin: 0;
        border: 1px solid #ccc;
        background: white;
        max-height: 200px;
        overflow-y: auto;
        width: 100%;
        left: 0;
        top: 100%; /* Justo debajo del input */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-top: none;
    }

    .autocomplete-results li {
        padding: 8px 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
    }

    .autocomplete-results li:hover {
        background-color: #f0f0f0;
    }

/* Estilos para la etiqueta de la cuenta seleccionada */
    .selected-parent-tag {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        margin-top: 5px;
        background-color: #e9ecef; /* Color gris claro */
        border-radius: 4px;
        font-size: 0.9em;
        border: 1px solid #dee2e6;
    }

    .btn-clear-parent {
        background: none;
        border: none;
        color: #dc3545; /* Color rojo de Bootstrap */
        font-weight: bold;
        cursor: pointer;
        margin-left: 10px;
        padding: 0 5px;
    }
    .btn-clear-parent:hover {
        color: #c82333;
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

