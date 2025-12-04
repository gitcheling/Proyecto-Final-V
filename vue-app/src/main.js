// frontend/src/main.js

import { createApp } from 'vue'
import { setupToastProvider } from './composables/toastProvider';
import App from './App.vue'
import router from './router' // Importa la configuración de rutas
import axios from 'axios' // Importa Axios


// 1. Estilos de Bootstrap y Personalizados
import 'bootstrap/dist/css/bootstrap.css' // CSS de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css' // Iconos de Bootstrap
import './assets/main.css' // Tus estilos globales


// 1. IMPORTACIONES DE ELEMENT PLUS
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; 


// 3. Crear la instancia principal de la aplicación
const app = createApp(App)

/* Se llama al "setupToastProvider" ANTES de montar la app y después de crearla. Esto asegura 
que el 'provide' exista en el contexto raíz de Vue (para las notificaciones) */
const { toasts, removeToast, addToast } = setupToastProvider();

app.provide('toasts', toasts);        
app.provide('removeToast', removeToast); 
app.provide('addToast', addToast);

// 4. Agregar Plugins
app.use(router) // Usa Vue Router

// Snpe registra Element Plus como plugin
app.use(ElementPlus);

// 5. Configurar Axios (Cliente HTTP)
// Esto hace que $http esté disponible en todos los componentes
app.config.globalProperties.$http = axios 

// 6. Montar la aplicación en el DOM
app.mount('#app')