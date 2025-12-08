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
                            v-model="newPeriod.nombre"     
                            class="form-control"
                            :class="nameValidationClass"
                        >
                    <small v-if="errors.nombre" class="error-message">{{ errors.nombre }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="date-start">Fecha de Inicio: <span class="asterisc">*</span></label>
                    
                    <input 
                        type="date"
                        id="date-start"
                        v-model="newPeriod.inicio"
                        class="form-control"
                        :disabled="isPeriodInProgress"
                    />

                    <small v-if="isPeriodInProgress" class="text-secundary">La fecha de inicio no se puede modificar si el periodo está en curso.</small>
                    <small v-if="errors.inicio" class="error-message">{{ errors.inicio }}</small>
                </div>

                <div class="form-group col-12 col-lg-6">
                    <label for="date-end">Fecha de Fin: <span class="asterisc">*</span></label>
                    
                    <input 
                        type="date"
                        id="date-end"
                        v-model="newPeriod.fin"
                        class="form-control"
                        :min="minDateFinStr"
                        :max="maxDateFinStr"
                    />

                    <small v-if="errors.fin" class="error-message">{{ errors.fin }}</small>
                    <small v-else-if="errorSecuencia" class="error-message">{{ errorSecuencia }}</small>
                    <small v-else-if="errorRango" class="error-message">{{ errorRango }}</small>
                    <small v-else-if="newPeriod.inicio && newPeriod.fin" class="text-success">
                        Rango Correcto. Duración: {{ calculatedDuration }} meses ({{ calculatedDurationDays }} días).
                    </small>
                </div>
 

            </div>


            <p>Los campos con <span class="asterisc">*</span> son obligatorios</p>

            <div class="modal-actions">
                <button type="submit" class="btn-primary" :disabled="!isFormValid" >
                    {{ newPeriod.id ? 'Guardar Cambios' : 'Crear Periodo' }}
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

    import dayjs from 'dayjs';
    // Se necesita el plugin de diferencia avanzada para meses/años con precisión
    import duration from 'dayjs/plugin/duration';
    import isBetween from 'dayjs/plugin/isBetween';
    dayjs.extend(duration);
    dayjs.extend(isBetween);
  

  // ----------------------------------- Variables ----------------------------------------

        // Rutas
            // Ruta base
            const rutaBase = "/Periodo/"

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
            const emit = defineEmits(['close', 'add-period', 'update-period']);
            


      // ----------------------------------- Modal ----------------------------------------

            // Propiedad computada para el título del modal (es decir, la función se ejecutará cada vez que cambie "props.initialData")
            const modalTitle = computed(() => {
                // Si props.initialData tiene un 'id' (es decir, no es null/undefined y tiene un id), es true.
                const hasId = !!props.initialData?.id; 
                
                return hasId ? 'Editar Periodo' : 'Crear Nuevo Periodo';
            }); 
            
          

      // ----------------------------------- Formulario ----------------------------------------


            // Almacena los datos del formulario, y se le asignan valores por defecto para cuando se abra el modal
            // Nota: Es reactivo, por lo que Vue estará pendiente de cuando haya un cambio en alguna de sus propiedades
            const newPeriod = ref({
            id: null,
            nombre: '', 
            inicio: '',
            fin: ''    
            });


            // Propiedad que indíca si el modal está en modo edición
            const isEditMode = computed(() => !!newPeriod.value.id);

            // Determina si el periodo está actualmente en curso (ya empezó hoy o antes)
            const isPeriodInProgress = computed(() => {
                // Solo aplica a periodos existentes
                if (!newPeriod.value.id) return false;

                const start = dayjs(newPeriod.value.inicio);
                const today = dayjs().startOf('day');

                // Está "en curso" si la fecha de inicio es válida y es hoy o anterior a hoy.
                return start.isValid() && start.isSameOrBefore(today, 'day');
            });


            let searchTimeout = null; // Para manejar el debouncing de la búsqueda


            // Objeto reactivo para almacenar todos los posibles errores del formulario del modal
            const errors = ref({
                nombre: '', 
                inicio: "",
                fin: ''
            });

            const errorRango = ref('');
            const errorSecuencia = ref('');


            // Sirve para comprobar si la variable "errors" está vacía (el formulario está correcto) o tiene texto (el formulario tiene errores)
            const isFormValid = computed(() => {
                // Todos los errores de 'errors' deben ser cadenas vacías.
                const syncErrorsValid = Object.values(errors.value).every(error => error === '');
                
                // Las fechas deben existir Y no deben tener errores de secuencia ni de rango.
                const datesExist = !!newPeriod.value.inicio && !!newPeriod.value.fin;
                const dateRangeValid = !errorSecuencia.value && !errorRango.value;
                
                return syncErrorsValid && datesExist && dateRangeValid;
            });


            const nameValidationClass = computed(() => {
                const nameLength = newPeriod.value.nombre.length;
                
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


            // ------------------------------------
            // MANEJO DE FORMATO DE FECHAS
            // ------------------------------------

            /**
             * [COMPUTED] Define la fecha mínima seleccionable para la FECHA DE FIN (para el atributo 'min' del input).
             * Se fuerza a que sea la fecha de inicio o posterior.
             */
            const minDateFinStr = computed(() => {
                // Devuelve la cadena 'YYYY-MM-DD' o cadena vacía si no hay fecha de inicio
                return newPeriod.value.inicio || ''; 
            });


            /**
             * [COMPUTED] Define la fecha máxima seleccionable para la FECHA DE FIN (para el atributo 'max' del input).
             * Se fuerza a que sea 8 meses después de la fecha de inicio.
             */
            const maxDateFinStr = computed(() => {
                const startStr = newPeriod.value.inicio;
                if (!startStr) return ''; 

                try {
                    const startDate = dayjs(startStr);
                    if (!startDate.isValid()) return '';

                    // Suma 8 meses y formatea a 'YYYY-MM-DD' para el atributo max
                    return startDate.add(8, 'month').format('YYYY-MM-DD'); 
                } catch (e) {
                    return '';
                }
            });


            /**
             * [COMPUTED] Calcula la duración en meses decimales.
             */
            const calculatedDuration = computed(() => {
                const start = newPeriod.value.inicio;
                const end = newPeriod.value.fin;

                if (!start || !end) return 0;

                const startDate = dayjs(start);
                const endDate = dayjs(end);

                if (!startDate.isValid() || !endDate.isValid() || endDate.isBefore(startDate)) return 0;
                
                // Retorna la diferencia en meses con un decimal
                return endDate.diff(startDate, 'month', true).toFixed(1);
            });

            /**
             * [NUEVO COMPUTED] Calcula la duración en días enteros.
             */
            const calculatedDurationDays = computed(() => {
                const start = newPeriod.value.inicio;
                const end = newPeriod.value.fin;

                if (!start || !end) return 0;

                const startDate = dayjs(start);
                const endDate = dayjs(end);

                if (!startDate.isValid() || !endDate.isValid() || endDate.isBefore(startDate)) return 0;

                // Retorna la diferencia en días
                // Se suma 1 día porque Day.js diff(..., 'day') entre '2025-01-01' y '2025-01-01' es 0, pero es 1 día de duración.
                return endDate.diff(startDate, 'day') + 1; 
            }); 



  // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- Lógica de Estado y Reinicio ----------------------------------------
  
            // Reinicia todos los campos del formulario
            const resetFormState = (initialData = null) => {
                    // Reinicia los datos principales (newPeriod)
                    newPeriod.value = {
                        // Usa initialData para pre-cargar en modo Edición, o null/'' en modo Creación
                        id: initialData?.id || null,          
                        nombre: initialData?.nombre || '', 
                        inicio: initialData?.inicio || '', 
                        fin: initialData?.fin || '', 
                        
                    };
                

                    // Limpiar el temporizador de debouncing por si acaso
                    clearTimeout(searchTimeout);


                    // Reinicia todos los errores (para que los inputs no se vean rojos al abrir)
                    errors.value.nombre = ''; 
                    errors.value.inicio = ''; 
                    errors.value.fin = '';
                    errorRango.value = '';
                    errorSecuencia.value = '';

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

            // Monitorear los campos clave para validar en tiempo real
            watch([
                () => newPeriod.value.nombre, 
                () => newPeriod.value.inicio,
                () => newPeriod.value.fin
            ], async () => {
                await runValidations(); 
            });


            /**
             * Función de Validación ESPECÍFICA de Rangos de Fechas usando Day.js.
             */
            async function runDateValidations(isSubmitting = false) {
                errorRango.value = '';
                errorSecuencia.value = '';

                const startStr = newPeriod.value.inicio;
                const endStr = newPeriod.value.fin;

                // Obtenemos la fecha de hoy al inicio del día (medianoche)
                // Esto asegura que podemos seleccionar fechas que sean HOY, si el requisito es 'mayor o igual a hoy',
                // o mañana, si el requisito es 'estrictamente mayor a hoy'. Usaremos estrictamente mayor.
                const today = dayjs().startOf('day');

                // Bandera para rastrear si hay errores de fecha individuales (formato o pasado)
                let hasDateErrors = false; 

                // Solo se ignora la validación del pasado para la fecha de INICIO si estamos EDITANDO.
                const isPastDateValidationRequiredForStart = !isEditMode.value;

                // ----------------------------------------------------
                // VALIDACIÓN FECHA DE INICIO (Obligatoriedad y Pasado)
                // ----------------------------------------------------
                if (!startStr) {
                    errors.value.inicio = isSubmitting ? 'La fecha de inicio es obligatoria.' : '';
                    hasDateErrors = !!errors.value.inicio; // Marca error si es obligatorio al enviar
                } else {
                    errors.value.inicio = ''; 
                    const start = dayjs(startStr);

                    if (!start.isValid()) {
                        errors.value.inicio = 'Formato de fecha de inicio inválido.';
                        hasDateErrors = true;
                    } 
                    // Se ignora esta validación solo si estamos editando (permitiendo Inicio en el pasado).
                    else if (isPastDateValidationRequiredForStart && (start.isBefore(today, 'day') || start.isSame(today, 'day'))) {
                        errors.value.inicio = 'La fecha de inicio debe ser posterior a hoy.';
                        hasDateErrors = true;
                    }
                }


                // ----------------------------------------------------
                // VALIDACIÓN FECHA DE FIN (Obligatoriedad y Pasado)
                // ----------------------------------------------------
                if (!endStr) {
                    errors.value.fin = isSubmitting ? 'La fecha de finalización es obligatoria.' : '';
                    if (!hasDateErrors) hasDateErrors = !!errors.value.fin; // Marca error si es obligatorio al enviar
                } else {
                    errors.value.fin = '';
                    const end = dayjs(endStr);
                    
                    if (!end.isValid()) {
                        errors.value.fin = 'Formato de fecha de finalización inválido.';
                        hasDateErrors = true;
                    } 
                    // Solo si el formato es válido, verificamos si es posterior a hoy
                    else if (end.isBefore(today, 'day') || end.isSame(today, 'day')) {
                        errors.value.fin = 'La fecha de finalización debe ser posterior a hoy.';
                        hasDateErrors = true;
                    }

                    
                }

                // Si ya detectamos un error de fecha (falta, formato inválido o está en el pasado), y que ambas fechas tienen contenido antes de calcular.
                if (hasDateErrors || !startStr || !endStr) {
                    return; 
                }


                // ----------------------------------------------------
                // VALIDACIÓN DE SECUENCIA Y RANGO (Requiere ambas válidas)
                // ----------------------------------------------------

        
                const start = dayjs(startStr);
                const end = dayjs(endStr);
                

                // 2. Validación de Secuencia (Inicio > Fin)
                // Usamos .isBefore(..., 'day') para comparar solo las fechas (sin hora)
                if (end.isBefore(start, 'day')) { 
                    errorSecuencia.value = 'La fecha de finalización debe ser posterior o igual a la fecha de inicio.';
                    return; 
                }

                // 3. Validación de Rango (3 a 8 meses)
                const diffInMonths = end.diff(start, 'month', true);

                // Calcular la duración en días (diferencia directa)
                const diffInDays = end.diff(start, 'day');

                if (diffInMonths < 2.9) { 
                    errorRango.value = `El rango debe ser de al menos 3 meses. Actual: ${diffInMonths.toFixed(1)} meses (${diffInDays} días).`;
                } else if (diffInMonths > 8.1) { 
                    errorRango.value = `El rango no debe exceder los 8 meses. Actual: ${diffInMonths.toFixed(1)} meses (${diffInDays} días).`;
                }
            }


            /**
             * Función de Validación del formulario.
             * @param {boolean} isSubmitting - Indica si el formulario se está enviando (esto es porque si un campo salia incorrecto se
             * hacía una cascada de errores para todos los campos, cuando si solo se está llenando el formulario, debe quitar los estilos
             * del campo si está vacío, pero si se están enviando datos, ahí es cuando debe mostrar error si el campo obligatorio está vacío)
             */
            async function runValidations(isSubmitting = false) {
                // Limpiar errores
                errors.value.nombre = ''; 
                errors.value.inicio = '';
                errors.value.fin = '';
                
            
                const nombre = newPeriod.value.nombre.toString() ?? '';
                const inicio = newPeriod.value.inicio ?? '';
                const fin = newPeriod.value.fin ?? '';

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
                } else if (nombre.length > 20) {
                    errors.value.nombre = 'El nombre no debe exceder los 20 caracteres.';
                    hasSyncErrors = true;
                    nombreHasError = true; // Establece la bandera local
                }

                // Validación de Fechas
                await runDateValidations(isSubmitting);
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

                if (newPeriod.value.id) {
                    // MODO EDICIÓN
                    dataToSend = {
                        id: newPeriod.value.id, 
                        nombre: newPeriod.value.nombre,
                        inicio: newPeriod.value.inicio,
                        fin: newPeriod.value.fin,      
                    };

                    emit('update-period', dataToSend);
                } else {
                    // MODO CREACIÓN
                    dataToSend = {
                        nombre: newPeriod.value.nombre,
                        inicio: newPeriod.value.inicio,
                        fin: newPeriod.value.fin,
                    };

                    console.log("fecha de inicio: ", newPeriod.value.inicio);
                    console.log("fecha de fin: ", newPeriod.value.fin);
                    emit('add-period', dataToSend);
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