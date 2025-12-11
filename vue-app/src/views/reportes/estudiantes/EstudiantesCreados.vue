<template>
  <div class="analytics-manager">

    <div class="mb-3">
        <button @click="toggleFiltersVisibility" class="btn btn-outline-info flex-fill py-2 shadow-sm ms-2 mb-2">
            {{ areFiltersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
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
                    <label for="codigo_estudiantil">Código estudiantil:</label>
                    <input 
                        type="text" 
                        id="codigo_estudiantil" 
                        v-model="filters.codigo_estudiantil" 
                        placeholder="Buscar por código estudiantil..."
                        class="form-control"
                        @input="validateCodigoEstudiantil"
                    >
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="prefijo">Prefijo:</label>
                    <select id="prefijo" v-model="filters.prefijo" class="form-control">
                        <option value="">Todos</option>
                        <option value="1">V (Venezolano)</option>
                        <option value="2">E (Extranjero)</option>
                        <option value="3">P (Pasaporte)</option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="numero_identificacion">Número de identificación:</label>
                    <input 
                        type="text" 
                        id="numero_identificacion" 
                        v-model="filters.numero_identificacion" 
                        placeholder="Buscar por número de identificación..."
                        class="form-control"
                        @input="validateNumeroIdentificacion"
                    >
                </div>

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
                    <label for="apellido">Apellido:</label>
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
                    <label for="estado">Estado:</label>
                    <select id="estado" v-model="filters.estado" class="form-control">
                        <option value="">Todos</option>
                        <option value="1">Activos</option>
                        <option value="2">Egresados</option>
                        <option value="3">Retirados</option>
                        <option value="4">Suspendidos</option>
                        <option value="5">Morosos</option>
                    </select>
                </div>

          
                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="yearSelect">Filtrar por Año:</label>
                    <select 
                        id="yearSelect" 
                        v-model="displayYear"  class="form-control"
                        
                        @change="selectedYear = displayYear"
                    >   
                        <option 
                            v-for="year in availableYears" 
                            :key="year" 
                            :value="year"
                        >
                            {{ year }}
                        </option>
                    </select>
                </div>

            
                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="creadosDesde">Creados Desde:</label>
                    <input type="date" id="creadosDesde" v-model="filters.creadosDesde" class="form-control" :max="filters.creadosHasta || undefined">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="creadosHasta">Creados Hasta:</label>
                    <input type="date" id="creadosHasta" v-model="filters.creadosHasta" class="form-control" :min="filters.creadosDesde || undefined">
                </div>

            </div>
      </div>
    </Transition>
    
    <div class="chart-container hover-lift p-4">
        <h3>Registro de Estudiantes</h3>
        <p class="text-muted"> {{ chartDataForComponent.reduce((a, b) => a + b.conteo, 0) || 0 }} resultados encontrados.</p>

        <MonitoreoChart 
            :dataPoints="chartDataForComponent"
            :isLoading="isLoadingChart"
            initial-chart-type="bar"
            componentTitle="Conteo de Estudiantes por Mes"
            :allowedChartTypes="['bar', 'line', 'area', 'pie', 'doughnut', 'polarArea']"
        />
        
    </div>
   

  </div>
</template>


<script setup>

// ------------------------------------ Importaciones ------------------------------------------

    import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
    import { useToast } from '../../../services/notificacionesService';
    import api from '../../../services/api'; 
    import MonitoreoChart from '../../../components/MonitoreoChart.vue'; // Ajusta la ruta si es necesario

// ------------------------------------- Variables  ------------------------------------
    // Rutas
        const rutaBase = "/Estudiante/"
        const rutaContar = `${rutaBase}ContarEstudiantes` 


    const { exito, error } = useToast();
    const isLoadingChart = ref(true);

    // Objeto que contendrá los datos para el hijo (el gráfico)
    const chartDataForComponent = ref([]);

    // Definición de filtros (se mantiene igual)
    const initialFilters = {
        codigo_estudiantil: '', 
        prefijo: '',
        numero_identificacion: '',
        nombre: '',
        apellido: '',
        estado: '',
        creadosDesde: '',
        creadosHasta: ''
    };


    const filters = ref({ ...initialFilters });
    const areFiltersVisible = ref(false);
    let searchTimeout = null; 

    const lastValidCodigoEstudiantil = ref('');
    const lastValidNumeroIdentificacion = ref('');
    const lastValidNombre = ref('');
    const lastValidApellido = ref('');
    

    // Helper para verificar si hay algún filtro aplicado (excluyendo los inputs vacíos)
    const areFiltersActive = computed(() => {
        // Comprueba si CUALQUIER valor de filtro NO está vacío
        return Object.values(filters.value).some(value => value !== '' && value !== null);
    });

    // CAMPOS PARA EL FILTRO DE AÑO
    const currentYear = new Date().getFullYear();
    const selectedYear = ref(currentYear); // El año seleccionado. Valor por defecto: Año actual
    const availableYears = ref([]); // Lista de años para el select
    const displayYear = ref(currentYear); // Lo que se muestra en el <select>. Inicialmente es igual a selectedYear.

   


// ------------------------------------- Funciones  ------------------------------------


    // ----------------------------------- API y Flujo de Datos ----------------------------------------

        /**
         * Carga los datos para el gráfico. 
         * @param {object} currentFilters - Objeto con los filtros a aplicar.
         */
        const loadStudentsForChart = async (currentFilters = {}) => {
        

           isLoadingChart.value = true;
            try {
                const validFilters = Object.fromEntries(
                    Object.entries(currentFilters).filter(([, value]) => value !== '' && value !== null)
                );
                
                const response = await api.get(rutaContar, { 
                    params: { ...validFilters, concepto: "creados" }
                }); 

                const apiData = response.data.data;

                const transformedData = apiData.map(item => ({
                    label: item.mes, // Tomamos el valor de 'mes' y lo asignamos a 'label'
                    conteo: item.conteo || 0 // Mantenemos 'conteo'
                }));

                // Almacenamos los datos
                chartDataForComponent.value = transformedData;

            } catch (err) {

                error('Error de Servidor', 'No se pudieron obtener los datos para el gráfico con los filtros aplicados.');
               chartDataForComponent.value = [];
            } finally {
                isLoadingChart.value = false;
            }
        };


    // ----------------------------------- Bloque de los filtros ----------------------------------------

        // Se mantienen las funciones de utilidad:
        const toggleFiltersVisibility = () => {
            areFiltersVisible.value = !areFiltersVisible.value;
        };

        const clearAllFilters = () => {
            filters.value = { ...initialFilters }; 

            selectedYear.value = currentYear;

        };

    // ----------------------------------- Validaciones de los filtros ----------------------------------------


        /**
         * Valida que el campo 'codigo_estudiantil' solo contenga números (0-9).
         */
        const validateCodigoEstudiantil = () => {
            let value = filters.value.codigo_estudiantil;

            // 1. Manejar solo espacios
            if (value.trim() === '') {
                // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                filters.value.codigo_estudiantil = '';
                lastValidCodigoEstudiantil.value = ''; // Resetear el estado válido
                return; 
            }

            // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
            const hasInvalidChar = /[^0-9]/.test(value); 

            if (hasInvalidChar) {
                // 1. Mostrar la alerta
                error('Error en el código estudiantil', `Sólo puedes ingresar números.`);

                // 2. Revertir el valor del filtro al último estado válido conocido.
                // Esto hace que el carácter inválido parezca "borrarse" del input al instante, 
                // pero la búsqueda no se dispara con el valor incorrecto.
                filters.value.codigo_estudiantil = lastValidCodigoEstudiantil.value;

            } else {
                // 3. Si es válido, actualizar la variable de estado válido.
                lastValidCodigoEstudiantil.value = value;
            }
        };


        /**
         * Valida que el campo 'numero_identificacion' solo contenga números (0-9). 
        */            
        const validateNumeroIdentificacion = () => {

        let value = filters.value.numero_identificacion;

        // 1. Manejar solo espacios
        if (value.trim() === '') {
            // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
            filters.value.numero_identificacion = '';
            lastValidNumeroIdentificacion.value = ''; // Resetear el estado válido
            return; 
        }

        // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
        const hasInvalidChar = /[^0-9]/.test(value); 

            if (hasInvalidChar) {
                // 1. Mostrar la alerta

                error('Error en el número de identificación', `Sólo puedes ingresar números.`);

                // 2. Revertir el valor del filtro al último estado válido conocido.
                // Esto hace que el carácter inválido parezca "borrarse" del input al instante, 
                // pero la búsqueda no se dispara con el valor incorrecto.
                filters.value.numero_identificacion = lastValidNumeroIdentificacion.value;

            } else {
                // 3. Si es válido, actualizar la variable de estado válido.
                lastValidNumeroIdentificacion.value = value;
            }
        };


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
         * Valida que el campo 'nombre' solo contenga letras y espacios.
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
        };



    // ----------------------------------- Watchers ----------------------------------------

        // Watcher principal: Monitorea los filtros y hace la llamada API con debounce
        watch(
            filters,
            (newFilters) => {
                
                const numeroIdentificacionValido = newFilters.numero_identificacion.trim() === '' || /^\d+$/.test(newFilters.numero_identificacion);
                const codigoEstudiantilValido = newFilters.codigo_estudiantil.trim() === '' || /[^0-9-]/.test(newFilters.codigo_estudiantil); 
                const nombreValido = newFilters.nombre.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(newFilters.nombre);
                const apellidoValido = newFilters.apellido.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(newFilters.apellido);
                
                if (!numeroIdentificacionValido || !codigoEstudiantilValido || !nombreValido || !apellidoValido) {
                    return; 
                }

                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    // Llama a la carga de datos (solo la data, ya que el gráfico se crea en onMounted)
                    loadStudentsForChart(newFilters);
                }, 300); 
            }, 
            { 
                deep: true, 
            }
        );

        // HOOK DE MONTAJE DE VUE
        onMounted(async () => {

            // Inicializa el rango de fechas
            updateDateRange(selectedYear.value);
            // Se carga los datos iniciales
            await loadStudentsForChart(filters.value);
        
        });

 
        // Detecta si 'creadosDesde' fue cambiado manualmente
        watch(() => filters.value.creadosDesde, (newValue) => {
            // Si el valor no está vacío Y no es el 1 de enero del año actualmente seleccionado,
            // significa que el usuario escribió algo, así que desincronizamos el select del año
            if (newValue && newValue !== `${selectedYear.value}-01-01`) {
                displayYear.value = undefined; // Desincroniza el select
            }
        }, { immediate: false }); // No ejecutar en la carga inicial


        // Detecta si 'creadosHasta' fue cambiado manualmente
        watch(() => filters.value.creadosHasta, (newValue) => {
            // Si el valor no está vacío Y no es el 31 de diciembre del año actualmente seleccionado,
            // significa que el usuario escribió algo, así que desincronizamos.
            if (newValue && newValue !== `${selectedYear.value}-12-31`) {
                displayYear.value = undefined; // Desincroniza el select
            }
        }, { immediate: false }); // No ejecutar en la carga inicial


        // Detecta cuando se selecciona una opción de año en el select
        watch(selectedYear, (newYear) => {
            // Solo actualizamos el rango de fechas si newYear es un valor numérico válido (un año).
            // Esto evita que updateDateRange se ejecute si selectedYear se vuelve 'undefined'.
            if (newYear) {
                updateDateRange(newYear);
                // Sincronizar el valor visible del select
                displayYear.value = newYear; 
            }
        });


    // ----------------------------------- Utilidad ----------------------------------------   


        // Definir los años disponibles (ej. últimos 5 años)
        for (let i = 0; i < 5; i++) {
            availableYears.value.push(currentYear - i);
        }

        // Calcula las fechas de inicio y fin para un año dado
        const updateDateRange = (year) => {
        if (!year) {
                // Si el año es null, reseteamos las fechas a cadena vacía.
                // Esto permite la búsqueda sin restricción de rango y evita el error "null-01-01".
                filters.value.creadosDesde = '';
                filters.value.creadosHasta = '';
            } else {
                // Si el año es válido (un número), aplicamos el rango normal.
                filters.value.creadosDesde = `${year}-01-01`;
                filters.value.creadosHasta = `${year}-12-31`;
            }
        };

        
