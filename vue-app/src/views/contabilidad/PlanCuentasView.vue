<template>

  <div class="account-type-manager">

    <h2>Gestión de Tipos de Cuentas</h2>
    <div class="mb-3">
        <!-- Botón para crear una nueva cuenta -->
        <button @click="openModal" class="btn btn-outline-primary flex-fill py-2 shadow-sm ms-2 mb-2">
        + Agregar Nueva Cuenta
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
                    <label for="codigo">Código:</label>
                    <input 
                        type="text" 
                        id="codigo" 
                        v-model="filters.codigo" 
                        placeholder="Buscar por código..."
                        class="form-control"
                        @input="validateCodigo"
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
                    <label for="nivel">Nivel:</label>
                    <select id="nivel" v-model="filters.nivel" class="form-control">
                        <option value="">Todos</option>
                        <option value="1">Nivel 1</option>
                        <option value="2">Nivel 2</option>
                        <option value="3">Nivel 3</option>
                        <option value="4">Nivel 4</option>
                        <option value="5">Nivel 5</option>
                        <option value="6">Nivel 6</option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="naturaleza">Naturaleza:</label>
                    <select id="naturaleza" v-model="filters.naturaleza" class="form-control">
                        <option value="">Todas</option>
                        <option value="1">Deudora</option>
                        <option value="2">Acreedora</option>
                    </select>
                </div>

                <div class="filter-group col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="clasificacion">Clasificación:</label>
                    <select id="clasificacion" v-model="filters.clasificacion" class="form-control">
                        <option value="">Todas</option>
                        <option value="1">Real</option>
                        <option value="2">Nominal</option>
                    </select>
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


                <div class="filter-group filter-parent col-12 col-sm-4 col-md-3 col-lg-2 mb-3">
                    <label for="parent-search">Cuenta Padre:</label>
                    <input 
                        type="text" 
                        id="parent-search" 
                        v-model="parentSearchQuery" 
                        @input="searchParents"
                        placeholder="Buscar por código o nombre..."
                        class="form-control"
                        autocomplete="off"
                    >
                    
                    <ul v-if="parentSearchResults.length > 0" class="autocomplete-results">
                        <li 
                            v-for="result in parentSearchResults" 
                            :key="result.id" 
                            @click="selectParent(result)"
                        >
                            {{ result.codigo }} - {{ result.nombre }}
                        </li>
                    </ul>

                    <div v-if="selectedParent.id" class="selected-parent-tag">
                        <span>
                            Filtrando por: {{ selectedParent.codigo }} - {{ selectedParent.nombre }}
                        </span>
                        <button @click="clearParentFilter" class="btn-clear-parent">X</button>
                    </div>
                </div>

            </div>


        </div>

    </Transition>

    <!-- Tabla de las cuentas -->
    <div class="table-responsive">
        <table class="table table-striped table-hover table-bordered table-custom">

        <thead class="header-personalizado">
            <tr>
                <th class="text-center col-codigo">Código</th>
                <th class="text-center col-nivel">Nivel</th>
                <th class="text-center col-nombre">Nombre</th>
                <th class="text-center col-naturaleza">Naturaleza</th>
                <th class="text-center col-clasificacion">Clasificación</th>
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
            <tr v-else-if="accountTypes.length === 0">
                <td colspan="10" class="text-center">
                    <span class="no-results-message">No se encontraron tipos de cuentas. Intenta ajustar los filtros.</span>
                </td>
            </tr>
            <tr v-else v-for="account in accountTypes" :key="account.id">
                <td>{{ account.codigo }}</td>
                <td>{{ account.nivel }}</td>
                <td>{{ account.nombre }}</td>
                <td>{{ account.naturaleza.nombre }}</td>
                <td>{{ account.clasificacion.nombre }}</td>
                <td>{{ formatDateTime(account.fechaCreacion) }}</td>
                <td>{{ formatDateTime(account.fechaActualizacion) }}</td>

                <td>
                    {{ account.estado ? 'Activo' : 'Inactivo' }}
                </td>
                <td class="text-center">           
                    <button 
                    class="btn btn-sm btn-outline-primary me-1" 
                    @click="toggleStatus(account)"
                    :disabled="account.nivel === 1" 
                    :title="account.nivel === 1 ? 'Cuentas de Nivel 1 no se pueden desactivar' : ''"
                    >
                    <i :class="account.estado ? 'bi bi-toggle-on' : 'bi bi-toggle-off'"></i> 
                    </button>

                    <button 
                    class="btn btn-sm btn-outline-info"
                    @click="openModal(account)"
                    :disabled="account.nivel === 1" 
                    :title="account.nivel === 1 ? 'Cuentas de Nivel 1 no se pueden modificar' : ''"
                    >
                    <i class="bi bi-pencil"></i>
                    </button>               
                </td>
            </tr>
        </tbody>
        

        </table>
    </div>

    <!-- Modal para crear o editar una cuenta -->
    <AccountFormModal
      :isVisible="isModalVisible"
      :initialData="accountToEdit" 
      @close="closeModal"
      @add-account="addAccount"
      @update-account="updateAccount" 
    />

  </div>
  
    
