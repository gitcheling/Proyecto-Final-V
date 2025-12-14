<template>
    <div class="chart-container hover-lift p-4" style="position: relative; height: 350px;"> 
        
        <h3></h3>

        <div class="chart-canvas-wrapper" style="position: relative;"> 

            <canvas 
                ref="chartCanvas" 
                :class="['mi-grafico-fijo', {'d-none': isLoading || chartData.datasets[0]?.data.length === 0}]" 
            ></canvas>

            <div v-if="isLoading" class="loading-overlay"> 
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando gráfico...</span>
                </div>
                <p class="mt-2 text-muted">Cargando datos para el gráfico...</p>
            </div>

            <div v-if="!isLoading && chartData.datasets[0]?.data.length === 0" class="no-results-overlay">
                <div class="no-results-center-badge">
                    <i class="bi bi-x-circle-fill me-2"></i> No hay datos para mostrar en el gráfico.
                </div>
            </div>
         </div> 
    </div>


    <div class="d-flex justify-content-end align-items-center pt-2 pe-3">
           
        <label for="chartTypeSelect" class="me-2 mb-0 d-none d-sm-block">Tipo de Gráfico:</label>
        <select 
            id="chartTypeSelect" 
            v-model="chartType" 
            class="select_tipo" 
        >
            <option 
            v-for="type in props.allowedChartTypes" 
            :key="type" 
            :value="type"
            >
            {{ type === 'bar' ? 'Barras' : type === 'line' ? 'Líneas (Sin Suavizado)' : type === 'area' ? 'Área (Con Suavizado)' : type === 'pie' ? 'Pastel / Torta' : type === 'doughnut' ? 'Dona' : type === 'polarArea' ? 'Polar' : type }}
        </option>
        </select>

        <button 
            @click="regenerateColors" 
            class="btn btn-outline-secondary btn-sm ms-3"
            title="Regenerar colores para gráficos circulares"
        >
            <i class="bi bi-arrow-clockwise"></i> Recargar colores
        </button>
    </div>
</template>

<script setup>

// ------------------------------------ Importaciones ------------------------------------------

    import { ref, watch, onMounted, onBeforeUnmount, defineProps, nextTick } from 'vue';
    import Chart from 'chart.js/auto'; 
    import 'chartjs-adapter-date-fns'; 
    import { useToast } from '../services/notificacionesService'; // Asegúrate de que esta ruta sea correcta

// ------------------------------------ PROPS ------------------------------------

    const props = defineProps({
        // Datos procesados listos para Chart.js
        dataPoints: {
            type: Array, // Esperamos un array de objetos: [{ mes: 'Enero', conteo: 120 }, ...]
            required: true,
        },
        // Configuración inicial
        initialChartType: {
            type: String,
            default: 'bar',
        },
        // Título dinámico
        componentTitle: {
            type: String,
            default: 'Conteo por Mes',
        },
        // Etiqueta para el eje Y (o radial)
        yAxisLabel: {
            type: String,
            default: 'Cantidad de Elementos', 
        },
        // Estado de carga controlado por el padre
        isLoading: {
            type: Boolean,
            default: false,
        },
        // Nos indica que opciones de gráficos se le van a mostrar al usuario
        allowedChartTypes: {
            type: Array,
            // Por defecto, permitir todos los tipos
            default: () => ['bar', 'line', 'area', 'pie', 'doughnut', 'polarArea'],
            validator: (value) => value.length > 0
        },
        /* Controla si las barras (del gráfico de barras deben ser de varios colores (ya que en si es de conteo por mes lo ideal es
        que sean unicolor, pero en los de estado conviene que sean al azar los colores ya que siempre serán pocas barras)*/
        multiColorBars: {
            type: Boolean,
            default: false // Por defecto, las barras serán de un solo color
        }
    });

// ------------------------------------- VARIABLES ------------------------------------

const { exito, error } = useToast();
const chartCanvas = ref(null);
let entityChart = null; 

// Tipo de gráfico (ref interno para permitir la interacción del usuario)
const chartType = ref(props.initialChartType);