</script>


<style scoped>


    .analytics-manager {
        padding: 20px;
    }

/* Estilos para el contenedor del gráfico */

    .chart-container {
        /* Estilo de tarjeta para el contenedor del gráfico */
        border: 1px solid #e9ecef;
        border-radius: 8px;
        background-color: #fff;
        margin-bottom: 20px;
        min-height: 400px; /* Altura mínima para el gráfico */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        position: relative;
    }

    /* Contenedor intermedio (si decides usarlo) */
    .chart-canvas-wrapper {
        min-height: 350px; /* Le da el espacio vertical real al canvas */
        position: relative;
    }

    .mi-grafico-fijo {
        /* Fija el tamaño del gráfico */
        height: 350px; /* Alto fijo*/
        width: 100%;
        max-height: 400px; /* Opcional: Límite máximo */
    }

    /* Para Chart.js */
    canvas {
        max-height: 450px; /* Límite de altura del canvas */
        width: 100% !important;
    }

    /* Se puede reutilizar el estilo de no-results-center-badge de tu archivo original */
    .no-results-center-badge {
        display: inline-block;
        padding: 15px 30px;
        border-radius: 12px;
        background-color: #ffedcc; 
        color: #cc8400; 
        border: 1px solid #ffdc9c; 
        font-size: 1.15rem; 
        font-weight: 600; 
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }


    /* Estilos para centrar el mensaje/spinner */
    .loading-overlay, .no-results-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
        background: white; /* Asegura que cubra el espacio */
        flex-direction: column;
        text-align: center;
    }


/* Estilos para el select del tipo de gráfico */

    .select_tipo {
        /* 1. Fondo transparente */
        background-color: transparent; 
        
        /* 2. Borde del color de tu marca */
        border: 1.5px solid #971591; 
        
        /* 3. Texto del color de tu marca */
        color: #971591; 
        
        border-radius: 0.5rem; /* Redondeo sutil */
        font-weight: 600;
        
        /* 4. Sin sombras (efecto 'Ghost') */
        box-shadow: none; 
        
        padding: 0.35rem 1.5rem 0.35rem 0.75rem; 
        line-height: 1.5;
        
        outline: none !important; 
    }

    /* Efecto al pasar el ratón (Hover) y enfocar (Focus) */
    .select_tipo:hover,
    .select_tipo:focus {
        /* Rellena el fondo con un color rosa muy claro */

        color: #971591; /* Asegura el texto */
        
        /* Resplandor de enfoque sutil */
        box-shadow: 0 0 0 3px rgba(151, 21, 145, 0.25) !important; 
        outline: none !important;
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