</template>


<script setup>

    // ----------------------------------- Importaciones ----------------------------------------
     
        import { ref, watch } from 'vue';

        // Se importa el hook de las notificaciones toast
        import { useToast } from '../../services/notificacionesService';

        // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
        const { exito, error, info, warning } = useToast();

        import AccountFormModal from './FormularioPlanCuentasView.vue';

        // Se importa el objeto axios que permitirá la conexión con la api
        import api from '../../services/api'; 

        // Rutas
            // Ruta base
            const rutaBase = "/PlanCuenta/"

            // Buscar cuentas
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear cuenta
            const rutaCrear= `${rutaBase}CrearCuenta`

            // Modificar cuenta
            const rutaModificar = `${rutaBase}Modificar`

             // Cambiar estado cuenta
            const rutaCambiarEstado = `${rutaBase}CambiarEstado`





    // ----------------------------------- Variables ----------------------------------------

        // Se inicializa como array vacío. Los datos se cargarán de la API al montar el componente.
        const accountTypes = ref([]);

        // Ésta variable reactiva permitirá controlar la visibilidad del modal
        const isModalVisible = ref(false);

        // Almacena el objeto de la cuenta que se está editando. Es 'null' en el modo creación y se pasa como argumento a la función respectiva
        // para que el modal se muestre en ése modo.
        const accountToEdit = ref(null); 

        // Indicador de carga para la tabla
        const isLoadingTable = ref(false);


        // Este objeto es la plantilla para el reset (para reiniciar los filtros)
        const initialFilters = {
            nombre: '', 
            codigo: '',
            nivel: '',
            estado: '',
            naturaleza: '',
            clasificacion: '',
            padre: '',
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
        const lastValidCodigo = ref('');
        const lastValidNombre = ref('');


        // Variables para la funcionalidad de filtrar por Cuenta Padre
        const parentSearchQuery = ref(''); // Lo que se escribe en el input
        const parentSearchResults = ref([]); // Resultados que se muestran en el dropdown
        const selectedParent = ref({ id: null, codigo: '', nombre: '' }); // Cuenta padre seleccionada

        let searchTimeout = null; // Para manejar el debouncing de la búsqueda


    // ----------------------------------- Funciones ----------------------------------------

      // ----------------------------------- API ----------------------------------------
      
            /**
             * Carga los datos desde la API, AHORA aceptando filtros.
             * @param {object} currentFilters - Objeto con los filtros a aplicar.
             */
            const loadAccounts = async (currentFilters = {}) => {
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

                    accountTypes.value = response.data.data; 

                } catch (err) {
                    error('Error de Servidor', 'No se pudieron obtener los datos de las cuentas. Intente de nuevo.');
                } finally {
                    isLoadingTable.value = false;
                }
            };


            watch(
                filters, // Monitorea la referencia ref directamente
                (newFilters) => {
                
                // El Código debe ser vacío o contener SOLO números (^\d+$).
                // (El .trim() maneja la validación de solo espacios, convirtiéndolos en '')
                const codigoValido = newFilters.codigo.trim() === '' || /^\d+$/.test(newFilters.codigo);

                // El Nombre debe ser vacío o contener SOLO caracteres permitidos (letras, espacios, guiones, etc.)
                const nombreValido = newFilters.nombre.trim() === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\-/]+$/.test(newFilters.nombre);
                
                
                // 2. Compuerta de seguridad: CANCELAR la búsqueda si algún filtro es inválido
                // Esto captura el estado intermedio inválido (ej. '1A') y lo ignora.
                if (!codigoValido || !nombreValido) {
                    // console.log("Búsqueda cancelada: Filtro con formato inválido.");
                    return; 
                }

                // 3. Debounce: Limpia el temporizador anterior y establece uno nuevo
                clearTimeout(searchTimeout);

                searchTimeout = setTimeout(() => {
                    // Llama a la función de carga de cuentas con el valor (el objeto) de los filtros si todo está correcto
                    loadAccounts(newFilters);
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
            const addAccount = async (newAccountData) => {
                try {
                    // 1. Llama a la API (POST) para crear la cuenta.
                    const response = await api.post(rutaCrear, newAccountData);

                    // Mostrar alerta de éxito al usuario
                    exito('Éxito', 'Cuenta creada correctamente.');

                    await loadAccounts(); 

                    // 4. Cerrar el modal.
                    closeModal();

                } catch (err) {
                    error('Error al crear la cuenta', `${err.response?.data?.message || 'Error de servidor.'}`);
                }
            };


            /**
             * Maneja el evento 'update-account' del modal llamando a la API.
             */
            const updateAccount = async (updatedData) => {
                try {
                // 1. Llama a la API (PUT) para actualizar la cuenta.
                // La ruta incluye el ID: /api/accounts/:id
                const response = await api.put(`${rutaModificar}/${updatedData.id}`, updatedData);

                // Mostrar alerta de éxito al usuario
                exito('Éxito', 'Cuenta modificada correctamente.');

                await loadAccounts(); 

                // 4. Cerrar el modal.
                closeModal();


                } catch (err) {
                    error('Error al modificar la cuenta', `${err.response?.data?.message || 'Error de servidor.'}`);
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
             * Valida que el campo 'Código' solo contenga números (0-9).
             */
            const validateCodigo = () => {
                let value = filters.value.codigo;

                // 1. Manejar solo espacios
                if (value.trim() === '') {
                    // Si el valor es solo espacios o está vacío, lo forzamos a vacío.
                    filters.value.codigo = '';
                    lastValidCodigo.value = ''; // Resetear el estado válido
                    return; 
                }

                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                const hasInvalidChar = /[^0-9]/.test(value); 

                if (hasInvalidChar) {
                    // 1. Mostrar la alerta
                    error('Error en el código', `Sólo puedes ingresar números.`);

                    // 2. Revertir el valor del filtro al último estado válido conocido.
                    // Esto hace que el carácter inválido parezca "borrarse" del input al instante, 
                    // pero la búsqueda no se dispara con el valor incorrecto.
                    filters.value.codigo = lastValidCodigo.value;

                } else {
                    // 3. Si es válido, actualizar la variable de estado válido.
                    lastValidCodigo.value = value;
                }
            };


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

            // ----------------------------------- Filtro de búsqueda de la cuenta padre ----------------------------------------

            /**
             * Busca cuentas padre en el servidor con debouncing.
             */
            const searchParents = () => {
                /* Se limpiar el timeout anterior para evitar llamadas excesivas (por ejemplo, si escribimos "1" en vez de que se vaya
                a buscarlo, espera un momento ya que puede escribirse "11" y sólo buscará el texto final que ingresemos */
                clearTimeout(searchTimeout);
                parentSearchResults.value = []; // limpiar resultados anteriores


                // Limpia los espacios al inicio y final, pero mantiene los internos
                const query = parentSearchQuery.value.trim(); 

                // Si la caja de búsqueda está vacía después de limpiar el trim, salimos.
                if (query.length < 1) {
                return;
                }

                // Establecer un nuevo timeout
                searchTimeout = setTimeout(async () => {
                try {
                    const query = parentSearchQuery.value;
                    let params = {};
                    
                    // Regex para verificar si SOLO contiene números el input (ej: "123")
                    const isOnlyNumber = /^\d+$/.test(query);

                    // Regex para verificar si SOLO contiene letras y espacios (ej: "Activo Corriente")
                    // Incluye letras, espacios y acentos.
                    const isOnlyLettersSpaces = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/.test(query);

                    if (isOnlyNumber) {
                        // Caso 1: Solo Números -> Buscar por Código
                        params.codigo = query;
                    } else if (isOnlyLettersSpaces) {
                        // Caso 2: Solo Letras -> Buscar por Nombre
                        params.nombre = query;
                    } else {
  
                        error('Error en la cuenta padre', `Se requieren solo números o solo letras.`);

                        parentSearchResults.value = [];
                        return; // Detiene la ejecución aquí
                    }

                    //  Llamada a la API 
                    // Si el backend tiene un endpoint más específico para búsqueda de padres (ej: /BuscarPadres), usarlo.
                    const response = await api.get(rutaBuscar, { params }); 

                    // Asumiendo que la respuesta es response.data.data
                    parentSearchResults.value = response.data.data;
                    
                } catch (err) {
                    error('Error al buscar cuentas padre', err);
                    parentSearchResults.value = [];
                }
                }, 300); // 300ms de retraso (Para lo que se dijo de esperar)
            };


            /**
            * Selecciona una cuenta de los resultados del autocomplete.
            * @param {object} account - La cuenta seleccionada (debe tener id, codigo, nombre).
            */
            const selectParent = (account) => {
                // Establecer la cuenta seleccionada para mostrar el tag
                selectedParent.value = { 
                id: account.id, 
                codigo: account.codigo, 
                nombre: account.nombre 
                };

                // Limpiar el input y los resultados del autocomplete
                parentSearchQuery.value = '';
                parentSearchResults.value = [];

                // Actualizar el filtro 'padre' que está siendo monitoreado por el watcher principal
                filters.value.padre = account.id;

                // El watcher de 'filters' se encargará de llamar a loadAccounts
            };


            /**
             * Limpia el filtro de cuenta padre.
             */
            const clearParentFilter = () => {
                selectedParent.value = { id: null, codigo: '', nombre: '' };
                filters.value.padre = '';
            };



            /**
             * Cambia el estado de una cuenta (activo/inactivo) llamando a la API.
             * @param {object} account - El objeto de cuenta a modificar.
             */
            const toggleStatus = async (account) => {

                // Revisar en el frontend que la cuenta no sea de nivel 1, aunque el botón esté deshabilitado.
                if (account.nivel === 1) {

                    error('Error al cambiar el estado', `Las cuentas de nivel 1 no pueden ser desactivadas.`);

                    return; // Detiene la ejecución si es Nivel 1
                }

                const newStatus = !account.estado;

                try {

                    await api.put(`${rutaCambiarEstado}/${account.id}`, { estado: newStatus });

                    // Si la llamada es exitosa, actualiza la variable local para que Vue refresque el DOM.
                    account.estado = newStatus;

                    exito('Éxito', `Estado de la cuenta ${account.codigo} cambiado a: ${newStatus ? 'Activo' : 'Inactivo'}`);

                } catch (err) {
                    error('Error al cambiar el estado', err);
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

                clearParentFilter();

                // RECARGAR TABLA
                loadAccounts();
            };





      // ----------------------------------- Modal ----------------------------------------
        /**
        * Abre el modal y lo configura en modo Creación o Edición.
        * @param {object|null} account - El objeto de cuenta para editar, o null para crear.
        */
        const openModal = (account = null) => {

          /* En modo edición se tendría el objeto de la cuenta (es decir, el objeto del array), y se usará para crear una copia
          y usar ésa copia en el modal (ya que asi, cualquier cosa que se modifique afecta a los inputs, si enviamos el bjeto
          original significa que cualquier cambio sobre este se vería reflejado en la tabla, y solamente debe hacerse los cambios
          cuando el usuario de click en el botón de "Guardar cambios") */
          if (account) { 
              
              // Buscar y adjuntar la información del padre
              let parentData = {};

              if (account.padreId) {
                  // Buscar el objeto completo de la cuenta padre en la lista completa (accountTypes)
                  const parentAccount = accountTypes.value.find(a => a.id === account.padreId);

                  if (parentAccount) {
                      // Si se encuentra, crear un objeto con la información del padre
                      parentData = {
                          parentCode: parentAccount.codigo,
                          parentName: parentAccount.nombre,
  
                      };
                  }
              }

              // Crear el objeto que se enviará al modal.
              // Contiene los datos de la cuenta hija, MÁS la data del padre.
              accountToEdit.value = { 
                  ...account, 
                  ...parentData // Adjunta parentCode, parentName, parentType (si existen)
              };

          } else { // En modo creación el valor del objeto de la cuenta es null, ya que no hay un objeto a editar

              // Modo Creación
              accountToEdit.value = null;
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
          accountToEdit.value = null;
        };

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
        .col-codigo {
            width: 4%;
            min-width: 100px; 
            max-width: 150px;
        }

        /* 2. Columna Tipo de identificación */
        .col-nivel {
            width: 3%;
            min-width: 80px; /* Asegura que el nombre sea legible */
            max-width: 100px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 3. Columna Número de identificación */
        .col-nombre {
            width: 15%;
            min-width: 100px;
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Nombre */
        .col-naturaleza {
            width: 15%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Apellido */
        .col-clasificacion {
            width: 15%;
            min-width: 130px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Fecha creación*/
        .col-fecha_creacion {
            width: 15%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Ultima fecha de actualización */
        .col-fecha_actualizacion {
            width: 15%;
            min-width: 170px; /* Asegura que el nombre sea legible */
            max-width: 250px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 2. Columna Estado */
        .col-estado {
            width: 3%;
            min-width: 100px; /* Asegura que el nombre sea legible */
            max-width: 200px; /* Evita que ocupe todo el ancho en pantallas gigantes */
        }

        /* 4. Columna Acciones */
        .col-acciones {
            width: 15%; 
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

