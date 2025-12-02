<template>

  <div class="account-type-manager">

    <h2>Gestión de Entidades</h2>
    <div class="mb-3">
        <!-- Botón para crear una nueva entidad -->
        <button @click="openModal" class="btn btn-outline-primary flex-fill py-2 shadow-sm ms-2 mb-2">
        + Agregar Nueva Entidad
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
        <div class="filters-container" v-if="areFiltersVisible">
            <h3>Filtros</h3>

            <div class="row">
                
                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="tipo_entidad">Tipo de entidad:</label>
                    <select id="tipo_entidad" v-model="filters.tipo_entidad" class="form-control">
                        <option value="">Todos</option>
                        <option value="1">Persona Natural</option>
                        <option value="2">Persona Jurídica</option>
                        <option value="3">Entidad Interna</option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="tipo_identificacion">Tipo de identificación:</label>
                    <select id="tipo_identificacion" v-model="filters.tipo_identificacion" class="form-control">
                        <option value="">Todos</option>
                        <option value="1">Cédula de identidad</option>
                        <option value="2">Pasaporte</option>
                        <option value="3">Registro de Información Fiscal (RIF)</option>
                        <option value="4">Partida de Nacimiento</option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
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

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="numero_identificacion">Número de identificación:</label>
                    <input 
                        type="text" 
                        id="numero_identificacion" 
                        v-model="filters.numero_identificacion" 
                        placeholder="Buscar por código..."
                        class="form-control"
                        @input="validateNumero"
                    >
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
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

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
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
            
                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="creadosDesde">Creados Desde:</label>
                    <input type="date" id="creadosDesde" v-model="filters.creadosDesde" class="form-control">
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3 ">
                    <label for="creadosHasta">Creados Hasta:</label>
                    <input type="date" id="creadosHasta" v-model="filters.creadosHasta" class="form-control">
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="modificadosDesde">Modificados Desde:</label>
                    <input type="date" id="modificadosDesde" v-model="filters.modificadosDesde" class="form-control">
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="modificadosHasta">Modificados Hasta:</label>
                    <input type="date" id="modificadosHasta" v-model="filters.modificadosHasta" class="form-control">
                </div>
                
                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="estado">Estado:</label>
                    <select id="estado" v-model="filters.estado" class="form-control">
                        <option value="">Todos</option>
                        <option value="true">Activas</option>
                        <option value="false">Inactivas</option>
                    </select>
                </div>

 
            </div>


        </div>

    </Transition>

    <!-- Tabla de las cuentas -->
    <div class="table-responsive">
        <table class="table table-striped table-hover table-bordered table-custom">

        <thead class="header-personalizado">
            <tr>
                <th class="text-center col-tipo_entidad">Tipo de entidad</th>
                <th class="text-center col-tipo_identificacion">Tipo de identificación</th>
                <th class="text-center col-numero_identificacion">Número de identificación</th>
                <th class="text-center col-nombre">Nombre</th>
                <th class="text-center col-apellido">Apellido</th>
                <th class="text-center col-fecha_creacion">Fecha de creación</th>
                <th class="text-center col-fecha_actualizacion">Última modificación</th>
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
            <tr v-else-if="entitiesTypes.length === 0">
                <td colspan="10" class="text-center">
                    <span class="no-results-message">No se encontraron entidades. Intenta ajustar los filtros.</span>
                </td>
            </tr>
            <tr v-else v-for="entity in entitiesTypes" :key="entity.id">
                <td class="">{{ entity.tipo_entidad.nombre }}</td>
                <td class="">{{ entity.tipo_identificacion.nombre }}</td>
                <td class="">{{`${entity.prefijo.letra_prefijo} - ${entity.numero_identificacion}`}}</td>
                <td class="">{{ entity.nombre }}</td>
                <td class="">{{ entity.apellido }}</td>
                <td class="">{{ formatDateTime(entity.fechaCreacion) }}</td>
                <td class="">{{ formatDateTime(entity.fechaActualizacion) }}</td>


                <td class="">
                    {{ entity.estado ? 'Activo' : 'Inactivo' }}
                </td>

                <td class=" text-center">
                    <div class="d-flex flex-row flex-nowrap justify-content-center">
                        <button 
                            class="btn btn-sm btn-outline-info me-1" 
                            @click="showDetailsModal(entity)" 
                            title="Ver detalles de la Entidad"
                        >
                            <i class="bi bi-eye-fill"></i> 
                        </button>

                        <button 
                        class="btn btn-sm btn-outline-primary me-1" 
                        @click="toggleStatus(entity)"
                        :disabled="entity.id === 1" 
                        :title="entity.id === 1 ? 'La cuenta interna de la academia no se puede desactivar' : ''"
                        >
                        <i :class="entity.estado ? 'bi bi-toggle-on' : 'bi bi-toggle-off'"></i> 
                        </button>

                        <button 
                        class="btn btn-sm btn-outline-info"
                        @click="openModal(entity)"
                        :disabled="entity.id === 1" 
                        :title="entity.id === 1 ? 'La cuenta interna de la academia no se puede modificar' : ''"
                        >
                        <i class="bi bi-pencil"></i>
                        </button>    
                    </div>           
                </td>
            </tr>
        </tbody>
        

        </table>
    </div>

    <!-- Modal para crear o editar una entidad -->
    <AccountFormModal
      :isVisible="isModalVisible"
      :initialData="entityToEdit" 
      @close="closeModal"
      @add-account="addEntity"
      @update-account="updateEntity" 
    />

    <!-- Modal para ver los datos de una entidad -->
    <EntityDetailsModal
        :isVisible="isDetailsModalVisible"
        :entityData="entityToView"
        @close="closeDetailsModal"
    />

  </div>
  
    
