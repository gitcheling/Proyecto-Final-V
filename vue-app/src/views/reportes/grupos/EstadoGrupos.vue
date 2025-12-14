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

            </div>
      </div>
    </Transition>
    
    <div class="chart-container hover-lift p-4">
        <h3>Estado de los Grupos </h3>
        <p class="text-muted"> {{ chartDataForComponent.reduce((a, b) => a + b.conteo, 0) || 0 }} resultados encontrados.</p>

        <MonitoreoChart 
            :dataPoints="chartDataForComponent"
            :isLoading="isLoadingChart"
            initial-chart-type="bar"
            componentTitle="Estado de Grupos"
            y-axis-label="Cantidad de Grupos"
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
            // Ruta base
            const rutaBase = "/Grupo/"

            // Ruta contar
            const rutaContar = `${rutaBase}ContarEstados` 

            // Rutas de Modalidades 
            const rutaModalidades = "/ModalidadClase/"
            const rutaBuscarModalidades = `${rutaModalidades}ObtenerModalidades` 

            // Rutas de Periodos 
            const rutaPeriodos = "/Periodo/"
            const rutaBuscarPeriodos = `${rutaPeriodos}Buscar` 


    const { exito, error } = useToast();
    const isLoadingChart = ref(true);

    // Objeto que contendrá los datos para el hijo (el gráfico)
    const chartDataForComponent = ref([]);

    // Definición de filtros (se mantiene igual)
    const initialFilters = { 
        nombre: '',
        docente: '',
        modalidad: '',
        periodo: '',
        cupoDesde: '',
        cupoHasta: '',
        costoInscripcionDesde: '',
        costoInscripcionHasta: '',
        costoClaseDesde: '',
        costoClaseHasta: ''
    };


    const filters = ref({ ...initialFilters });
    const areFiltersVisible = ref(false);
    let searchTimeout = null; 

    // Variables que almacenan el último valor de filtro que fue válido
    const lastValidNombre = ref('');
    const lastValidDocente = ref('');
    const lastValidCupoDesde = ref('');
    const lastValidCupoHasta = ref('');
    const lastValidInscripcionDesde = ref('');
    const lastValidInscripcionHasta = ref('');
    const lastValidCostoClaseDesde = ref('');
    const lastValidCostoClaseHasta = ref('');


    // Variables reactivas para almacenar los datos del servidor
    const modalidadesDisponibles = ref([]);
    const periodosDisponibles = ref([]);
    

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
        const loadDataForChart = async (currentFilters = {}) => {
        

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
                    { label: 'Planificados', conteo: apiData.Planificado || 0 },
                    { label: 'En Curso', conteo: apiData["En curso"] || 0 },
                    { label: 'Finalizados', conteo: apiData.Finalizado || 0 },
                    { label: 'Cancelados', conteo: apiData.Cancelado || 0 }
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



    // ----------------------------------- Watchers ----------------------------------------

               // Watcher principal: Monitorea los filtros y hace la llamada API con debounce
        watch(
            filters,
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

                    // Llama a la carga de datos (solo la data, ya que el gráfico se crea en onMounted)
                    loadGroupsForChart(newFilters);
                }, 300); 
            }, 
            { 
                deep: true, 
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



        // HOOK DE MONTAJE DE VUE
        onMounted(async () => {
            fetchModalidades();
            fetchPeriodos();
            // Se carga los datos iniciales
            await loadDataForChart(filters.value);
        
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