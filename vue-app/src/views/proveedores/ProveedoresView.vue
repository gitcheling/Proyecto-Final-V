<template>

  <div class="account-type-manager">

    <h2>Gestión de Proveedores</h2>
    <div class="mb-3">
        <!-- Botón para crear una nueva cuenta -->
        <button @click="openModal" class="btn btn-outline-pink flex-fill py-2 shadow-sm ms-2 mb-2">
        + Agregar Nuevo Proveedor
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
                        <option value="2">Inactivos</option>
                        <option value="3">Contratos Vencidos</option>
                        <option value="4">Bloqueados</option>
                    </select>
                </div>

          
                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="creadosDesde">Creados Desde:</label>
                    <input type="date" id="creadosDesde" v-model="filters.creadosDesde" class="form-control">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="creadosHasta">Creados Hasta:</label>
                    <input type="date" id="creadosHasta" v-model="filters.creadosHasta" class="form-control">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="modificadosDesde">Modificados Desde:</label>
                    <input type="date" id="modificadosDesde" v-model="filters.modificadosDesde" class="form-control">
                </div>

                <div class="filter-group col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <label for="modificadosHasta">Modificados Hasta:</label>
                    <input type="date" id="modificadosHasta" v-model="filters.modificadosHasta" class="form-control">
                </div>
                
            </div>


        </div>

    </Transition>

    <!-- Mensaje de la cantidad de resultados encontrados -->
    <div 
    v-if="supplierTypes.length > 0 && !isLoadingTable" 
    class="mb-3 text-start"
    >
        <span class="results-summary" v-html="resultsText"></span>
    </div>

    <!-- Tabla de los proveedores -->
    <div class="table-card-wrapper hover-lift">
        <div class="table-responsive ">
            <table class="table table-striped table-hover table-bordered table-custom">

            <thead class="header-personalizado">
                <tr>
                    <th class="text-center col-numero_identificacion">Número de identificación</th>
                    <th class="text-center col-nombre">Nombre</th>
                    <th class="text-center col-apellido">Apellido</th>
                    <th class="text-center col-tipo">Tipo de proveedor</th>
                    <th class="text-center col-estado">Estado</th>
                    <th class="text-center col-aplica_pago">¿Aplica para recibir pagos?</th>
                    <th class="text-center col-fecha_creacion">Fecha de registro como proveedor</th>
                    <th class="text-center col-fecha_actualizacion">Última modificación</th>
                    
                    
                    <th class="text-center col-acciones">Acciones</th>
                </tr>
            </thead>

            
            <tbody>
                <tr v-if="isLoadingTable">
                    <td colspan="10" class="text-center">
                        <span class="loading-message">Cargando datos...</span>
                    </td>
                </tr>
                <tr v-if="supplierTypes.length > 0" v-for="supplier in supplierTypes" :key="supplier.id">

                    <td>{{`${supplier.entidad.prefijo.letra_prefijo} - ${supplier.entidad.numero_identificacion}` }}</td>
                    <td>{{ supplier.entidad.nombre }}</td>
                    <td>{{ supplier.entidad.apellido }}</td>
                    <td>{{ supplier.tipo_proveedor.nombre  }}</td>
                    <td>{{ supplier.estado.nombre  }}</td>
                    <td>{{ supplier.estado.permite_pago  }}</td>

                    <td>{{ formatDateTime(supplier.fechaCreacion) }}</td>
                    <td>{{ formatDateTime(supplier.fechaActualizacion) }}</td>

                
                    <td class="text-center"> 

                        <router-link 
                            :to="{ 
                                name: 'SupplierDetails', 
                                params: { id: supplier.id } 
                            }" 
                            class="btn btn-sm btn-outline-primary me-1" 
                            title="Ver detalles del Docente"
                        >
                            <i class="bi bi-eye-fill"></i> 
                        </router-link> 
                
                    </td>
                </tr>
            </tbody>
            

            </table>
        </div>
    </div>


    <!-- Mensaje de que no se encontraron resultados -->
    <div 
        v-if="!isLoadingTable && supplierTypes.length === 0" 
        class="text-center py-5 mb-5"
    >
        <div class="no-results-center-badge">
            <i class="bi bi-x-circle-fill me-2"></i> No se encontraron proveedores con los filtros aplicados.
            <p class="mt-2 mb-0 text-muted">Intenta ajustando o limpiando los filtros para ver la lista completa.</p>
        </div>
    </div>

    <!-- Modal para crear un proveedor -->
    <SupplierFormModal
      :isVisible="isModalVisible"
      :initialData="proveedorToEdit" 
      @close="closeModal"
      @add-supplier="addSupplier"
    />
  </div>
  
    
