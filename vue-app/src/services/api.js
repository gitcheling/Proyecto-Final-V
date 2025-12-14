// Se importa la libreria Axios
import axios from 'axios';


// La URL base del backend de Node/Express
const API_BASE_URL = 'http://192.168.250.5:3000/aCATdemy/'; 

// Se crea una instancia personalizada de Axios (un objeto), la cual se usará en los componentes de Vue
//Nota: Todas las llamadas que se hagas usando éste objeto tendrán las configuraciones definidas aquí.
const api = axios.create({
    baseURL: API_BASE_URL,
    
    headers: {
        'Content-Type': 'application/json',
        /* 'Authorization': `Bearer ${localStorage.getItem('token')}` Ejemplo de cómo se podría enviar un Token de Autenticación 
                                                                      (como un JWT) con cada petición para verificar la identidad del 
                                                                      usuario en el backend.*/
    },
    timeout: 7000 /* Tiempo máximo de espera de la petición. Si el servidor de Express no responde dentro de ese tiempo, la petición 
                    se cancela automáticamente para evitar que la aplicación se quede colgada.*/
});


/* Los interceptores son funciones que se ejecutan antes de que la petición sea enviada, o antes de que la respuesta llegue al código
del componente Vue. Son muy útiles para lógica global. En éste caso, se configura un manejador que se ejecuta cada vez que el servidor 
de Express envía una respuesta. */
api.interceptors.response.use(
    response => response, // Si la respuesta es exitosa, la devuelve
    error => { // Si la petición falla

        /* Es un ejemplo. Si el servidor de Express responde con un error 401 (Unauthorized), significa que el usuario no tiene permiso.
        En lugar de manejar este error en cada componente, se puede poner aquí la lógica para redirigir al usuario a la pantalla de 
        inicio de sesión. */
        if (error.response && error.response.status === 401) {

            console.error("Acceso no autorizado. Redirigiendo a login...");
            // Lógica para cerrar sesión o redirigir
            
        }
        return Promise.reject(error);
    }
);

export default api;