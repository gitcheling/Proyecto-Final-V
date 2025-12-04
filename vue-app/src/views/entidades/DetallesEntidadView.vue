<template>
    <div class="details-page container mt-5">
        
        <router-link :to="{ name: 'GestionEntidades' }" class="btn mb-4 back-button btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Volver a la Lista de Entidades
        </router-link>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary-custom" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Cargando datos de la entidad...</p>
        </div>

        <div v-else-if="entity">
            
            <div class="header-card mb-4 p-4 rounded-3 hover-lift">
                
                <div class="header-content-wrapper p-3 rounded-2">
                    
                    <div class="row align-items-center">
                        <div class="col-9"> 
                            <h1 class="display-6 page-title-light"> <i class="bi bi-person-circle me-3"></i> 
                                Ficha de Entidad: {{ entity.nombre }} {{ entity.apellido ? entity.apellido : "" }}
                            </h1>
                        </div>
                        
                        <div class="col-3 text-end">
                            <button @click="openEditModal" class="btn btn-edit-student" title="Editar Estado y Datos del Estudiante">
                                <i class="bi bi-pencil-square me-2"></i> Editar Entidad
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                
                <div class="col-lg-6 mb-4">
                    <div class="card h-100 data-card hover-lift">
                        <div class="card-header data-header">
                            <h3 class="h5 mb-0"><i class="bi bi-info-circle me-2"></i> Datos Generales de la Entidad</h3>
                        </div>
                        <div class="card-body">
                            <dl class="row detail-list">
                                <dt class="col-sm-5">Número de Identificación:</dt>
                                <dd class="col-sm-7">{{ entity.prefijo.letra_prefijo }} - {{ entity.numero_identificacion }}</dd>

                                <dt class="col-sm-5">Teléfono:</dt>
                                <dd class="col-sm-7">{{ entity.telefono || 'No registrado' }}</dd>
                                
                                <dt class="col-sm-5">Correo:</dt>
                                <dd class="col-sm-7">{{ entity.email || 'No registrado' }}</dd>

                                <dt class="col-sm-5">Dirección:</dt>
                                <dd class="col-sm-7">{{ entity.direccion || 'No registrado' }}</dd>

                                <dt class="col-sm-5">Estado Actual:</dt>
                                <dd class="col-sm-7">
                                    <span :class="['badge', getStatusBadge('activo')]">{{ entity.estado }}</span>
                                </dd>
                                
                                <dt class="col-sm-5">Fecha de Creación:</dt>
                                <dd class="col-sm-7">{{ formatDateTime(entity.fechaCreacion) }}</dd>
                                
                                <dt class="col-sm-5">Última Modificación:</dt>
                                <dd class="col-sm-7">{{ formatDateTime(entity.fechaActualizacion) }}</dd>

                                
                            </dl>
                        </div>
                    </div>
                </div>


                <div class="col-lg-6 mb-4">
                    <div class="card h-100 data-card hover-lift">
                        <div class="card-header data-header d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <h3 class="h5 mb-0 me-2">
                                    <i class="bi bi-bank me-2"></i> Cuentas Titulares
                                </h3>
                                <span class="badge badge-account-count me-2"> 
                                    {{ entityAccounts.length }} {{ entityAccounts.length === 1 ? 'Cuenta' : 'Cuentas' }}
                                </span>
                            </div>
                        </div>

                        <div class="card-body">
                            
                            <div v-if="entityAccounts.length === 0" class="alert alert-purple-info text-center">
                                La entidad no tiene cuentas bancarias registradas como titular.
                            </div>

                            <ul v-else class="list-group list-group-flush account-list-v2 account-list-container">
                                <li v-for="account in entityAccounts" :key="account.id" class="list-group-item account-card-template3 hover-lift">
                                    
                                    <div class="account-header-3 d-flex w-100 justify-content-between">
                                        <h5 class="mb-1 account-bank-name-3">
                                            <i class="bi bi-bank me-2"></i> {{ account.banco.nombre || 'Banco Desconocido' }}
                                        </h5> 
                                        <small>{{ account.tipo_cuenta.nombre || 'Tipo N/A' }}</small>
                                    </div>
                                    
                                    <hr class="separator-pink my-2">

                                    <div class="account-details-3">
                                        
                                        <p class="mb-1 text-primary-custom fw-bold">Nº Cuenta: <span class="text-secondary fw-normal">{{ account.numero_cuenta || 'N/A' }}</span></p>
                                        
                                        
                                        <p class="mb-1 text-primary-custom fw-bold">Estado: <span class="text-secondary fw-normal">{{ account.estado.nombre || 'N/A' }}</span></p>
                                        
                                        <div class="mt-2 text-end">
                                            <button 
                                                @click="openAssociatedEntitiesModal(account)" 
                                                class="btn btn-sm btn-outline-info-custom" 
                                                title="Ver Entidades Asociadas"
                                            >
                                                <i class="bi bi-people me-1"></i> Entidades Asociadas 
                                              
                                            </button>
                                        </div>

                                    </div>
                                </li>
                            </ul>

                        </div>
                    </div>
                </div>


            </div>
            
        </div> <div v-else class="alert alert-danger text-center py-5">
            <h2 class="h4">❌ Error 404: Entidad no encontrada.</h2>
            <p>Verifica el ID proporcionado o el estado del servidor.</p>
        </div>


        <EntidadModal 
            v-if="entity"
            :isVisible="isModalVisible" 
            :initialData="entity"
            @close="closeEditModal"
            @update-entity="updateEntity" 
        />

        <AssociatedEntitiesModal 
            :isVisible="isAssociatedEntitiesModalVisible" 
            :cuentaId="accountToDetail ? accountToDetail.id : null"
            :accountData="accountToDetail"
            @close="closeAssociatedEntitiesModal"
        />

    </div>
