<template>

  <div v-if="isVisible" class="modal-overlay">

    <div class="modal-content">

      <h3>{{ modalTitle }}</h3>

      <form @submit.prevent="submitForm">

        <!-- Se oculta si es modo edición -->
        <div v-if="!newAccount.id" class="form-group">
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
        <div v-if="!newAccount.id" class="form-group">
            <label for="codigo">Código: <span class="asterisc">*</span></label>
            <input 
                type="text" 
                id="codigo" 
                v-model="newAccount.codigo" 
                required
                class="form-control"
                :class="codeValidationClass"
            >
            <small v-if="errors.codigo" class="error-message">{{ errors.codigo }}</small>
        </div>
        
        <div class="form-group">
          <label for="nombre">Nombre: <span class="asterisc">*</span></label>
          <input 
                type="text" 
                id="nombre" 
                v-model="newAccount.nombre" 
                required 
                class="form-control"
                :class="nameValidationClass"
            >
          <small v-if="errors.nombre" class="error-message">{{ errors.nombre }}</small>
        </div>
        
        <!-- Se oculta si es modo edición -->
        <div v-if="!newAccount.id" class="form-group">
            <label for="naturaleza">Naturaleza: <span class="asterisc">*</span></label>
            <select 
                id="naturaleza" 
                v-model="newAccount.naturaleza" 
                required 
                class="form-control"
            >
                <option value="" disabled selected>Seleccione la Naturaleza</option>
                <option value="1">Deudora</option>
                <option value="2">Acreedora</option>
            </select>
            <small v-if="errors.naturaleza" class="error-message">{{ errors.naturaleza }}</small>
        </div>


        <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

        <div class="modal-actions">
          <button type="submit" class="btn-primary" :disabled="!isFormValid" >
            {{ newAccount.id ? 'Guardar Cambios' : 'Crear Cuenta' }}
          </button>
          
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancelar</button>
        </div>

      </form>

      
    </div>
  </div>
</template>

