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
     
            </div>
      </div>
    </Transition>
    
    <div class="chart-container hover-lift p-4">
        <h3>Estado de los Proveedores </h3>
        <p class="text-muted"> {{ chartDataForComponent.reduce((a, b) => a + b.conteo, 0) || 0 }} resultados encontrados.</p>

        <MonitoreoChart 
            :dataPoints="chartDataForComponent"
            :isLoading="isLoadingChart"
            initial-chart-type="bar"
            componentTitle="Estado de Proveedores"
            y-axis-label="Cantidad de Proveedores"
            :allowedChartTypes="['bar', 'pie', 'doughnut', 'polarArea']"
            :multiColorBars="true"
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
        const rutaBase = "/Proveedor/"
        const rutaContar = `${rutaBase}ContarEstados` 


    const { exito, error } = useToast();
    const isLoadingChart = ref(true);

    // Objeto que contendrá los datos para el hijo (el gráfico)
    const chartDataForComponent = ref([]);

    // Definición de filtros (se mantiene igual)
    const initialFilters = { 
        prefijo: '',
        numero_identificacion: '',
        nombre: '',
        apellido: ''
    };


    const filters = ref({ ...initialFilters });
    const areFiltersVisible = ref(false);
    let searchTimeout = null; 

    const lastValidNumeroIdentificacion = ref('');
    const lastValidNombre = ref('');
    const lastValidApellido = ref('');
    

    // Helper para verificar si hay algún filtro aplicado (excluyendo los inputs vacíos)
    const areFiltersActive = computed(() => {
        // Comprueba si CUALQUIER valor de filtro NO está vacío
        return Object.values(filters.value).some(value => value !== '' && value !== null);
    });




// ------------------------------------- Funciones  ------------------------------------


    // ----------------------------------- API y Flujo de Datos ----------------------------------------

        /**
         * Carga los datos para el gráfico. 
         * @param {object} currentFilters - Objeto con los filtros a aplicar.
         */
        const loadSuppliersForChart = async (currentFilters = {}) => {
        

           isLoadingChart.value = true;
            try {
                const validFilters = Object.fromEntries(
                    Object.entries(currentFilters).filter(([, value]) => value !== '' && value !== null)
                );
                
                const response = await api.get(rutaContar, { 
                    params: validFilters 
                }); 

                // Transformar el objeto de la API al formato de dataPoints
                // API: { "Activos": 13, "Inactivos": 1 }
                // Requerido: [{ label: 'Activas', conteo: 13 }, { label: 'Inactivas', conteo: 1 }]
                const apiData = response.data.data;
                const transformedData = [
                    { label: 'Activos', conteo: apiData.Activo || 0 },
                    { label: 'Inactivos', conteo: apiData.Inactivo || 0 },
                    { label: 'Contratos Vencidos', conteo: apiData["Contrato Vencido"] || 0 },
                    { label: 'Bloqueados', conteo: apiData.Bloqueado || 0 }
                ];

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
                // ... (Tu lógica de validación se mantiene) ...
                const numeroIdentificacionValido = newFilters.numero_identificacion.trim() === '' || /^\d+$/.test(newFilters.numero_identificacion);
                const nombreValido = newFilters.nombre.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(newFilters.nombre);
                const apellidoValido = newFilters.apellido.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(newFilters.apellido);
                
                if (!numeroIdentificacionValido || !nombreValido || !apellidoValido) {
                    return; 
                }

                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    // Llama a la carga de datos (solo la data, ya que el gráfico se crea en onMounted)
                    loadSuppliersForChart(newFilters);
                }, 300); 
            }, 
            { 
                deep: true, 

            }
        );

        // HOOK DE MONTAJE DE VUE
        onMounted(async () => {
            // Se carga los datos iniciales
            await loadSuppliersForChart(filters.value);
        
        });

 
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