</template>

<script setup>

    // ----------------------------------- Importaciones ----------------------------------------

    import { ref, onMounted } from 'vue';
    
    import api from '../../services/api'; 

    import { useToast } from '../../services/notificacionesService'; 

    import EntidadModal from './FormularioEntidadesView.vue'; 

    import AssociatedEntitiesModal from './AssociatedEntitiesModal.vue';


    // ----------------------------------- Variables ----------------------------------------

        // Rutas
            const rutaBaseEntidad = "/Entidad/";
            const rutaBaseCuentasBancarias = "/CuentaBancaria/";

            const rutaCambiarEstado = `${rutaBaseEntidad}CambiarEstado`;

            // Modificar entidad
            const rutaModificar = `${rutaBaseEntidad}Modificar`

            const rutaCuentasAsociadas = `${rutaBaseCuentasBancarias}Buscar/Aprobadas/Titular/`;


        const { exito, error } = useToast();

        // 1. Recibir el 'id' como prop
        const props = defineProps({
        id: {
            type: [String, Number],
            required: true
        }
        });

        // La entidad
        const entity = ref(null);

        // Las cuentas bancarias de las que es titular la entidad
        const entityAccounts = ref([]);

        const isLoading = ref(true);


    // ----------------------------------- Funciones ----------------------------------------

        // ----------------------------------- API ----------------------------------------

            // Función para cargar los datos de la entidad y sus cuentas bancarias
            const fetchEntityData = async () => {
                isLoading.value = true;
                try {
                    // Carga los datos principales usando el ID
                    const Response = await api.get(`${rutaBaseEntidad}${props.id}`);
                    console.log("id prop:", props.id);
                    entity.value = Response.data.data;
                    
                    // Carga las cuentas bancarias de las que es titular
                    const accountsResponse = await api.get(`${rutaCuentasAsociadas}${props.id}`);
                    entityAccounts.value = accountsResponse.data.data;

                    

                } catch (err) {
                    console.error('Error al cargar los datos de la entidad:', err);
                    // Manejo de error, por ejemplo, redirigir a una página 404
                } finally {
                    isLoading.value = false;
                }
            };

            onMounted(() => {
                fetchEntityData();
            });




            /**
             * Cambia el estado de una entidad (activo/inactivo) llamando a la API.
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


        // ----------------------------- Lógica del Modal de Entidades Asociadas a una Cuenta ---------------------------------
        
            const isAssociatedEntitiesModalVisible = ref(false);
            const accountToDetail = ref(null); // Guardará el objeto completo de la cuenta

            /**
             * Abre el modal de detalle de entidades asociadas.
             * Envía el objeto de cuenta completo (que incluye el ID necesario para la API).
             * @param {object} account - El objeto de cuenta (de entityAccounts) que disparó la acción.
             */
            const openAssociatedEntitiesModal = (account) => {
                // 1. Guardar la data de la cuenta para mostrarla en el modal
                accountToDetail.value = account;
                // 2. Mostrar el modal
                isAssociatedEntitiesModalVisible.value = true;
            };

            /**
             * Cierra el modal de detalle de entidades asociadas.
             */
            const closeAssociatedEntitiesModal = () => {
                isAssociatedEntitiesModalVisible.value = false;
                accountToDetail.value = null; // Limpiar la data al cerrar
            };


        // ----------------------------------- Lógica del Modal de edición ----------------------------------------

            const isModalVisible = ref(false);
            const studentDataToEdit = ref(null);

            /**
            * Abre el modal y lo configura en modo Creación o Edición.
            * @param {object|null} account - El objeto de cuenta para editar, o null para crear.
            */
            const openEditModal = () => {
                // En cualquier caso, el modal debe hacerse visible
                isModalVisible.value = true;
            };


            /**
            * Cierra el modal y resetea el estado de edición.
            */
            const closeEditModal = () => {
                // Modal oculto
                isModalVisible.value = false;
            };


        
            /**
             * Maneja el evento 'update-entity' del modal llamando a la API.
             */
            const updateEntity = async (updatedData) => {
    
                try {

                    const response = await api.put(`${rutaModificar}/${updatedData.id}`, updatedData);

                    exito('Éxito', 'Entidad modificada correctamente.');

                    await fetchEntityData(); 

                    // 4. Cerrar el modal.
                    closeEditModal();


                }catch (err) {
                    error('Error al modificar la entidad', `${err.response?.data?.message || 'Error de servidor.'}`);
                }
            };

