<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">
            
            <div class="row">

      
                <div class="form-group col-12 col-lg-6">
                    <label for="nombre">Nombre: <span class="asterisc">*</span></label>
                    <input 
                            type="text" 
                            id="nombre" 
                            v-model="newCourse.nombre"  
                            class="form-control"
                            :class="nombreValidationClass"
                        >
                    <small v-if="errors.nombre" class="error-message">{{ errors.nombre }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="descripcion">Descripción: <span class="asterisc">*</span></label>
                    <input 
                            type="text" 
                            id="descripcion" 
                            v-model="newCourse.descripcion"       
                            class="form-control"
                            :class="descripcionValidationClass"
                        >
                    <small v-if="errors.descripcion" class="error-message">{{ errors.descripcion }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="categoria">Categoría: <span class="asterisc">*</span></label>
                    <select 
                        id="categoria" 
                        v-model="newCourse.categoria" 
                        class="form-select"
                        :class="categoriaValidationClass"
                    >
                        <option value="" disabled>Seleccione una categoría</option>
                        <option 
                            v-for="cat in categorias" 
                            :key="cat.id" 
                            :value="cat.id"
                            :title="cat.descripcion">
                            {{ cat.nombre }}
                        </option>
                    </select>
                    <small v-if="errors.categoria" class="error-message">{{ errors.categoria }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="subcategoria">Sub-Categoría: <span class="asterisc">*</span></label>
                    <select 
                        id="subcategoria" 
                        v-model="newCourse.subcategoria" 
                        class="form-select"
                        :class="subcategoriaValidationClass"
                        :disabled="subcategorias.length === 0 && newCourse.categoria === ''"
                    >
                        <option value="" disabled>Seleccione una sub-categoría</option>
                        <option 
                            v-for="subcat in subcategorias" 
                            :key="subcat.id" 
                            :value="subcat.id"
                            :title="subcat.descripcion">
                            {{ subcat.nombre }}
                        </option>
                    </select>
                    <small v-if="errors.subcategoria" class="error-message">{{ errors.subcategoria }}</small>
                </div>


                <div class="form-group col-12 col-lg-6">
                    <label for="total_clases">Total de clases: <span class="asterisc">*</span></label>
                    <input 
                            type="text" 
                            id="total_clases" 
                            v-model="newCourse.total_clases" 
                            class="form-control"
                            :class="totalClasesValidationClass"
                        >
                    <small v-if="errors.total_clases" class="error-message">{{ errors.total_clases }}</small>
                    <small class="">Cada clase se compone de un bloque (2 horas)</small>
                </div>


                <!-- Se oculta si es modo creación -->
                <div v-if="newCourse.id" class="form-group col-12 col-lg-6">
                    <label for="estado">Estado: <span class="asterisc">*</span></label>
                    <select 
                        id="estado" 
                        v-model="newCourse.estado"  
                        class="form-control"
                    >
                        <option value="" disabled selected> Seleccione un estado... </option>
                        
                        <option 
                            v-for="estado in estadosDisponibles" 
                            :key="estado.id" 
                            :value="estado.id"
                            :title="estado.descripcion"
                        >
                            {{ estado.nombre }}
                        </option>
                        
                    </select>
                    <small v-if="errors.estado" class="error-message">{{ errors.estado }}</small>
                </div>
            
   
            </div>


            <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

            <div class="modal-actions">
                <button type="submit" class="btn-primary" :disabled="!isFormValid" >
                    {{ newCourse.id ? 'Guardar Cambios' : 'Crear Curso' }}
                </button>
                
                <button type="button" @click="$emit('close')" class="btn btn-outline-secondary-custom">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                
                </button>
            </div>

        </form>

        
        </div>

    </Transition>
  </div>
</template>

<script setup>

  // ----------------------------------- Importaciones ----------------------------------------
  import { ref, computed, defineProps, defineEmits, watch } from 'vue';

  // Se importa el hook de las notificaciones toast
  import { useToast } from '../../services/notificacionesService';

  // Se llama a la función "useToast()" y desestructura los métodos que se necesitan (exito, error, etc.):
  const { exito, error, info, warning } = useToast();
 
  import api from '../../services/api'; 

  // ----------------------------------- Variables ----------------------------------------

          // Rutas

            // Rutas de Categoría 
            const rutaCategoriasBase = "/CategoriaCurso/"
            const rutaBuscarCategorias = `${rutaCategoriasBase}BuscarCategorias` 

            // Ruta base estados curso
            const rutaBaseEstadoCurso = "/EstadoCurso/"
            const rutaBuscarEstadosCurso = `${rutaBaseEstadoCurso}ObtenerEstadosCurso` 


   

      // ----------------------------------- Propiedades ----------------------------------------

            // Se definen las propiedades que usará el componente hijo del padre
            const props = defineProps({

                isVisible: {// El nombre que se le da a la propiedad (para controlar la visibilidad del modal)
                type: Boolean, // El tipo del dato
                required: true // El componente hijo no funcionará si el padre no envía el dato
                },
                
                initialData: { // El objeto para prellenar en modo edición (será 'null' en modo creación)
                type: Object, // El tipo
                default: null /* Si el padre no envía un objeto (es decir, el padre la deja en null, como ocurre en modo "creación"), 
                                la propiedad initialData del modal automáticamente tomará el valor de null.*/
                }
            });


            /* Se definen las salidas (los eventos o señales) que el componente hijo puede generar. la función llamada "emit" es la que 
            utilizará en el código para disparar las señales de salida. */
            const emit = defineEmits(['close', 'add-course', 'update-course']);



      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Curso' : 'Crear Nuevo Curso';
            });
            
          

      // ----------------------------------- Formulario ----------------------------------------

            // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
            // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
            const newCourse = ref({
                id: null,              
                nombre: '',
                descripcion: '',
                categoria: '',
                subcategoria: '',
                total_clases: '',
                estado: ''          
            });

            const categorias = ref([]); // Lista de categorías padres
            const subcategorias = ref([]); // Lista de subcategorías (dependientes de la categoría seleccionada)
            const initialSubcategoria = ref('');
            const isLoadingInitialData = ref(false);

            // Variable para almacenar los estados académicos traídos del servidor
            const estadosDisponibles = ref([]); // Es un array vacío por defecto

           
            let searchTimeout = null; // Para manejar el debouncing de la búsqueda


            // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
            const errors = ref({         
                nombre: '',
                descripcion: '',
                categoria: '',
                subcategoria: '',
                total_clases: '',
                estado: '' 
            });

             // Propiedad que indíca si el modal está en modo edición
            const isEditMode = computed(() => !!newCourse.value.id);


            // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
            const isFormValid = computed(() => {
                
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input del nombre. (para saber si es válido o no)
             */
            const nombreValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.nombre) {
                    return 'is-invalid';
                }

                const nombreLength = newCourse.value.nombre.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (nombreLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input de la descripcion. (para saber si es válido o no)
             */
            const descripcionValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.descripcion) {
                    return 'is-invalid';
                }

                const descripcionLength = newCourse.value.descripcion.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (descripcionLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });

            /**
             * Retorna la clase de validación de Bootstrap para el input de la categoría.
             */
            const categoriaValidationClass = computed(() => {
                if (errors.value.categoria) {
                    return 'is-invalid';
                }
                if (newCourse.value.categoria !== '') {
                    return 'is-valid';
                }
                return '';
            });

            /**
             * Retorna la clase de validación de Bootstrap para el input de la subcategoría.
             */
            const subcategoriaValidationClass = computed(() => {
                if (errors.value.subcategoria) {
                    return 'is-invalid';
                }
                if (newCourse.value.subcategoria !== '') {
                    return 'is-valid';
                }
                return '';
            });


            /**
             * Retorna la clase de validación de Bootstrap para el input del total de clases. (para saber si es válido o no)
             */
            const totalClasesValidationClass = computed(() => {

    
                // Si hay un error de validación, siempre es 'is-invalid'.
                if (errors.value.total_clases) {
                    return 'is-invalid';
                }

                const totalClasesLength = newCourse.value.total_clases.length;
                
                // Si no hay error Y hay texto (es válido), es 'is-valid'.
                if (totalClasesLength > 0) {
                    return 'is-valid';
                }
                
                // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica alguna clase.
                return '';
            });


  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {

                    isLoadingInitialData.value = !!initialData;

                    // Reinicia los datos principales (newCourse)
                    newCourse.value = {
                        id: initialData?.id || null,        
                        nombre: initialData?.nombre || '',
                        descripcion: initialData?.descripcion || '',
                        categoria: initialData?.categoria?.categoria_padre?.id || '',
                        subcategoria: initialData?.categoria?.id || '',      
                        total_clases: initialData?.total_clases || '',
                        estado: initialData?.estado?.id || ''        
                    };


                    // Lógica de reseteo/inicialización de listas de categorías
                    if (!initialData) {
                        // Modo Creación o Cerrando
                        subcategorias.value = [];
                    } else if (initialData?.categoria?.categoria_padre?.id) {
                        // Modo Edición: Cargar subcategorías si hay categoría padre
                        // Esto se manejará en el watcher de isVisible, pero lo dejamos aquí por consistencia
                        // El watcher de newCourse.categoria lo manejará después del reset.
                    }


                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);


                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.nombre = ''; 
                    errors.value.descripcion = ''; 
                    errors.value.categoria = ''; 
                    errors.value.subcategoria = ''; 
                    errors.value.total_clases = '';
                    errors.value.estado = '';
            };

        // ----------------------------------- Lógica de Categorías ----------------------------------------

            /**
             * Carga todas las categorías padre.
             */
            const cargarCategoriasPadres = async () => {
                try {
                    const response = await api.get(rutaBuscarCategorias);
                    if (response.data && response.data.data) {
                        categorias.value = response.data.data;
                    } else {
                        warning('Advertencia', 'No se encontraron categorías.');
                        categorias.value = [];
                    }
                } catch (err) {
                    error('Error de API', 'Falló la carga de categorías.');
                    categorias.value = [];
                }
            };

            /**
             * Carga las subcategorías dado el ID de la categoría padre.
             * @param {number} id_padre - ID de la categoría padre.
             */
            const cargarSubcategorias = async (id_padre) => {
                subcategorias.value = []; // Limpiar antes de cargar
                
                if (!id_padre) {
                    return;
                }

                try {
                    // Asumo que la ruta espera el ID en el path o como query param,
                    // usando query param aquí como ejemplo:
                    const response = await api.get(`${rutaBuscarCategorias}?padre=${id_padre}`);
                    if (response.data && response.data.data) {
                        subcategorias.value = response.data.data;
                    } else {
                        info('Información', 'La categoría seleccionada no tiene subcategorías.');
                        subcategorias.value = [];
                    }
                } catch (err) {
                    error('Error de API', 'Falló la carga de subcategorías.');
                    subcategorias.value = [];
                }
            };

            // Watcher para la selección de Categoría
            /* Vigila si cambia la categoría padre. Si cambia, debe limpiar la subcategoría
            * y cargar las nuevas subcategorías. Se ejecuta inmediatamente en la apertura
            * en modo edición gracias a 'immediate: true' del watcher isVisible.
            */
            watch(() => newCourse.value.categoria, async (newId) => { // Eliminé 'oldId' ya que no lo usaremos directamente.

                if (newId) {
                    // Si estamos cargando datos iniciales (modo edición), 
                    // cargamos las subcategorías, pero no limpiamos la subcategoría seleccionada.
                    if (isLoadingInitialData.value) {
                        // Cargar subcategorías (esto es necesario para que aparezcan en el select)
                        await cargarSubcategorias(newId);
                        
                        // Desactivar la bandera inmediatamente después de la carga para no interferir con cambios manuales.
                        isLoadingInitialData.value = false;

                    } else {
                        // Si no es la carga inicial (cambio manual de categoría), limpiamos la subcategoría
                        newCourse.value.subcategoria = ''; 
                        await cargarSubcategorias(newId);
                    }

                } else {
                    // Si newId está vacío, limpiamos la lista y el valor.
                    subcategorias.value = [];
                    newCourse.value.subcategoria = ''; 
                }
            }, { immediate: true });


            // ----------------------------------- Lógica de ESTADOS ----------------------------------------

             /**
            * Función para cargar los estados académicos desde el servidor basados
            */
            async function fetchEstados() {

                try {
                    // Construye la URL con el ID de la identificación
                    const response = await api.get(rutaBuscarEstadosCurso);
                    
                    // Asigna la propiedad 'data' de la respuesta a la variable reactiva.
                    // Se asume que el backend envía un array en la propiedad 'data'.
                    estadosDisponibles.value = response.data.data; 


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

                    error('Error al cargar estados', mensajeError);

                    estadosDisponibles.value = []; 
                    newCourse.value.estado = ''; // Limpiar el valor ante un error
                }
            }


        // ----------------------------------- Watcher (Apertura/Cierre del Modal) ----------------------------------------

            // Vigila cuando el modal se hace visible (se abre) y manda a reiniciar todos los campos
            watch(() => props.isVisible, async (newVal) => {

                // Si el modal se está abriendo (newVal es true)
                if (newVal) {

                    // Cargar todas las categorías padre (siempre necesario)
                    await cargarCategoriasPadres();

                    fetchEstados();

                    // En modo "abrir", se inicializa todo (incluyendo el padre si existe)
                    resetFormState(props.initialData); 

                } else {
                    // En modo "cerrar", se limpia todo.
                    resetFormState(null);
                }
            }, { immediate: true });


        // ----------------------------------- Funciones del Formulario ----------------------------------------


            // Monitorear los campos clave para validar en tiempo real
            watch([
                () => newCourse.value.nombre, 
                () => newCourse.value.descripcion, 
                () => newCourse.value.categoria, 
                () => newCourse.value.subcategoria, 
                () => newCourse.value.total_clases,
                () => newCourse.value.estado

            ], async () => {
                await runValidations(); 
            });


            /**
             * Función de Validación del formulario.
             * @param {boolean} isSubmitting - Indica si el formulario se está enviando (esto es porque si un campo salia incorrecto se
             * hacía una cascada de errores para todos los campos, cuando si solo se está llenando el formulario, debe quitar los estilos
             * del campo si está vacío, pero si se están enviando datos, ahí es cuando debe mostrar error si el campo obligatorio está vacío)
             */
            async function runValidations(isSubmitting = false) {
                // Limpiar errores
                errors.value.nombre = ''; 
                errors.value.descripcion = ''; 
                errors.value.categoria = ''; 
                errors.value.subcategoria = ''; 
                errors.value.total_clases = '';
                errors.value.estado = '';

                const nombre = newCourse.value.nombre.toString().trim() ?? '';
                const descripcion = newCourse.value.descripcion.toString().trim() ?? '';
                const categoria = newCourse.value.categoria.toString().trim() ?? '';
                const subcategoria = newCourse.value.subcategoria.toString().trim() ?? '';
                const total_clases = newCourse.value.total_clases.toString().trim() ?? '';
                const estado = newCourse.value.estado.toString().trim() ?? '';

                // Bandera para rastrear errores síncronos
                let hasSyncErrors = false; 

                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------
                
                // --- Nombre --- (SIEMPRE REQUERIDA)
                if (nombre.length === 0) {
                    if (isSubmitting) { // Si se está enviando el formulario
                        errors.value.nombre = 'El nombre es obligatorio.';
                        hasSyncErrors = true;
                    }
                } else if (nombre.length < 5) {
                    errors.value.nombre = 'El nombre debe tener mínimo 5 caracteres.';
                    hasSyncErrors = true;
                }else if (nombre.length > 50) {
                    errors.value.nombre = 'El nombre no debe exceder los 50 caracteres.';
                    hasSyncErrors = true;
                }

                // --- Descripción --- (SIEMPRE REQUERIDA)
                if (descripcion.length === 0) {
                    if (isSubmitting) { // Si se está enviando el formulario
                        errors.value.descripcion = 'La descripción es obligatoria.';
                        hasSyncErrors = true;
                    }
                } else if (descripcion.length < 20) {
                    errors.value.descripcion = 'La descripción debe tener mínimo 20 caracteres.';
                    hasSyncErrors = true;
                } else if (descripcion.length > 255) {
                    errors.value.descripcion = 'La descripción no debe exceder los 255 caracteres.';
                    hasSyncErrors = true;
                }

                // --- Categoría --- (SIEMPRE REQUERIDA)
                if (categoria === "") {
                    if (isSubmitting) {
                        errors.value.categoria = 'La selección de una categoría es obligatoria.';
                        hasSyncErrors = true;
                    }
                }

                // --- Sub-Categoría --- (SIEMPRE REQUERIDA)
                if (subcategoria === "") {
                    if (isSubmitting) {
                        errors.value.subcategoria = 'La selección de una sub-categoría es obligatoria.';
                        hasSyncErrors = true;
                    }
                }

      
                // --- Total de clases --- (SIEMPRE REQUERIDA)
                // El patrón /[^0-9]/ busca cualquier carácter que NO sea un número.
                const hasInvalid = /[^0-9]/.test(total_clases); 
                if (total_clases.length === 0) {

                    if (isSubmitting) { // Si se está enviando el formulario
                        errors.value.total_clases = 'La cantidad de clases es obligatoria.';
                        hasSyncErrors = true;
                    }

                } else if(hasInvalid){

                    errors.value.total_clases = 'La cantidad de clases sólo puede tener números.';
                    hasSyncErrors = true;

                }else if (total_clases < 12) {
                    errors.value.total_clases = 'La cantidad de clases no puede ser menor a 12.';
                    hasSyncErrors = true;
                }else if (total_clases > 160) {
                    errors.value.total_clases = 'La cantidad de clases no puede exceder las 160.';
                    hasSyncErrors = true;
                }


                // Si es edición
                if (isEditMode.value) { 

                    if (estado === "") {
                        if (isSubmitting) {
                            errors.value.estado = 'La selección de un estado es obligatorio.';
                        }
                    }
     
                }
            
                // ----------------------------------------------------
                // VALIDACIONES ASÍNCRONAS (Unicidad)
                // ----------------------------------------------------      

            }


           
            // Mandar a realizar las validaciones y si todo es correcto, envía el formulario
            const submitForm = async () => {

                // Se hacen las validaciones
                await runValidations(true); 
                
                if (!isFormValid.value) {

                    error('Formulario no válido', "Deteniendo envío.");

                    return; 
                }

                // Determinar los datos a enviar
                let dataToSend = {};
             
                if (newCourse.value.id) {

                    // MODO EDICIÓN: 
                    dataToSend = {
                        id: newCourse.value.id, 
                        nombre: newCourse.value.nombre,
                        descripcion: newCourse.value.descripcion,
                        categoria: newCourse.value.subcategoria,
                        total_clases: newCourse.value.total_clases,
                        estado: newCourse.value.estado
                    };

                    emit('update-course', dataToSend);
                } else {

                    // MODO CREACIÓN:
                    dataToSend = {
                        nombre: newCourse.value.nombre,
                        descripcion: newCourse.value.descripcion,
                        categoria: newCourse.value.subcategoria,
                        total_clases: newCourse.value.total_clases
                    };

                    console.log(dataToSend)

                    emit('add-course', dataToSend);
                }
            
            };