// Objeto para los datos que necesita Chart.js (se inicializa vacío)
const chartData = ref({
    labels: [], 
    datasets: [{
        label: 'Resultados',
        data: [], 
        backgroundColor: '#7b19a8',
        borderColor: '#4e106b',
        borderWidth: 1,
        borderRadius: 4,
    }]
});


// ------------------------------------- Funciones  ------------------------------------


    // ------------------------------------- FUNCIONES DE UTILIDAD ------------------------------------


        /**
         * Genera un color RGB aleatorio (e.g., "120, 50, 200").
         * @returns {string} String con los valores RGB separados por coma.
         */
        const getRgbColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `${r}, ${g}, ${b}`;
        };

        /**
         * Genera un array de strings RGB BASE, sin opacidad (para gráficos que no son ni de barras, ni de área ni de línea)
         * @param {number} count - Número de colores a generar.
         * @returns {Array<string>} Array de strings con el formato "R, G, B".
         */
        const generateBaseRgbColors = (count) => {
            const colors = [];
            for (let i = 0; i < count; i++) {
                colors.push(getRgbColor());
            }
            return colors;
        };


// ------------------------------------- LÓGICA DEL GRÁFICO ------------------------------------

        /**
         * Inicializa o recrea la instancia de Chart.js.
         */
        const createChart = () => {

            /* Si la variable entityChart (que almacena la instancia de Chart.js) ya tiene un valor, significa que un gráfico ya se había dibujado. 
            Para evitar conflictos de memoria y asegurar que los nuevos datos se dibujen correctamente, se llama al método "destroy()" para eliminar la 
            instancia anterior.*/
            // Usamos el constructor estático de Chart.js para obtener y destruir la instancia si existe.
            // Esto es más seguro que solo depender de `entityChart`.
            if (chartCanvas.value) {
                const existingChart = Chart.getChart(chartCanvas.value);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
            
            /* chartCanvas es una referencia (ref) de Vue que apunta al elemento <canvas> en el template. Si esta referencia aún no existe (porque el 
            componente aún no se ha montado completamente en el DOM), la función se detiene (return;). Esto previene errores al intentar inicializar
            Chart.js sin su contenedor.*/
            if (!chartCanvas.value) return;

            // Determinar el tipo de Chart.js y si tiene ejes
            const chartJSType = chartType.value === 'area' ? 'line' : chartType.value;
            const isAxisChart = chartJSType === 'bar' || chartJSType === 'line';
            
            // ------------------ Lógica de Colores ---------------------

            // Definimos qué gráficos necesitan un color diferente por DATO (data point).
            // Esto siempre incluye gráficos circulares. Incluye 'bar' SOLO si se especificó la prop multiColorBars.
            const needsMultiColor = ['pie', 'doughnut', 'polarArea'].includes(chartJSType) || 
                                    (chartJSType === 'bar' && props.multiColorBars);

            let backgroundColors, borderColors;

            if (needsMultiColor) {
                const dataCount = chartData.value.datasets[0].data.length;

                const baseRgbColors = generateBaseRgbColors(dataCount); 

                // Relleno: Se usa el color base con opacidad (0.8 para barras, 0.5 para circulares)
                const opacity = chartJSType === 'bar' ? 0.8 : 0.5;

                backgroundColors = baseRgbColors.map(rgb => `rgba(${rgb}, ${opacity})`); 
        
                // Borde: Se usa el mismo color base, pero 100% opaco
                borderColors = baseRgbColors.map(rgb => `rgba(${rgb}, 1.0)`);
          
            } else {
                // Para Gráficos de Eje (Barra, Línea), usamos colores de marca       
                const primaryRgb = '123, 25, 168';

               backgroundColors = chartJSType === 'line' || chartJSType === 'area' 
                    ? `rgba(${primaryRgb}, 0.1)` // Fondo suave para líneas/áreas
                    : `rgba(${primaryRgb}, 0.8)`; // Color sólido para barras (unicolor)

                borderColors = `rgba(${primaryRgb}, 1.0)`; // Borde de la línea o de la barra
            }

            // APLICAMOS LOS COLORES AL DATASET
            chartData.value.datasets[0].backgroundColor = backgroundColors;
            chartData.value.datasets[0].borderColor = borderColors;
            chartData.value.datasets[0].borderWidth = needsMultiColor ? 2 : 1; 
            chartData.value.datasets[0].borderRadius = chartJSType === 'bar' ? 4 : 0;
            
             // Ajustes de puntos para Línea/Área
            if (chartJSType === 'line' || chartType.value === 'area') {
                chartData.value.datasets[0].pointBorderColor = borderColors;
                chartData.value.datasets[0].pointBackgroundColor = borderColors;
            }


            // --- Lógica de Suavizado (para que el gráfico de líneas rectas y puntiagudas pase a ser de olas suaves) ---
            // Si es 'area', queremos suavizado (0.4). 
            // Si es 'line', queremos que sea angular (0.0).
            // Si es cualquier otro, no aplica
            if (chartJSType === 'line') {
                // 'area' (0.4 suavizado), 'line' (0.0 sin suavizado)
                chartData.value.datasets[0].tension = chartType.value === 'area' ? 0.4 : 0.0;
            } else {
                 // Para 'bar', 'pie', etc., no aplica, se puede omitir o poner undefined
                chartData.value.datasets[0].tension = undefined; 
            }
            
           

            // ----------------------------------------
            // --- CREACIÓN DINÁMICA DE SCALES ---
            // --------------------------------------
            const scales = {};
            if (isAxisChart) {
                // --- Escalas X e Y para Bar y Line/Area ---
                scales.y = {
                    display: isAxisChart,
                    beginAtZero: true, 
                    title: {
                        display: isAxisChart,
                        text: props.yAxisLabel
                    },
                    ticks: {
                        callback: function(value) { if (value % 1 === 0) { return value; } },
                        color: '#495057', // Color oscuro para legibilidad
                        padding: 10, 
                        maxRotation: 0, 
                        minRotation: 0,
                    }
                };
                scales.x = {
                    display: isAxisChart,
                    title: { 
                        display: isAxisChart,
                        text: 'Etiqueta de Tiempo'
                    },
                    grid: {
                        display: false 
                    },
                    ticks: { 
                        color: '#495057', // Color oscuro para legibilidad
                    }
                };
            } 
            // --- Escala R para Polar Area ---
            if (chartJSType === 'polarArea') {
                // Si es polarArea, agregamos solo la escala 'r'
                scales.r = {
                    display: true, // Siempre visible para polarArea
                    title: { 
                        display: true,
                        text: props.yAxisLabel, // <-- ¡AQUÍ ESTÁ EL CAMBIO!
                        padding: { top: 10, bottom: 0 }
                    },
                    ticks: {
                        // Aseguramos que 'ticks' esté definido con 'callback'
                        color: '#495057', 
                        backdropColor: 'rgba(255, 255, 255, 0.7)', 
                        backdropPadding: 2, 
                        callback: function(value) {
                            if (value % 1 === 0) {
                                return value;
                            }
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)' 
                    }
                };
            }

            
            // Configuración específica de Chart.js para un gráfico de barras
            const config = {
                type: chartJSType,
                data: chartData.value,// Proporciona los datos reactivos del gráfico (etiquetas de meses y valores de conteo), que ya han sido precargados.
                
                options: { // Contiene la configuración visual y de interacción:

                     /* "responsive: true" y "maintainAspectRatio: false": Hacen que el gráfico se ajuste al tamaño de su contenedor, sin forzar una 
                    relación de aspecto específica, permitiéndole ocupar el espacio definido en CSS. */      
                    responsive: true,
                    maintainAspectRatio: false, 

                    //  Color de texto más oscuro para todos los elementos (ticks, legendas, títulos).
                    color: '#495057', // Usar un color gris oscuro para el texto principal
                    
                    plugins: {
                        legend: {
                            display: !isAxisChart,
                            position: !isAxisChart ? 'bottom' : 'top',
                            labels: {
                                color: '#495057',
                                padding: 30 
                            }
                        },
                        title: { // Muestra un título descriptivo en la parte superior del gráfico.
                            display: true,
                            text: props.componentTitle, // Título tomado de la prop
                            font: { size: 16 }
                        }
                    },
                    scales: scales,
                    elements: {
                        line: {
                             // Activa el relleno si el tipo seleccionado es 'area'
                            fill: chartType.value === 'area', 
                        },
                    }
                }
            };
            
            entityChart = new Chart(chartCanvas.value, config);
        };


        /**
         * Función de control: actualiza la data y fuerza la recreación si es necesario.
         * @param {Array<object>} serverData - Array con { label: string, conteo: number }.
         */
        const updateChartData = (serverData) => { 
            const labels = serverData.map(item => item.label); 
            const dataValues = serverData.map(item => item.conteo); 

            // Se le asignan los labels al chart
            chartData.value.labels = labels; 

            // Se le asignan los valores al chart (y ojo, posición "0" ya que sólo es un gráfico en éste caso)
            chartData.value.datasets[0].data = dataValues;

            const hasData = dataValues.length > 0;
            const isChartInitialized = entityChart !== null;

            // Caso 1: No hay datos.
            if (!hasData) {
                if (isChartInitialized) {
                    // Destruimos la INSTANCIA de Chart.js, pero el elemento <canvas> se queda en el DOM.
                    entityChart.destroy();
                    entityChart = null;
                }
                return; // Detener aquí. El template mostrará el mensaje de "No hay datos".
            }

            // Caso 2: Hay datos.
            if (isChartInitialized) {  // A) Si ya existe, actualiza los datos (el camino rápido)
                entityChart.data.labels = labels;
                entityChart.data.datasets[0].data = dataValues;
                entityChart.update();
            } else {
                 // B) Caso de inicialización (Primera carga O regresando de 0 a N datos).
                // Usamos nextTick por si acaso, para asegurar que Vue haya procesado el cambio de `chartData` y montado el elemento.
                nextTick(() => {
                    if (chartCanvas.value) { 
                        createChart();
                    }
                });
            }
        };


        /**
         * Fuerza la regeneración del gráfico para cambiar colores (circulares) o tipo (destruyendo y recreaando la instancia de Chart.js.)
         */
        const regenerateColors = () => {
            if (chartData.value.datasets[0]?.data.length > 0) {
                createChart();
                exito('Colores actualizados', 'Se han generado nuevos colores para el gráfico.');
            } else {
                error('Sin datos', 'No hay datos cargados para aplicar nuevos colores.');
            }
        };


// ------------------------------------- WATCHERS y HOOKS ------------------------------------

    // Observa cambios en el tipo de gráfico interno (por el selector del usuario)
    watch(chartType, () => {
         /* Si hay datos, la forma más fácil de cambiar el tipo de gráfico es destruyendo y recreando la instancia de
        chart.js en js, el "<canvas>" del dom se queda allí en el html siempre*/
        if (chartData.value.datasets[0]?.data.length > 0) {
            createChart();
        }
    });


    // Observa cambios en los datos que vienen del componente padre (PROP)
    watch(() => props.dataPoints, (newData) => {
        updateChartData(newData);
    }, { deep: true, immediate: true }); // 'immediate: true' para la carga inicial



    onBeforeUnmount(() => {
        if (entityChart) {
            entityChart.destroy();
        }
    });

    // Asegura que el tipo de gráfico es permitido.
    watch(() => props.allowedChartTypes, (newAllowedTypes) => {
        // Si el tipo actual no está en la lista de permitidos O no hay datos cargados,
        // cambiamos al primer tipo permitido.
        if (!newAllowedTypes.includes(chartType.value) && chartData.value.datasets[0]?.data.length > 0) {
            chartType.value = newAllowedTypes[0]; // Forzar al primer tipo permitido
            // createChart() será llamado por el watcher de chartType.
        }
    }, { immediate: true });

    // Exporta la función para que el padre pueda llamarla si es necesario
    // (Aunque en este setup el watcher de props lo hace automáticamente)
    defineExpose({
        updateChartData // Permite que el padre fuerce una actualización si lo desea
    });

</script>

<style scoped>

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


</style>