<script setup>

  // ----------------------------------- Importaciones ----------------------------------------
  import { ref, computed, defineProps, defineEmits, watch } from 'vue';
 
  import api from '../../services/api'; 

  // ----------------------------------- Variables ----------------------------------------


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
                return props.initialData ? 'Editar Tipo de Cuenta' : 'Crear Nuevo Tipo de Cuenta';
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
                    } else if (isOnlyLettersSpaces) {
                        params.nombre = query;
                    } else {
                        // Alfanumérico o Símbolos: Bloquea la búsqueda y muestra la lista vacía
                        isLoading.value = false;
                        suggestions.value = [];
                        return; 
                    }

                    try {
                        // Se realiza una solicitud GET al endpoint /Cuentas/Buscar 
                        const response = await api.get('/Cuentas/Buscar', { params });
                        suggestions.value = response.data.data; 

                    } catch (error) {
                        console.error("Error fetching parent accounts:", error);
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
             */
            async function runValidations() {
                // Limpiar errores
                errors.value.codigo = ''; 
                errors.value.nombre = ''; 
                errors.value.naturaleza = '';
                errors.value.parent = '';
                
                
                const codigo = newAccount.value.codigo?.toString() ?? '';
                const nombre = newAccount.value.nombre ?? '';
                const naturaleza = newAccount.value.naturaleza ?? '';
                const padre = padreSeleccionado.value;


                // ----------------------------------------------------
                // VALIDACIONES SÍNCRONAS (Longitud, formato, etc.)
                // ----------------------------------------------------
                
                // Validación de Nombre (SIEMPRE REQUERIDA)
                if (nombre.length === 0) {
                    errors.value.nombre = 'El nombre de la cuenta es obligatorio.';
                    return;
                } else if (nombre.length > 30) {
                    errors.value.nombre = 'El nombre no debe exceder los 30 caracteres.';
                }
                
                // Validación de Código, Padre y naturaleza (SOLO EN MODO CREACIÓN)
                if (!isEditMode.value) { 
                    
                    // Validación del código
                    if (codigo.length === 0) {
                        errors.value.codigo = 'El código es obligatorio.';
                    } else if (!/^\d*$/.test(codigo)) {
                        errors.value.codigo = 'El código solo debe contener números.';
                    } else if (codigo.length < 2) {
                        errors.value.codigo = 'El código debe ser de al menos 2 dígitos.';
                    } else if (codigo.length > 8) {
                        errors.value.codigo = 'El código no debe exceder los 8 dígitos.';
                    }

                    // Validación de Cuenta Padre
                    const padreId = newAccount.value.padreId;

                    if (codigo.length >= 2 && !padreId) {
                        errors.value.parent = 'La selección de una Cuenta Padre es obligatoria.';
                    }
                    
                    // Validación de Consistencia (Código Hijo vs. Código Padre)
                    if (padre && padre.codigo.length > 0 && codigo.length > 0 && !errors.value.codigo) {
                        const codigoDelPadre = padre.codigo.toString();

                        if (!codigo.startsWith(codigoDelPadre)) {
                            errors.value.codigo = `El código debe comenzar con el código del padre: ${codigoDelPadre}`;
                        } else if (codigo.length <= codigoDelPadre.length) {
                            errors.value.codigo = 'El código de la subcuenta debe ser más largo que el del padre.';
                        } 
                    }

                    // Validación de la naturaleza
                    if (naturaleza === "") {
                        errors.value.naturaleza = 'La selección de una Naturaleza es obligatoria.';
                    }else if(naturaleza != 1 && naturaleza != 2) {
                        errors.value.naturaleza = 'Debe seleccionar una naturaleza válida';
                    }
                }


                // ----------------------------------------------------
                // VALIDACIONES ASÍNCRONAS (Unicidad)
                // ----------------------------------------------------

                // SOLO si las validaciones síncronas de longitud han pasado, se hace la petición:             
                if ((!errors.value.codigo && !errors.value.nombre) && (codigo.length > 0 || nombre.length > 0)) {
                    
                    const { isCodeUnique, isNameUnique } = await comprobarCuenta(
                        codigo, 
                        nombre, 
                        newAccount.value.id // Se pasa el ID para excluir la cuenta actual en edición
                    );
                    
                    if (!isCodeUnique) {
                        errors.value.codigo = 'Ya existe una cuenta con este código.';
                    }
                    
                    if (!isNameUnique) {
                        errors.value.nombre = 'Ya existe una cuenta con este nombre.';
                    }
                }


            }


            /**
             * Llama al backend para verificar si el código o nombre de la cuenta ya existen.
             * @returns {Object} { isCodeUnique: Boolean, isNameUnique: Boolean }
             */
            async function comprobarCuenta(codigo, nombre, id) {
                if (!codigo && !nombre) {
                    return { isCodeUnique: true, isNameUnique: true };
                }
                
                // Este endpoint debe recibir el código, el nombre y la ID (para excluirse en edición)
                try {
                    const response = await api.post('/Cuentas/comprobarCuenta', {
                        params: {
                            codigo: codigo,
                            nombre: nombre,
                            idExcluido: id 
                        }
                    });
                    
                    // El backend retorna un objeto { existeCodigo: boolean, existeNombre: boolean }
                    return { 
                        isCodeUnique: !response.data.existeCodigo, 
                        isNameUnique: !response.data.existeNombre 
                    };
                } catch (error) {
                    console.error("Error al verificar unicidad:", error);
                    // En caso de error de servidor, asumimos que es único para no bloquear, pero es riesgoso. 
                    // Idealmente, se debe mostrar un error de conexión.
                    return { isCodeUnique: true, isNameUnique: true }; 
                }
            }


           
            // Mandar a realizar las validaciones y si todo es correcto, envía el formulario
            const submitForm = async () => {

                // Se hacen las validaciones
                await runValidations(); 
                
                if (!isFormValid.value) {
                    console.error("Formulario no válido. Deteniendo envío.");
                    return; 
                }


                // Determinar los datos a enviar
                let dataToSend = {};

                if (newAccount.value.id) {
                    // MODO EDICIÓN: Solo enviamos el ID y el campo a actualizar (nombre)
                    dataToSend = {
                        id: newAccount.value.id, // <-- ¡CLAVE AGREGADA!
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
  
                emit('close');
            
            };

</script>

<style scoped>
/* Estilos para que el modal flote y se vea bien */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Fondo semi-transparente oscuro */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Asegura que esté por encima de todo */
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
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
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #0056b3;
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
</style>