</script>

<style scoped>

h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.calculated-value {
    font-weight: bold;
    color: #007bff; /* Azul para resaltar el valor calculado */
    margin-top: 5px;
    padding: 10px;
    border: 1px dashed #007bff40;
    background-color: #f0f8ff;
    border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}
.btn-primary, .btn-secondary {
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primary {
    background-color: #d139ff; 
  color: white;
}
.btn-primary:hover {
 background-color: #6A1B9A; 
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-secondary:hover {
  background-color: #5a6268;
}
.suggestions-list {
    list-style: none;
    padding: 0;
    margin-top: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-height: 150px;
    overflow-y: auto;
    background-color: white;
    z-index: 10; /* Asegura que flote sobre otros elementos */
}
.suggestions-list li {
    padding: 8px 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}
.suggestions-list li:hover {
    background-color: #f0f0f0;
}

/*ERRORES */
.error-message {
    display: block;
    color: #dc3545; /* Color rojo de error */
    margin-top: 5px;
    font-size: 0.85em;
    font-weight: 500;
}

.btn-primary:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
}


/* Obligatoriedad */
.asterisc {
  color: rgb(116, 15, 15);
}


/* Estilos para que el modal flote y se vea bien */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Opacidad inicial: 0 (invisible) */
  opacity: 0; 
  /* Pointer-events: none (no clickeable, deja pasar el click) */
  pointer-events: none; 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000; 
  transition: opacity 0.5s ease; /* Transición suave del fondo */

  opacity: 0; /* Inicia invisible */
  pointer-events: none; /* No intercepta clics */
  transition: opacity 0.5s ease; /* Transición para que el fondo se desvanezca */
}