</script>


<style scoped>

    /* Paleta de Colores Fija:
    Morado Oscuro: #7b19a8
    Morado Claro: #ab47bc
    Rosa Intenso: #e91e63
    Lavanda Claro: #f3e5f5
    Morado para Texto: #4a148c
    */

    .details-page {
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

    /* Contenedor Interior (Fondo Claro) 🌟 */
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

        /* Forzar a que el contenido respete el border-radius */
        
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

    /* Estilos para el contenedor de las cuentas bancarias */
    .account-list-container {
        /* Altura Máxima: Ajusta este valor (ej. 400px, 50vh, etc.) */
        max-height: 300px; 
        
        /* Habilita la barra de desplazamiento vertical cuando el contenido exceda la altura máxima */
        overflow-y: auto; 
        
        /* Si quieres un desplazamiento más limpio en algunos navegadores */
        overflow-x: hidden;
        
        /* (Opcional) Un pequeño relleno para que el scrollbar no toque el borde */
        padding-right: 5px; 
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



/* --- Estilos para las cuentas asociadas: Tarjeta con Título Morado y Separador Rosado --- */

    /* --- Estilo Personalizado para la Alerta Info Morada (indicando que no hay cuentas asociadas)--- */
    .alert-purple-info {
        /* Fondo: Lavanda Muy Claro (Sutil) */
        background-color: #f3e5f5; 
        
        /* Texto: Morado Principal (para que resalte) */
        color: #5c2e8a; /* Un morado más oscuro y legible */
        
        /* Borde: Morado Principal */
        border-color: #ab47bc;
        
        /* Asegura que el relleno y el borde sean correctos (ya lo hace .alert, pero lo confirmamos) */
        padding: 1rem 1.25rem;
        margin-bottom: 1rem;
    }

    .account-card-template3 {
        /* Fondo Claro y Sombra para separarse del fondo de la tarjeta principal */
        background-color: #ffffff; 
        border: 1px solid #f3e5f5; /* Borde muy claro */
        margin-bottom: 15px;
        border-radius: 10px;
        padding: 15px;
    }


    /* Estilo del Título: Morado Oscuro */
    .account-bank-name-3 {
        color: #4a148c; 
        font-weight: 700;
    }

    /* Badge de Tipo: Rosa Intenso */
    .account-type-3-badge {
        color: white;
        background-color: #e91e63; /* Rosa Intenso */
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.8rem;
    }

    /* El Separador Horizontal Rosado */
    .separator-pink {
        border: 0;
        height: 1px;
        background-image: linear-gradient(to right, rgba(233, 30, 99, 0), rgba(233, 30, 99, 0.75), rgba(233, 30, 99, 0)); /* Degradado rosado */
    }

    /* Pequeño ajuste para el color Morado del número de cuenta */
    .text-primary-custom {
        color: #7b19a8; /* Usamos el morado oscuro de la paleta */
    }


    /* --- Nuevo Estilo para Badge de Cuentas (el contador de cuántas cuentas tiene asociada la entidad)--- */
    .badge-account-count {
        /* Usamos el Lavanda Claro (#f3e5f5) como fondo para que sea sutil */
        background-color: #f3e5f5 !important;
        /* Usamos el Morado Oscuro (#7b19a8) como color de texto */
        color: #7b19a8 !important; 
        
        /* Pequeño borde del color Morado Claro */
        border: 1px solid #ab47bc; 
        
        font-weight: 700;
    }

/* ---------------------------------------------------------------------- */
/* --- ESTILOS PARA EL BADGE DE ESTADO DE ASOCIACIÓN (ACTIVA / INACTIVA: es decir, el color de lo que envuelve al texto (no del botón
para activar o desactivar, sino del que aparece al lado del texto "estado de la asociación:")) --- */
/* ---------------------------------------------------------------------- */

.status-badge {
    /* Base visual del badge */
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 700; /* Aseguramos que sea negrita */
    display: inline-block;
}

.status-active {
    /* Estado Activa: Verde */
    background-color: #4CAF50; /* Verde */
    color: white;
}

.status-inactive {
    /* Estado Inactiva: Rojo */
    background-color: #ff4235; /* Rojo de peligro */
    color: white;
}

.status-na {
    /* Estado No Aplicable / Desconocido */
    background-color: #6c757d; /* Gris secundario */
    color: white;
}

</style>