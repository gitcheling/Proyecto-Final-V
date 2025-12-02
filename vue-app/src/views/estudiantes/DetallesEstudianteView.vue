<template>
    <div class="student-details-page container mt-5">
        
        <router-link :to="{ name: 'GestionEstudiantes' }" class="btn mb-4 back-button btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Volver a la Lista de Estudiantes
        </router-link>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary-custom" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Cargando datos del estudiante...</p>
        </div>

        <div v-else-if="student">
            
            <div class="header-card mb-4 p-4 shadow-lg rounded-3">
                
                <div class="header-content-wrapper p-3 rounded-2">
                    
                    <div class="row align-items-center">
                        <div class="col-9"> 
                            <h1 class="display-6 page-title-light"> <i class="bi bi-person-circle me-3"></i> 
                                Ficha de Estudiante: {{ student.entidad.nombre }} {{ student.entidad.apellido }}
                            </h1>
                            <p class="lead mb-0 text-dark">Código Estudiantil: {{ student.codigo_estudiantil }}</p>
                        </div>
                        
                        <div class="col-3 text-end">
                            <button @click="openEditModal" class="btn btn-edit-student" title="Editar Estado y Datos del Estudiante">
                                <i class="bi bi-pencil-square me-2"></i> Editar Estudiante
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                
                <div class="col-lg-5 mb-4">
                    <div class="card h-100 shadow-sm data-card">
                        <div class="card-header data-header">
                            <h3 class="h5 mb-0"><i class="bi bi-info-circle me-2"></i> Datos Generales del Estudiante</h3>
                        </div>
                        <div class="card-body">
                            <dl class="row detail-list">
                                <dt class="col-sm-5">Identificación:</dt>
                                <dd class="col-sm-7">{{ student.entidad.prefijo.letra_prefijo }} - {{ student.entidad.numero_identificacion }}</dd>

                                <dt class="col-sm-5">Estado Actual:</dt>
                                <dd class="col-sm-7">
                                    <span :class="['badge', getStatusBadge(student.estado.nombre)]">{{ student.estado.nombre }}</span>
                                </dd>

                                <dt class="col-sm-5">¿Puede Inscribirse en Nuevos Cursos?:</dt>
                                <dd class="col-sm-7">{{ student.estado.puede_inscribirse == true ? 'Sí' : 'No' }}</dd>
                                
                                <dt class="col-sm-5">Fecha de Registro como Estudiante:</dt>
                                <dd class="col-sm-7">{{ formatDateTime(student.fechaCreacion) }}</dd>
                                
                                <dt class="col-sm-5">Última Modificación:</dt>
                                <dd class="col-sm-7">{{ formatDateTime(student.fechaActualizacion) }}</dd>

                                <dt class="col-sm-5">Teléfono:</dt>
                                <dd class="col-sm-7">{{ student.entidad.telefono || 'No registrado' }}</dd>
                                
                                <dt class="col-sm-5">Correo:</dt>
                                <dd class="col-sm-7">{{ student.entidad.email || 'No registrado' }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div class="col-lg-7 mb-4">
                    <div class="card h-100 shadow-sm data-card"> 
                        <div class="card-header data-header d-flex justify-content-between align-items-center">
                            <h3 class="h5 mb-0"><i class="bi bi-bank me-2"></i> Cuentas Bancarias Asociadas para Pago</h3>


                            <button @click="openAssociationModal" class="btn btn-sm btn-outline-primary-custom add-account-btn"> 
                                <i class="bi bi-plus-circle me-1"></i> Asociar Cuenta
                            </button>

                            <AsociarCuentaModal
                                :isVisible="isAssociationModalVisible"
                                :entidadId="student.id"
                                entidadRol="estudiante" 
                                @close="closeAssociationModal"
                                @association-success="fetchStudentDetails(student.id)" 
                            />

                        </div>
                        <div class="card-body">
                            
                            <div v-if="studentAccounts.length === 0" class="alert alert-info text-center">
                                No se han asociado cuentas bancarias.
                            </div>

                            <ul v-else class="list-group list-group-flush account-list-v2">
                                <li v-for="account in studentAccounts" :key="account.id" class="list-group-item account-item-v2">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1 text-dark account-bank-name">{{ account.bankName || 'Banco Desconocido' }}</h5> 
                                        <small class="account-type-badge-pink">{{ account.type || 'Tipo N/A' }}</small>
                                    </div>
                                    <p class="mb-1">**Nº Cuenta:** {{ account.accountNumber || 'N/A' }}</p>
                                    <small class="text-muted">Propietario: {{ account.ownerName || 'Estudiante' }}</small>
                                    
                                    <div class="mt-2 text-end">
                                        <button class="btn btn-sm btn-outline-danger-custom me-2" title="Desvincular Cuenta">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-info-custom" title="Editar Cuenta">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
        </div> <div v-else class="alert alert-danger text-center py-5">
            <h2 class="h4">❌ Error 404: Estudiante no encontrado.</h2>
            <p>Verifica el ID proporcionado o el estado del servidor.</p>
        </div>


        <EstudianteModal 
            :isVisible="isModalVisible" 
            :initialData="student"
            @close="closeEditModal"
            @update-status="updateStudentStatus" 
        />

    </div>
</template>

<script setup>

    // ----------------------------------- Importaciones ----------------------------------------

    import { ref, onMounted } from 'vue';
    
    import api from '../../services/api'; 

    import { useToast } from '../../services/notificacionesService'; 

    import EstudianteModal from './FormularioEstudiantesView.vue'; 

    import AsociarCuentaModal from '../cuentasBancarias/asociacion/AsociarCuentaModal.vue'; 


    // ----------------------------------- Variables ----------------------------------------

        // Rutas
        const rutaBaseEstudiante = "/Estudiante/";
        const rutaCambiarEstado = `${rutaBaseEstudiante}CambiarEstado`;

        const { exito, error } = useToast();

        // 1. Recibir el 'id' como prop
        const props = defineProps({
        id: {
            type: [String, Number],
            required: true
        }
        });

        // El estudiante
        const student = ref(null);

        // Las cuentas bancarias del estudiante
        const studentAccounts = ref([]);

        const isLoading = ref(true);


    // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- API ----------------------------------------

            // Función para cargar los datos del estudiante y sus cuentas bancarias
            const fetchStudentData = async () => {
                isLoading.value = true;
                try {
                    // Carga los datos principales del estudiante usando el ID
                    const studentResponse = await api.get(`/Estudiante/${props.id}`);
                    console.log("id prop:", props.id);
                    student.value = studentResponse.data.data;
                    
                    // Carga las cuentas bancarias asociadas
                    //const accountsResponse = await api.get(`/CuentasBancarias/PorEstudiante/${props.id}`);
                    //studentAccounts.value = accountsResponse.data.data;

                } catch (err) {
                    console.error('Error al cargar los datos del estudiante:', err);
                    // Manejo de error, por ejemplo, redirigir a una página 404
                } finally {
                    isLoading.value = false;
                }
            };

            onMounted(() => {
                fetchStudentData();
            });


        // ----------------------------------- Interfaz  ----------------------------------------

            // Función auxiliar para asignar una clase de badge basada en el estado
            const getStatusBadge = (statusName) => {
                switch (statusName.toLowerCase()) {
                    case 'activo':
                        return 'badge-active';
                    case 'egresado':
                        return 'badge-graduated';
                    case 'retirado':
                        return 'badge-retired';
                    case 'suspendido':
                        return 'badge-suspended';
                    case 'moroso':
                        return 'badge-delinquent';
                    default:
                        return 'bg-secondary';
                }
            };


        // ----------------------------------- Auxiliar ----------------------------------------


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


        // ----------------------------------- Lógica del Modal de cuentas bancarias ----------------------------------------

        const isAssociationModalVisible = ref(false);

        function openAssociationModal() {
            isAssociationModalVisible.value = true;
        }

        function closeAssociationModal() {
            isAssociationModalVisible.value = false;
        }

        // ----------------------------------- Lógica del Modal de edición ----------------------------------------

            const isModalVisible = ref(false);
            const studentDataToEdit = ref(null);

            /**
             * Abre el modal en modo edición.
             */
            const openEditModal = () => {
                // 1. Prepara los datos del estudiante para pasarlos al modal
                if (student.value) {
                    studentDataToEdit.value = {
                        id: student.value.id,
                        estado: student.value.estado, // Pasamos el objeto estado completo
                        entidadId: student.value.entidadId 
                    };
                }
                // 2. Muestra el modal
                isModalVisible.value = true;
            };

            /**
             * Cierra el modal y limpia el estado.
             */
            const closeEditModal = () => {
                isModalVisible.value = false;
                studentDataToEdit.value = null;
            };


            /**
             * Función que maneja el evento 'update-status' del modal
             * y realiza la llamada a la API para actualizar el estado del estudiante.
             * @param {Object} data - Objeto con { id: studentId, estado: nuevoEstadoId }
             */
            async function updateStudentStatus(data) {
                try {
                    
                    await api.put(`${rutaCambiarEstado}/${data.id}`, data); 

                    exito('Éxito', 'El estado del estudiante ha sido modificado.');
                    
                    // 3. Cerrar el modal
                    isModalVisible.value = false;
                    

                    await fetchStudentData(data.id); 

                } catch (err) {
                    
                    // 5. Si la llamada falla (ej. error 400/500), se muestra el error.
                    error('Error al actualizar', 'No se pudo actualizar el estado académico del estudiante. Intente de nuevo.');
                    console.error('Error de API:', err);
                    
                }
            }

</script>


<style scoped>
    /* Paleta de Colores Fija:
    Morado Oscuro: #7b19a8
    Morado Claro: #ab47bc
    Rosa Intenso: #e91e63
    Lavanda Claro: #f3e5f5
    Morado para Texto: #4a148c
    */

    .student-details-page {
        max-width: 1400px;
        margin: auto;
    }
    
    /* --- Botón de Retroceso --- */
    .back-button {
        color: #7b19a8; 
        border-color: #ab47bc; 
    }
    .back-button:hover {
        background-color: #ab47bc; 
        color: white;
    }

    /* --- Encabezado de la Página (Header - CONTENEDOR EXTERIOR) --- */
    .header-card {
        /* Mantenemos el color oscuro o degradado para el contenedor exterior*/
        background: linear-gradient(160deg, #6d238f, #de25ff);
        color: white; /* El color principal del texto será blanco */
        padding: 0.6rem !important;
        border-radius: 12px;
    }

    /* 🌟 NUEVO ESTILO: Contenedor Interior (Fondo Claro) 🌟 */
    .header-content-wrapper {
        background-color: #fdf4ff; /* Fondo Lavanda Claro */
        color: #4a148c; /* Texto principal oscuro dentro del wrapper */
        border: 1px solid #ab47bc; /* Borde sutil del color morado claro */
    }

    /* Estilo para el Título dentro del contenedor claro */
    /* Estilo para el Título dentro del contenedor claro */
    .page-title-light {
        color: #4a148c; 
        padding-bottom: 10px;
        margin-bottom: 10px !important;
        
        /* 1. Usar Flexbox para alinear el ícono y el texto */
        display: inline-flex; 
        
        /* 2. Centrar verticalmente el ícono y el texto */
        align-items: center;
    }

    /* Ajustamos el ícono para forzar una separación uniforme a la izquierda */
    .page-title-light i {
        color: #7b19a8;
        
        /* 3. Aumentamos el margen derecho (me-3) y añadimos un margen izquierdo */
        margin-right: 15px !important; 
        margin-left: 5px !important; /* ⬅️ ESTO CENTRA EL BLOQUE VISUALMENTE */
    }

    /* 🌟 Ajuste del botón para que se vea bien en fondo claro 🌟 */
    .btn-edit-student {
        /* Mantenemos los estilos anteriores, ya que funcionan en el fondo lavanda */
        background-color: white;
        color: #7b19a8; 
        border: 2px solid #ab47bc; 
        font-weight: bold;
        transition: all 0.2s;
    }
    .btn-edit-student:hover {
        background-color: #ab47bc; 
        color: white;
        border-color: #7b19a8;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* --- Estilos de Tarjetas de Datos (Compartido: Datos Generales y Cuentas) --- */
    .card {
        border: none;
        border-radius: 12px;
    }

    /* Estilos para Ambas Cabeceras (Ahora solo usamos data-header) */
    .data-card .card-header {
        background-color: #f4daf8; /* Fondo Lavanda Claro */
        color: #7b19a8; /* Morado Oscuro */
        border-bottom: 3px solid #ab47bc; /* Morado Claro */
        font-weight: 600;
        border-radius: 12px 12px 0 0;
    }

    /* Nuevo estilo para el botón de "Asociar Cuenta" */
    .btn-outline-primary-custom {
        --bs-btn-color: #7b19a8; /* Texto Morado Oscuro */
        --bs-btn-border-color: #ab47bc; /* Borde Morado Claro */
        --bs-btn-hover-bg: #ab47bc;
        --bs-btn-hover-border-color: #ab47bc;
        --bs-btn-hover-color: white;
    }

    /* Lista de Definición (dt/dd) - Datos Generales */
    .detail-list dt,
    .detail-list dd {
        /* 1. Añadimos Flexbox para controlar la alineación */
        display: flex; 
        
        /* 2. Centramos verticalmente el contenido dentro del contenedor flex */
        align-items: center; 
        
        /* 3. Aseguramos que el contenido pueda envolverse si es necesario */
        flex-wrap: wrap; 
    }

    .detail-list dt {
        color: #4a148c; 
        font-weight: 600;
        /* Mantenemos el margen inferior en la última línea */
        margin-bottom: 0.5rem;
    }

    .detail-list dd {
        /* Mantenemos el margen inferior en la última línea */
        margin-bottom: 0.5rem;
    }
    
    /* --- Lista de Cuentas Bancarias (v2) --- */
    .account-list-v2 {
        padding-left: 0;
    }
    .account-item-v2 {
        /* Borde Izquierdo Rosa Intenso como acento */
        border-left: 5px solid #e91e63; 
        margin-bottom: 10px;
        border-radius: 6px;
        padding: 15px;
        border: 1px solid #e0e0e0; /* Borde suave para separar */
        box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* Sombra muy ligera */
        transition: box-shadow 0.2s;
    }
    .account-item-v2:hover {
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .account-bank-name {
        color: #4a148c; /* Morado oscuro para nombre del banco */
        font-weight: bold;
    }
    .account-type-badge-pink {
        font-weight: bold;
        color: #e91e63; /* Rosa Intenso para el tipo */
    }

    /* Estilos para los botones de acción (Editar/Eliminar) */
    .btn-outline-danger-custom {
        --bs-btn-color: #F44336; /* Rojo */
        --bs-btn-border-color: #F44336;
        --bs-btn-hover-bg: #F44336;
        --bs-btn-hover-border-color: #F44336;
        --bs-btn-hover-color: white;
    }
    .btn-outline-info-custom {
        --bs-btn-color: #ab47bc; /* Morado Claro */
        --bs-btn-border-color: #ab47bc;
        --bs-btn-hover-bg: #ab47bc;
        --bs-btn-hover-border-color: #ab47bc;
        --bs-btn-hover-color: white;
    }

    /* --- Estilos de Badges de Estado (Sin cambios) --- */
    .badge {
        padding: 0.5em 0.8em;
        font-size: 0.85em;
        font-weight: bold;
        border-radius: 0.35rem;
        display: inline-block; 
    }

    .badge-active {
        background-color: #4CAF50; 
        color: white;
    }
    .badge-graduated {
        background-color: #ab47bc; 
        color: white;
    }
    .badge-retired {
        background-color: #FFC107; 
        color: #333;
    }
    .badge-suspended {
        background-color: #ff4235; 
        color: white;
    }
    .badge-delinquent {
        background-color: #e62626; 
        color: white;
    }

    .spinner-border.text-primary-custom {
        color: #e91e63 !important; 
    }


</style>