/* CLASE PARA CUANDO EL MODAL ESTÁ ACTIVO */
.modal-overlay.is-open {
  opacity: 1;
  pointer-events: auto; /* Permite que el fondo intercepte los clics (para cerrarlo, por ejemplo) */
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 95%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  opacity: 1;
}

/* Estilos de Botones */
.btn-outline-secondary-custom {
    --bs-btn-color: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #6c757d;
    --bs-btn-hover-border-color: #6c757d;
}


/* ------------------------------------------------ */
/* ESTILOS DE TRANSICIÓN DEL CONTENEDOR (Drop-down) */
/* ------------------------------------------------ */

/* Estado Activo (ENTRADA) */
.modal-drop-enter-active {
    /* Duración de la caída: 0.6s */
    transition: all 0.6s ease-out; 
    
    /* 2. ATRASO EN LA CAÍDA: Espera 0.4s (para que el fondo se oscurezca primero) */
    transition-delay: 0.4s; 
}

/* Estado Activo (SALIDA) */
.modal-drop-leave-active {
    /* Duración de la subida: 0.6s */
    transition: all 0.6s ease-in; 
    
    /* 4. SIN ATRASO: Sube inmediatamente */
    transition-delay: 0s; 
}

/* Estado Inicial (Entrada) / Estado Final (Salida): Posición fuera de pantalla */
.modal-drop-enter-from,
.modal-drop-leave-to {
    transform: translateY(-100vh); 
    opacity: 0; 
}

