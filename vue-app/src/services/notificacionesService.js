/* Este archivo es el puente que conecta a cualquier componente de la aplicación con la funcionalidad del "ToastContainer".
Este archivo define y exporta la función "useToast", que permite consumir el servicio de notificaciones en cualquier lugar. */
import { inject } from 'vue';

/* Exporta la función de forma que se pueda usar como hook.

Nota: "export const useToast = () => { ... }": Define y exporta una función simple, siguiendo la convención de los hooks de Vue 
(que empiezan con use...). Cuando SE importa y llama a "useToast()" dentro de un componente, se está "conectando" ese componente 
al servicio de notificaciones. */
export const useToast = () => {

    /* Busca la función 'addToast' inyectada por el ToastContainer. La función "inject" busca la clave 'addToast' en todo el árbol de 
    componentes, subiendo desde el componente actual hasta encontrar a un ancestro que haya usado "provide('addToast', ...)" (que es
    el "ToastContainer"). Si lo encuentra, "addToast" obtiene una referencia a la función real que agrega toasts al array del contenedor. 
    La función "inject" devuelve "undefined" si no puede encontrar la clave que se le pide.*/
    const addToast = inject('addToast');

    if (!addToast) {
        // Esto previene errores si el hook se usa sin un ToastContainer
        console.error("ToastContainer not found. Did you forget to include it in your main layout?");
        return {
            exito: () => console.log('Éxito (ToastContainer no encontrado)'),
            error: () => console.log('Error (ToastContainer no encontrado)'),
            info: () => console.log('Info (ToastContainer no encontrado)'),
            warning: () => console.log('Advertencia (ToastContainer no encontrado)'),
            agregarToast: () => console.log('Agregar Toast (ToastContainer no encontrado)')
        };
    }
    
    /* Devuelve métodos convenientes para llamar a los toasts. Ahora, en lugar de obligar a tus desarrolladores a llamar siempre a "addToast"
    con el objeto completo:

        addToast({ tipo: 'error', titulo: '...', descripcion: '...', autoCierre: false });

    Se ha creado métodos más sencillos y preconfigurados:

        exito('¡Hecho!', 'Datos guardados.');
    */
    return {
        /** La función base, similar a la original. Es útil si queremos usar la función original, como:
         * 
         *      const { agregarToast } = useToast();
         * 
                // Se usa la función base y se le pasa el objeto completo:
                agregarToast({ 
                tipo: 'info', 
                titulo: 'Notificación personalizada', 
                descripcion: 'Esto dura 10 segundos.', 
                autoCierre: true, 
                duracion: 10000 // si la función base soporta una prop 'duracion'
                });
        */
        agregarToast: addToast,

        /** Funciones por defecto, con un valor de cierre automático también por defecto*/
        exito: (titulo, descripcion, autoCierre = true) => 
            addToast({ tipo: 'exito', titulo, descripcion, autoCierre }),
        /** Error: Sin cierre automático por defecto */
        error: (titulo, descripcion, autoCierre = false) => 
            addToast({ tipo: 'error', titulo, descripcion, autoCierre }),
        /** Información: Cierre automático por defecto */
        info: (titulo, descripcion, autoCierre = true) => 
            addToast({ tipo: 'info', titulo, descripcion, autoCierre }),
        /** Advertencia: Sin cierre automático por defecto */
        warning: (titulo, descripcion, autoCierre = false) => 
            addToast({ tipo: 'warning', titulo, descripcion, autoCierre }),
    };
};