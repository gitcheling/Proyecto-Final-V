
import { ref, provide, readonly, getCurrentInstance } from 'vue';

export function setupToastProvider() {
    // Lista reactiva para almacenar los toasts
    const toasts = ref([]);
    
    // Función central para agregar un toast
    const addToast = (toast) => {

        console.log("addToast() EJECUTADO. Contenido de Toast:", toast);
        const newToast = {
            id: Date.now() + Math.random().toString(), // Generar ID único
            ...toast,
            cerrando: false, // Estado de animación
        };
        toasts.value.push(newToast);

        console.log("Nuevo array de Toasts:", toasts.value);

        // Lógica de autocierre (si es true)
        if (newToast.autoCierre !== false) {
            const duration = toast.duracion || 5000;
            setTimeout(() => {
                // Si el toast sigue en la lista y no está cerrándose (podría haber sido cerrado manualmente)
                const index = toasts.value.findIndex(t => t.id === newToast.id);
                if (index !== -1 && !toasts.value[index].cerrando) {
                    removeToast(newToast.id); // Inicia la animación de cierre
                }
            }, duration);
        }
    };
    
    // Función para manejar la eliminación (llamada por ToastItem después de la animación)
    const removeToast = (id) => {
        // Primero activa la animación de cierre en ToastItem (la prop cerrando)
        const index = toasts.value.findIndex(t => t.id === id);
        if (index !== -1) {
            toasts.value[index].cerrando = true;

            // Esperar el tiempo de la animación CSS antes de eliminar de la lista.
            // (Asumimos 500ms, ajusta según tu CSS de cierre)
            setTimeout(() => {
                toasts.value = toasts.value.filter(t => t.id !== id);
            }, 500); 
        }
    };


    // Devuelve los datos necesarios para el ToastContainer.vue
    return {
        toasts: readonly(toasts), // El componente contenedor solo necesita leer la lista
        removeToast,
        addToast // La función de agregar (aunque se usa principalmente para el provide)
    };
}