/* Estado Final (Entrada) / Estado Inicial (Salida): Posición normal */
.modal-drop-enter-to {
    transform: translateY(0); 
    opacity: 1; 
}

/* ------------------------------------------------ */
/* EFECTO DE APARICIÓN SUAVE DEL CONTENIDO (Fade-in/Fade-out) */
/* ------------------------------------------------ */

/* El contenido (h3 y form) tendrá una transición rápida de opacidad */
.modal-content > h3,
.modal-content > form {
    transition: opacity 0.2s ease-out; 
    opacity: 1; /* Estado final */
}

/* OCULTAR EL CONTENIDO EN LOS ESTADOS DE MOVIMIENTO */
.modal-drop-enter-from .modal-content > *,
.modal-drop-leave-to .modal-content > * {
    opacity: 0;
}

/* HACER APARECER EL CONTENIDO (ENTER) */
.modal-drop-enter-active .modal-content > * {
    opacity: 1;
    /* 3. ATRASO LARGO: Aparece después de que el modal terminó de caer (0.4s + 0.6s = 1s) */
    transition-delay: 1.0s; 
}

/* HACER DESAPARECER EL CONTENIDO (LEAVE) */
.modal-drop-leave-active .modal-content > * {
    /* El contenido desaparece inmediatamente (0s delay) antes de que el modal suba */
    transition-delay: 0s; 
    opacity: 0;
}

/* ------------------------------------------------------------------- */
/* MEDIA QUERY: Tamaño para Pantallas Medianas (Mínimo 768px - Tablet/Desktop) */
/* ------------------------------------------------------------------- */
@media (min-width: 768px) {
    .modal-content {
        /* Permite que el modal se extienda más en pantallas grandes */
        width: 80%; /* Ocupa el 80% del ancho de la pantalla */
        max-width: 900px; /* Nuevo ancho máximo para escritorio */
        /* Si quieres un modal aún más grande, usa '1100px' o '1200px' */
    }
}
</style>