</template>


<script setup>

    // ----------------------------------- Importaciones ----------------------------------------
       
        import { ref, watch, } from 'vue';

        // Se importa el hook de las notificaciones toast
        import { useToast } from '../../services/notificacionesService';

        // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
        const { exito, error, info, warning } = useToast();

        import AccountFormModal from './FormularioEntidadesView.vue';

        import EntityDetailsModal from './EntityDetailsModal.vue';

        // Se importa el objeto axios que permitirá la conexión con la api
        import api from '../../services/api'; 

    // ----------------------------------- Variables ----------------------------------------

        // Rutas
            // Ruta base
            const rutaBase = "/Entidad/"

            // Buscar entidades
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear entidad
            const rutaCrear = `${rutaBase}CrearEntidad`

            // Modificar entidad
            const rutaModificar = `${rutaBase}Modificar`

            // Modificar entidad
            const rutaCambiarEstado = `${rutaBase}CambiarEstado`


        // Se inicializa como array vacío. Los datos se cargarán de la API al montar el componente.
        const entitiesTypes = ref([]);

        // Ésta variable reactiva permitirá controlar la visibilidad del modal
        const isModalVisible = ref(false);

        // Para controlar la visibilidad del modal de visualización (sólo lectura)
        const isDetailsModalVisible = ref(false); 

        // Para guardar los datos de la entidad a visualizar en el modal de detalles
        const entityToView = ref(null);

        // Almacena el objeto de la cuenta que se está editando. Es 'null' en el modo creación y se pasa como argumento a la función respectiva
        // para que el modal se muestre en ése modo.
        const entityToEdit = ref(null); 

        // Indicador de carga para la tabla
        const isLoadingTable = ref(false);

        // Este objeto es la plantilla para el reset (para reiniciar los filtros)
        const initialFilters = {
            tipo_entidad: '', 
            tipo_identificacion: '',
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

    

        // Variables que almacenan el último valor de filtro que fue válido (para el número de identificación, el nombre y el apellido)
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
            const loadEntities = async (currentFilters = {}) => {
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

                    entitiesTypes.value = response.data.data; 

                } catch (err) {
                    error('Error de Servidor', 'No se pudieron obtener los datos de las entidades. Intente de nuevo.');
                } finally {
                    isLoadingTable.value = false;
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
                    loadEntities(newFilters);
                }, 300); // 300ms de espera para estabilizar los inputs de texto
                
                }, 
                { 
                    deep: true, 
                    immediate: true //  Fuerza la ejecución al montar el componente
                }
            );


            /**
            * Maneja el evento 'add-account' del modal llamando a la API.
            */   
            const addEntity = async (newEntitytData) => {
                try {

                    // 1. Llama a la API (POST) para creación
                    const response = await api.post(rutaCrear, newEntitytData);

                    exito('Éxito', 'Entidad creada correctamente.');

                    await loadEntities(); 

                    // 4. Cerrar el modal.
                    closeModal();

                }catch (err) {
                    error('Error al crear la entidad', `${err.response?.data?.message || 'Error de servidor.'}`);
                }
            };


            /**
             * Maneja el evento 'update-account' del modal llamando a la API.
             */
            const updateEntity = async (updatedData) => {
    
                try {
                    // 1. Llama a la API (PUT) para actualizar la cuenta.
                    // La ruta incluye el ID: /api/accounts/:id
                    const response = await api.put(`${rutaModificar}/${updatedData.id}`, updatedData);

                    exito('Éxito', 'Entidad modificada correctamente.');

                    await loadEntities(); 

                    // 4. Cerrar el modal.
                    closeModal();


                }catch (err) {
                    error('Error al modificar la entidad', `${err.response?.data?.message || 'Error de servidor.'}`);
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
             * Valida que el campo 'numero_identificacion' solo contenga números (0-9). 
            */            
            const validateNumero = () => {

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

           

            /**
             * Cambia el estado de una cuenta (activo/inactivo) llamando a la API.
             * @param {object} account - El objeto de cuenta a modificar.
             */
            const toggleStatus = async (entity) => {

            const newStatus = !entity.estado;

                try {

                    await api.put(`${rutaCambiarEstado}/${entity.id}`, { estado: newStatus });

                    // Si la llamada es exitosa, actualiza la variable local para que Vue refresque el DOM.
                    entity.estado = newStatus;

                    exito('Éxito', `Estado de la entidad ${entity.numero_identificacion} cambiado a: ${newStatus ? 'Activo' : 'Inactivo'}`);

                } catch (err) {
                    error('Error al cambiar el estado', `${err.response?.data?.message || 'Error de servidor.'}`);

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
                loadEntities();
            };





      // ----------------------------------- Modals ----------------------------------------

            // ----------------------------------- Creación / Edición ----------------------------------------

                /**
                * Abre el modal y lo configura en modo Creación o Edición.
                * @param {object|null} account - El objeto de cuenta para editar, o null para crear.
                */
                const openModal = (entity = null) => {

                    /* En modo edición se tendría el objeto de la cuenta (es decir, el objeto del array), y se usará para crear una copia
                    y usar ésa copia en el modal (ya que asi, cualquier cosa que se modifique afecta a los inputs, si enviamos el bjeto
                    original significa que cualquier cambio sobre este se vería reflejado en la tabla, y solamente debe hacerse los cambios
                    cuando el usuario de click en el botón de "Guardar cambios") */
                    if (entity) { 
                        
                        // Crear el objeto que se enviará al modal.
                        // Contiene los datos de la cuenta hija, MÁS la data del padre.
                        entityToEdit.value = { 
                            ...entity
                        };

                    } else { // En modo creación el valor del objeto de la cuenta es null, ya que no hay un objeto a editar

                        // Modo Creación
                        entityToEdit.value = null;
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
                    entityToEdit.value = null;
                };


            // ----------------------------------- Visualización de datos ----------------------------------------

            /**
             * Muestra el modal de detalles (solo vista) para una entidad.
             * @param {Object} entity - La entidad seleccionada de la tabla.
             */
            function showDetailsModal(entity) {
                entityToView.value = entity;
                isDetailsModalVisible.value = true;
            }

            /**
             * Cierra el modal de detalles.
             */
            function closeDetailsModal() {
                isDetailsModalVisible.value = false;
                entityToView.value = null; // Limpiar los datos al cerrar
            }


</script>




<style scoped>
.account-type-manager {
  padding: 20px;
}




/* La tabla*/

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

        /* 1. Columna Tipo de entidad */
        .col-tipo_entidad {
            width: 10%;
            min-width: 130px; 
            max-width: 250px;
        }

        /* 2. Columna Tipo de identificación */
        .col-tipo_identificacion {
            width: 24%;
            min-width: 140px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 3. Columna Número de identificación */
        .col-numero_identificacion {
            width: 10%;
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Nombre */
        .col-nombre {
            width: 10%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Apellido */
        .col-apellido {
            width: 10%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Fecha creación*/
        .col-fecha_creacion {
            width: 10%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Ultima fecha de actualización */
        .col-fecha_actualizacion {
            width: 10%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Estado */
        .col-estado {
            width: 6%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 200px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 4. Columna Acciones */
        .col-acciones {
            width: 10%; 
            min-width: 130px; /* CLAVE: El ancho mínimo debe ser suficiente para tus 3 botones */
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