</template>


<script setup>

    // ----------------------------------- Importaciones ----------------------------------------
     
        import { ref, watch, computed} from 'vue';

        // Se importa el hook de las notificaciones toast
        import { useToast } from '../../services/notificacionesService';

        // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
        const { exito, error, info, warning } = useToast();

        import SupplierFormModal from './FormularioProveedoresView.vue';

        // Se importa el objeto axios que permitirá la conexión con la api
        import api from '../../services/api'; 


    // ----------------------------------- Variables ----------------------------------------

        // Rutas
            // Ruta base
            const rutaBase = "/Proveedor/"

            // Buscar proveedores
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear proveedor
            const rutaCrear = `${rutaBase}CrearProveedor`
            

        // Se inicializa como array vacío. Los datos se cargarán de la API al montar el componente.
        const supplierTypes = ref([]);

        // Propiedad computada para saber que mensaje se pondrá en la cantidad de resultados encontrados
        const resultsText = computed(() => {
            const count = supplierTypes.value.length;
            if (count === 1) {
                return `🔍 Se encontró ${count} proveedor con los filtros aplicados.`;
            } else {
                return `🔍 Se encontraron ${count} proveedores con los filtros aplicados.`;
            }
        });

        // Ésta variable reactiva permitirá controlar la visibilidad del modal
        const isModalVisible = ref(false);

        // Los datos que se envían al modal (ahora siempre es "null" ya que la edición la maneja la pagina de detalles del proveedores)
        const proveedorToEdit = null;

        /* Indicador de carga para la tabla
        
        Nota: Se inicializa en "true" para que no salga el aviso de que no se encontraron cuentas nada mas se abre la pagina, la función de búsqueda será quien la ponga
        en "false" cuando se ejecute */
        const isLoadingTable = ref(true);

        // Este objeto es la plantilla para el reset (para reiniciar los filtros)
        const initialFilters = {
            prefijo: '',
            numero_identificacion: '',
            nombre: '',
            apellido: '',
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


        // Variables que almacenan el último valor de filtro que fue válido (para nombre y código)
        const lastValidNumeroIdentificacion = ref('');
        const lastValidNombre = ref('');
        const lastValidApellido = ref('');


        let searchTimeout = null; // Para manejar el debouncing de la búsqueda


    // ----------------------------------- Funciones ----------------------------------------

      // ----------------------------------- API ----------------------------------------
      
            /**
             * Carga los datos desde la API, AHORA aceptando filtros.
             * @param {object} currentFilters - Objeto con los filtros a aplicar.
             */
            const loadSuppliers = async (currentFilters = {}) => {
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

                    supplierTypes.value = response.data.data; 

                } catch (err) {
                    
                    error('Error de Servidor', 'No se pudieron obtener los datos de los proveedores. Intente de nuevo.');
                } finally {
                    isLoadingTable.value = false;
                }
            };


            watch(
                filters, // Monitorea la referencia ref directamente
                (newFilters) => {
            
                    const numeroIdentificacionValido = newFilters.numero_identificacion.trim() === '' || /^\d+$/.test(newFilters.numero_identificacion);

                    // El Nombre debe ser vacío o contener SOLO caracteres permitidos (letras, espacios, guiones, etc.)
                    const nombreValido = newFilters.nombre.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\-/]+$/.test(newFilters.nombre);
                    
                    // El Nombre debe ser vacío o contener SOLO caracteres permitidos (letras, espacios, guiones, etc.)
                    const apellidoValido = newFilters.apellido.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\-/]+$/.test(newFilters.apellido);
                    
                    // 2. Compuerta de seguridad: CANCELAR la búsqueda si algún filtro es inválido
                    // Esto captura el estado intermedio inválido (ej. '1A') y lo ignora.
                    if (!numeroIdentificacionValido || !nombreValido || !apellidoValido) {
                        // console.log("Búsqueda cancelada: Filtro con formato inválido.");
                        return; 
                    }

                    // 3. Debounce: Limpia el temporizador anterior y establece uno nuevo
                    clearTimeout(searchTimeout);

                    searchTimeout = setTimeout(() => {
                        // Llama a la función de carga de cuentas con el valor (el objeto) de los filtros si todo está correcto
                        loadSuppliers(newFilters);
                    }, 300); // 300ms de espera para estabilizar los inputs de texto
                    
                }, 
                { 
                    deep: true, 
                    immediate: true //  Fuerza la ejecución al montar el componente
                }
            );


            /**
            * Maneja el evento 'add-supplier' del modal llamando a la API.
            */   
            const addSupplier = async (newSupplierData) => {
                try {
                    
                    const response = await api.post(rutaCrear, newSupplierData);

                    // Mostrar alerta de éxito al usuario
                    exito('Éxito', 'Proveedor registrado correctamente.');

                    await loadSuppliers(); 

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

                    error('Error al registrar al proveedor', mensajeError);
                }
            };



        // ----------------------------------- Bloque de los filtros ----------------------------------------
            /**
             * Muestra u oculta la sección de filtros.
             */
            const toggleFiltersVisibility = () => {
                areFiltersVisible.value = !areFiltersVisible.value;
            };


        // ----------------------------------- Validaciones de los filtros ----------------------------------------


            /**
             * Valida que el campo 'numero_identificacion' solo contenga números (0-9) o guión
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
                const hasInvalidChar = /[^0-9-]/.test(value); 

                if (hasInvalidChar) {
                    // 1. Mostrar la alerta
                    error('Error en el número de identificación', `Sólo puedes ingresar números y guiones.`);

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

                // Patrón: Si contiene algo que NO es una letra (con acentos/ñ) y espacio.
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

                // Patrón: Si contiene algo que NO es una letra (con acentos/ñ) y espacio.
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
                loadSuppliers();
            };





      // ----------------------------------- Modal ----------------------------------------

            /**
            * Abre el modal y lo configura en modo Creación o Edición.
            */
            const openModal = () => {

            // En cualquier caso, el modal debe hacerse visible
            isModalVisible.value = true;

            };


            /**
            * Cierra el modal y resetea el estado de edición.
            */
            const closeModal = () => {

            // Modal oculto
            isModalVisible.value = false;

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

    .table-custom td, th {
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


        /* Columna Número de identificación */
        .col-numero_identificacion {
            width: 10%;
            min-width: 80px; /* Asegura que el nombre sea legible */
            max-width: 100px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Nombre */
        .col-nombre {
            width: 10%;
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Apellido */
        .col-apellido {
            width: 10%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Tipo*/
        .col-tipo {
            width: 9%;
            min-width: 80px; 
            max-width: 150px;
        }

    
        /* Columna Fecha creación*/
        .col-fecha_creacion {
            width: 14%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Ultima fecha de actualización */
        .col-fecha_actualizacion {
            width: 13%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Estado */
        .col-estado {
            width: 8%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 200px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Estado */
        .col-puede_inscribirse {
            width: 12%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 200px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* Columna Acciones */
        .col-acciones {
            width: 6%; 
            min-width: 80px; /* CLAVE: El ancho mínimo debe ser suficiente para tus 3 botones */
        }



/* ------------------ El contenedor de filtros ------------------*/

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


    /* ------------------- Estilos de Transición del contenedor de los filtros ("fade-slide") ------------------ */

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

