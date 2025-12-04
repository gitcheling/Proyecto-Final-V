<template>

  <div :class="{ 'is-open': isVisible }" class="modal-overlay">

    <Transition name="modal-drop">

        <div v-if="isVisible" class="modal-content">

        <h3 class="mb-4">{{ modalTitle }}</h3>

        <form @submit.prevent="submitForm">

            <div class="row">

                <!-- Se oculta si es modo edición -->
                <div v-if="!newAccount.id" class="form-group col-12 col-lg-6">
                    <label for="parent-search">Buscar Cuenta Padre: <span class="asterisc">*</span></label>
                    <input type="text" 
                        id="parent-search" 
                        v-model="searchTerm" 
                        @input="searchParentAccounts" 
                        placeholder="Escribe código o nombre (ej. 1105)"
                    >

                    <small v-if="isLoading">Cargando...</small>
                    
                    <ul v-if="suggestions.length > 0 && !isLoading" class="suggestions-list">
                        <li v-for="account in suggestions" 
                            :key="account.id" 
                            @click="selectParentAccount(account)">
                            {{ account.codigo }} - {{ account.nombre }}
                        </li>
                    </ul>
            
                    <small v-if="errors.padre" class="error-message">{{ errors.padre }}</small>

                </div>

                <!-- Se oculta si es modo edición -->
                <div v-if="!newAccount.id" class="form-group col-12 col-lg-6">
                    <label for="codigo">Código: <span class="asterisc">*</span></label>
                    <input 
                        type="text" 
                        id="codigo" 
                        v-model="newAccount.codigo"    
                        class="form-control"
                        :class="codeValidationClass"
                    >
                    <small v-if="errors.codigo" class="error-message">{{ errors.codigo }}</small>
                </div>
                
                <div class="form-group col-12 col-lg-6">
                <label for="nombre">Nombre: <span class="asterisc">*</span></label>
                <input 
                        type="text" 
                        id="nombre" 
                        v-model="newAccount.nombre"     
                        class="form-control"
                        :class="nameValidationClass"
                    >
                <small v-if="errors.nombre" class="error-message">{{ errors.nombre }}</small>
                </div>
                
                <!-- Se oculta si es modo edición -->
                <div v-if="!newAccount.id" class="form-group col-12 col-lg-6">
                    <label for="naturaleza">Naturaleza: <span class="asterisc">*</span></label>
                    <select 
                        id="naturaleza" 
                        v-model="newAccount.naturaleza"               
                        class="form-control"
                    >
                        <option value="" disabled selected>Seleccione la Naturaleza</option>
                        <option value="1">Deudora</option>
                        <option value="2">Acreedora</option>
                    </select>
                    <small v-if="errors.naturaleza" class="error-message">{{ errors.naturaleza }}</small>
                </div>

            </div>


            <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

            <div class="modal-actions">
                <button type="submit" class="btn-primary" :disabled="!isFormValid" >
                    {{ newAccount.id ? 'Guardar Cambios' : 'Crear Cuenta' }}
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
            // Ruta base
            const rutaBase = "/PlanCuenta/"

            // Buscar cuentas
            const rutaBuscar = `${rutaBase}Buscar`

            // Crear cuenta
            const rutaComprobar = `${rutaBase}ComprobarCuenta`



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
            const emit = defineEmits(['close', 'add-account', 'update-account']);



      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Cuenta' : 'Crear Nueva Cuenta';
            }); 
            
          

      // ----------------------------------- Formulario ----------------------------------------

          // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
          // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
          const newAccount = ref({
            id: null,
            codigo: '',
            nombre: '', 
            naturaleza: '',
            padreId: null, // El ID del padre a enviar al backend        
            isActive: true,
            
          });


          // Propiedad que indíca si el modal está en modo edición
          const isEditMode = computed(() => !!newAccount.value.id);


          /* Lo que el usuario escribe en el campo de búsqueda. Es la variable que se enlaza directamente al input del 
          formulario (usando v-model). Cuando el usuario escribe, esta variable se actualiza, y ese cambio dispara 
          la función que busca sugerencias. */
          const searchTerm = ref(''); 


          /*  Resultados de la consulta asíncrona (es decir, almacena el array de cuentas que son devueltas por el 
          servicio de datos (el resultado de la búsqueda asíncrona). Este array se utiliza en el template para mostrar
          una lista desplegable debajo del campo de búsqueda. */
          const suggestions = ref([]); 


          /* Indica si estamos esperando la respuesta. Es un booleano que controla el estado de la aplicación. 
          Se cambia a true justo antes de llamar al servicio de búsqueda (asíncrono) y se cambia a false cuando el 
          servicio responde. Se usa para mostrar un indicador visual al usuario (como un spinner o la palabra 
          "Cargando...") mientras espera los resultados de la búsqueda. */
          const isLoading = ref(false); 


          // Variable que va a almacenar la Cuenta Padre que el usuario seleccione en el formulario
          const padreSeleccionado = ref(null);

          // Almacena el texto que representa la cuenta padre *seleccionada*
          const selectedParentText = ref('');
          
          // Indica si el usuario está buscando o ha modificado el campo
          const isSearching = ref(false);

          let searchTimeout = null; // Para manejar el debouncing de la búsqueda


          // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
          const errors = ref({
              codigo: '', /* Inicializa el mensaje de error para el campo "Código" como una cadena vacía. Una cadena vacía significa 
                        "no hay error". Cuando la validación falla, este campo se llena con el mensaje de error (ej: 'El código es obligatorio'). */
              nombre: '', // Inicializa el mensaje de error para el campo "Nombre".
              naturaleza: "",
              padre: '' /* Inicializa el mensaje de error para la lógica de la cuenta padre. Este es crucial para la lógica de subcuentas, 
                        ya que almacena mensajes como: "Una subcuenta debe seleccionar una Cuenta Padre válida." */
          });


          // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
          const isFormValid = computed(() => {
              
                // Se usamos "every" para verificar que todos los valores sean cadenas vacías
                return Object.values(errors.value).every(error => error === '');
          });


        /**
         * Retorna la clase de validación de Bootstrap para el input de Código. (para saber si es válido o no)
         */
        const codeValidationClass = computed(() => {
            const codeLength = newAccount.value.codigo.length;
            
            // Si hay un error de validación, siempre es 'is-invalid'.
            if (errors.value.codigo) {
                return 'is-invalid';
            }
            
            // Si no hay error Y hay texto (es válido), es 'is-valid'.
            if (codeLength > 0) {
                return 'is-valid';
            }
            
            // Si no hay error y está vacío (o no cumple otras condiciones), no se aplica ninguna clase.
            return '';
        });


        const nameValidationClass = computed(() => {
            const nameLength = newAccount.value.nombre.length;
            
            // Si hay un error de validación, siempre es 'is-invalid'.
            if (errors.value.nombre) {
                return 'is-invalid';
            }
            
            // Si no hay error Y hay texto (es válido), es 'is-valid'.
            if (nameLength > 0) {
                return 'is-valid';
            }
            
            // No se aplica ninguna clase.
            return '';
        });
        


  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {
                    // Reinicia los datos principales (newAccount)
                    newAccount.value = {
                        // Usa initialData para pre-cargar en modo Edición, o null/'' en modo Creación
                        id: initialData?.id || null,
                        codigo: initialData?.codigo || '',
                        nombre: initialData?.nombre || '', 
                        naturaleza: initialData?.naturaleza || '', // Si no hay datos, es ''
                        padreId: initialData?.padreId || null,                  
                        isActive: initialData?.isActive ?? true,
                        
                    };
                
                    // Reinicia los estados de búsqueda y padre
                    suggestions.value = [];
                    padreSeleccionado.value = null;
                    isSearching.value = false;

                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);

                    // Se configura el campo de búsqueda para el modo Edición
                    if (initialData && initialData.padre && initialData.padre.id) {
                        // Se inicializa "padreSeleccionado" con los datos necesarios 
                        
                        const padre = initialData.padre;

                        searchTerm.value = `${padre.codigo} - ${padre.nombre}`;

                        padreSeleccionado.value = { id: padre.id, codigo: padre.codigo, nombre: padre.nombre };


                    } else {
                        // Modo Creación (o cuenta base sin padre)
                        searchTerm.value = '';
                        selectedParentText.value = '';
                    }

                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.codigo = ''; 
                    errors.value.nombre = ''; 
                    errors.value.naturaleza = ''; 
                    errors.value.padre = '';
            };


        // ----------------------------------- Watcher (Apertura/Cierre del Modal) ----------------------------------------


            // Vigila cuando el modal se hace visible (se abre) y manda a reiniciar todos los campos
            watch(() => props.isVisible, (newVal) => {

                // Si el modal se está abriendo (newVal es true)
                if (newVal) {
                    // En modo "abrir", se inicializa todo (incluyendo el padre si existe)
                    resetFormState(props.initialData); 
                } else {
                    // En modo "cerrar", se limpia todo.
                    resetFormState(null);
                }
            }, { immediate: true });



        // ----------------------------------- Funciones del Formulario ----------------------------------------

            function searchParentAccounts() {
                
                // Limpiar el timeout anterior para evitar llamadas excesivas
                clearTimeout(searchTimeout);
                suggestions.value = []; // Limpiar resultados anteriores

                // Limpia el estado de carga y el padre si el input está vacío
                isLoading.value = false;
                
                const query = searchTerm.value.trim(); 

                // Si la caja de búsqueda está vacía, se deselecciona el padre y salimos.
                if (query.length < 1) {
                    newAccount.value.padreId = null;
                    padreSeleccionado.value = null; // Quitar la selección del padre
                    return;
                }

                isLoading.value = true; // Activar el indicador de carga

                // Establecer un nuevo timeout (Debouncing: 300ms)
                searchTimeout = setTimeout(async () => {
                    
                    let params = {};
                    
                    // Regex para verificar si SOLO contiene números
                    const isOnlyNumber = /^\d+$/.test(query);

                    // Regex para verificar si SOLO contiene letras, espacios y acentos
                    const isOnlyLettersSpaces = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/.test(query);

                    if (isOnlyNumber) {
                        params.codigo = query;
                        params.estado = true;
                    } else if (isOnlyLettersSpaces) {
                        params.nombre = query;
                        params.estado = true;
                    } else {
                        // Alfanumérico o Símbolos: Bloquea la búsqueda y muestra la lista vacía
                        isLoading.value = false;
                        suggestions.value = [];
                        return; 
                    }

                    try {
                        // Se realiza una solicitud GET al endpoint /Cuentas/Buscar 
                        const response = await api.get(rutaBuscar, { params });
                        suggestions.value = response.data.data; 

                    } catch (err) {
                        error('Error al buscar cuentas padre', err);
                        suggestions.value = [];
                    } finally {
                        isLoading.value = false;
                    }
                }, 300); // Retraso de 300ms
            }



            function selectParentAccount(account) {
                // Asignar el ID de la cuenta seleccionada al objeto principal del formulario
                newAccount.value.padreId = account.id;

                // Guardar el objeto completo del padre seleccionado para la UI
                padreSeleccionado.value = account;

                // Se le asigna al input del código el que tiene la cuenta padre seleccionada
                newAccount.value.codigo = account.codigo.toString();
                
                // Lo que se imprime en el input de selección (el código de la cuenta padre y su nombre)
                searchTerm.value = `${account.codigo} - ${account.nombre}`;

                // Limpiar la lista de sugerencias para ocultar el menú desplegable
                suggestions.value = [];
            }


            // Monitorear los campos clave para validar en tiempo real
            watch([
                () => newAccount.value.codigo, 
                () => newAccount.value.nombre,
                () => newAccount.value.naturaleza,
                padreSeleccionado 
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
                errors.value.codigo = ''; 
                errors.value.nombre = ''; 
                errors.value.naturaleza = '';
                errors.value.padre = '';
                
                
                const codigo = newAccount.value.codigo?.toString() ?? '';
                const nombre = newAccount.value.nombre.toString() ?? '';
                const naturaleza = newAccount.value.naturaleza ?? '';
                const padre = padreSeleccionado.value;

                // Bandera para rastrear errores síncronos
                let hasSyncErrors = false; 

                // Banderas para detectar errores en los del nombre y el apellido (no es necesario en los demás)
                let nombreHasError = false; 


                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------
                
                // --- Nombre --- (SIEMPRE REQUERIDA)
                if (nombre.length === 0) {
                    if (isSubmitting) { // Si se está enviando el formulario
                        errors.value.nombre = 'El nombre es obligatorio.';
                        hasSyncErrors = true;
                        nombreHasError = true; // Establece la bandera local
                    }
                } else if (nombre.length > 30) {
                    errors.value.nombre = 'El nombre no debe exceder los 30 caracteres.';
                    hasSyncErrors = true;
                    nombreHasError = true; // Establece la bandera local
                }

                // Si no hay un error asignado ya
                if (!nombreHasError && nombre.length > 0) { 

                    // Otro if-else individual ya que antes se tenían uno después de otro y se superponían
                    if (/\d/.test(nombre)) {
                        errors.value.nombre = 'El nombre no puede contener números.';
                        hasSyncErrors = true;
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s/\-_]+$/.test(nombre)) {
                        errors.value.nombre = 'El nombre de la cuenta debe contener solo texto, espacios, barra inclinada o guión.';
                        hasSyncErrors = true;
                    }
                }

            
                
                // Validación de Código, Padre y naturaleza (SOLO EN MODO CREACIÓN)
                if (!isEditMode.value) { 
                    
                    // Validación del código
                    if (codigo.length === 0) {
                        errors.value.codigo = 'El código es obligatorio.';
                        hasSyncErrors = true;
                    } else if (!/^\d*$/.test(codigo)) {
                        errors.value.codigo = 'El código solo debe contener números.';
                        hasSyncErrors = true;
                    } else if (codigo.length < 2) {
                        errors.value.codigo = 'El código debe ser de al menos 2 dígitos.';
                        hasSyncErrors = true;
                    } else if (codigo.length > 8) {
                        errors.value.codigo = 'El código no debe exceder los 8 dígitos.';
                        hasSyncErrors = true;
                    }

                    // Validación de Cuenta Padre
                    const padreId = newAccount.value.padreId;

                    if (codigo.length >= 0 && !padreId && isSubmitting) {
                        errors.value.padre = 'La selección de una cuenta padre es obligatoria.';
                        hasSyncErrors = true;
                    }
                    
                    // Validación de Consistencia (Código Hijo vs. Código Padre)
                    if (padre && padre.codigo.length > 0 && codigo.length > 0 && !errors.value.codigo) {
                        const codigoDelPadre = padre.codigo.toString();

                        if (!codigo.startsWith(codigoDelPadre)) {
                            errors.value.codigo = `El código debe comenzar con el código del padre: ${codigoDelPadre}`;
                            hasSyncErrors = true;
                        } else if (codigo.length <= codigoDelPadre.length) {
                            errors.value.codigo = 'El código de la subcuenta debe ser más largo que el del padre.';
                            hasSyncErrors = true;
                        } 
                    }

                    // Validación de la naturaleza
                    if (naturaleza === "") {
                        if (isSubmitting) {
                            errors.value.naturaleza = 'La selección de una Naturaleza es obligatoria.';
                            hasSyncErrors = true;
                        }
                    // Se compara como string porque fue convertido arriba con .toString()
                    } else if(!['1', '2'].includes(naturaleza)) {
                        errors.value.naturaleza = 'Debe seleccionar una naturaleza válida';
                        hasSyncErrors = true;
                    }

                }


                // ----------------------------------------------------
                // VALIDACIONES ASÍNCRONAS (Unicidad)
                // ----------------------------------------------------

                // SOLO si las validaciones síncronas de longitud han pasado y se está enviando el formulario, se hace la petición:             
                if (!hasSyncErrors && isSubmitting) {

                    // Si es modo creación
                    if(!isEditMode.value){

                        // Se comprueba SOLO si los campos relevantes no tienen ya un error síncrono
                        const shouldCheck = !errors.value.codigo && !errors.value.nombre;

                        if(shouldCheck){
                            const { existeCodigo, existeNombre } = await comprobarCuenta(
                                codigo, 
                                nombre, 
                                null // No se pasa ID
                            );
                            
                            if (existeCodigo) {
                                errors.value.codigo = 'Ya existe una cuenta con este código.';
                            }
                            
                            if (existeNombre) {
                                errors.value.nombre = 'Ya existe una cuenta con este nombre.';
                            }
                        }
                        

                    }else{ // Modo edición

                        // Se comprueba SOLO si los campos relevantes no tienen ya un error síncrono
                        const shouldCheck = !errors.value.nombre;

                        if(shouldCheck){
                            const {existeNombre } = await comprobarCuenta(
                                null, // No se pasa código
                                nombre, 
                                newAccount.value.id // Se pasa el ID para excluir la cuenta actual en edición
                            );              
                            
                            if (existeNombre) {
                                errors.value.nombre = 'Ya existe una cuenta con este nombre.';
                            }
                        }

                    }
                   
                }


            }


            /**
             * Llama al backend para verificar si el código o nombre de la cuenta ya existen.
             * @returns {Object} { isCodeUnique: Boolean, isNameUnique: Boolean }
             */
            async function comprobarCuenta(codigo = "", nombre, id = "") {
                
                if (!codigo && !nombre) {
                    return { existeCodigo: false, existeNombre: false };
                }
                
                // Este endpoint debe recibir el código, el nombre y la ID (para excluirse en edición)
                try {
                    const response = await api.post(rutaComprobar, {
     
                        codigo: codigo,
                        nombre: nombre,
                        idExcluido: id 
                        
                    });
                    
                    // El backend retorna un objeto { existeCodigo: boolean, existeNombre: boolean }
                    return { 
                        existeCodigo: response.data.existeCodigo, 
                        existeNombre: response.data.existeNombre 
                    };
                } catch (err) {
                    error('Error al verificar la existencia de la cuenta', err);      
                    // En caso de error de servidor, asumimos que es único para no bloquear, pero es riesgoso. 
                    // Idealmente, se debe mostrar un error de conexión.
                    return { existeCodigo: false, existeNombre: false }; 
                }
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

                if (newAccount.value.id) {
                    // MODO EDICIÓN: Solo enviamos el ID y el campo a actualizar (nombre)
                    dataToSend = {
                        id: newAccount.value.id, 
                        nombre: newAccount.value.nombre,
                        // No enviamos código, naturaleza, ni padreId
                    };

                    emit('update-account', dataToSend);
                } else {
                    // MODO CREACIÓN: Enviamos todos los campos requeridos
                    dataToSend = {
                        codigo: newAccount.value.codigo,
                        nombre: newAccount.value.nombre,
                        naturaleza: newAccount.value.naturaleza,
                        cuenta_padre: newAccount.value.padreId,
                    };
                    emit('add-account', dataToSend);
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
  background-color: rgba(0, 0, 0, 0.6); 
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