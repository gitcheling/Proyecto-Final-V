/* Archivo para inicializar el servidor.

Nota: Sólo se ejecuta una sola vez al iniciar el servidor. Las peticiones que envían los clientes no hacen que se vuelva
a ejecutar este archivo, sino que express va a redirigir cada petición a cada ruta correspondiente (excepto los middleware, esos 
si se ejecutan con cada petición) */

require('dotenv').config();


const sequelize = require('./Config/database');
const express = require('express');

// Importar middlewares
const logger = require('./Middlewares/logger');
const {manejadorErrores} = require('./Middlewares/manejadorErrores');

// Se importan las asociaciones 
const { setupAssociations } = require('./Models/associations');

// Se importamo la utilidad de carga dinámica (para no poner todos los require de las rutas manualmente)
const { cargarRutas } = require('./Utils/cargarRutas'); 

// Crea una instancia de la aplicación Express, que será el servidor.
const app = express();

// El puerto donde el servidor escucha
const PORT = 3000;
const cors = require('cors');
const path = require('path');


// Middlewares globales (se ejecutan con cada petición)

// Lista de todos los orígenes que deberían ser permitidos en desarrollo
const ALLOWED_ORIGINS = [
    // 1. Origen para dispositivos externos 
    'http://192.168.250.5:5173', 
    
    // 2. Origen para el navegador en la misma máquina
    'http://localhost:5173', 
    'http://127.0.0.1:5173' // A veces se usa 127.0.0.1 en lugar de localhost
];

const corsOptions = {
    // Definimos una función que verifica si el 'origin' de la petición está en nuestra lista
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como Postman o peticiones del mismo servidor)
        if (!origin) return callback(null, true); 
        
        // Verificar si el origen solicitado está en la lista de permitidos
        if (ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true); // Permitido
        } else {
            // Bloqueado
            callback(new Error('No permitido por CORS'), false); 
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], 
    credentials: true 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

// =================================================================
// FUNCIÓN DE INICIALIZACIÓN ROBUSTA (async/await)
// El servidor solo se inicia si la conexión a la DB es exitosa.
// =================================================================
async function iniciarServidor() {
    try {
        // 1. Probar la conexión a la base de datos (PUNTO CRÍTICO)
        // Si PostgreSQL no está encendido o las credenciales son incorrectas, fallará aquí.
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada correctamente.');

        // 2. Ejecutar las asociaciones (antes de la sincronización)
        setupAssociations(); 
        console.log('Asociaciones de Sequelize establecidas.');

        // 3. Sincronizar modelos con la base de datos (crea o altera tablas)

        /* Ésta funcion permite comprobar que existan los modelos definidos en el modelo ("user.model.js") existan de verdad en
        la base de datos al iniciarse el servidor. Por defecto si una tabla no existe, la función la manda a crear, y si un atributo no coincide, lo deja 
        tal cual, pero si se usa "sequelize.sync({ **alter: true** })" va a comparar los atributos y ejecuta comandos SQL ALTER 
        TABLE para agregar o modificar columnas según sea necesario, intentando preservar los datos. Esto puede tomar más tiempo 
        que la sincronización normal, pero sigue siendo eficiente en la mayoría de los casos.

        Nota: Solo se realiza una sola vez, al iniciar el servidor, de resto se ignora con cada solicitud

        Nota: se puede usar "sequelize.sync({ **force: true** })", pero es peligroso, ya que borra la tabla para recrearla, y lo hace
        porque se le estás indicando a Sequelize que se desea una sincronización destructiva que prioriza la definición del modelo
        en JavaScript sobre el estado actual de la base de datos, garantizando que la estructura de la base de datos coincida 
        exactamente con la definición del Modelo JavaScript, incluso si eso significa destruir la versión anterior.
        */
        await sequelize.sync({ alter: true }); // Usamos alter: true para no perder datos.
        console.log('Modelos sincronizados con la base de datos.');

        // 4. Iniciar el servidor Express (SOLO si todo lo anterior tuvo éxito)
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 Servidor aCATdemy iniciado');
            console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Red: http://192.168.250.5:${PORT}`);
        });

    } catch (error) {
        // 5. Manejar cualquier error crítico (DB inaccesible)
        console.error('❌ ERROR CRÍTICO: No se pudo conectar a la base de datos.');
        console.error('Detalles del Error:', error.message);
        console.error('Por favor, asegúrese de que PostgreSQL esté activo y las credenciales sean correctas.');
        // El servidor NO se inicia.
    }
}


// Ruta raíz
const rutaRaiz = '/aCATdemy';

// Asignamos la ruta raiz
app.get(rutaRaiz, (req, res) => {
    res.json({
        message: 'Bienvenido a la API aCATdemy',
        endpoints: {
            health: '/health'
        },
        documentation: 'Próximamente...'
    });
});

// Se obtiene la ruta completa en base a la variable global "__dirname" y la carpeta "Routes", "path.join" se asegura de concatenar según el sistema operativo
const directorioRutas = path.join(__dirname, 'Routes');
cargarRutas(app, rutaRaiz, directorioRutas); 

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API Udemy funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});


// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}`
    });
});

// Middleware de manejo de errores (DEBE SER EL ÚLTIMO)
app.use(manejadorErrores);


// Iniciar la aplicación
iniciarServidor();
module.exports = app;