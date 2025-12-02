// Se importa la clase principal "Sequelize" que se usará para crear una instancia de conexión.
const {Sequelize} = require("sequelize");

// Se cargan las variables
require('dotenv').config();

/* Esta línea crea la instancia de conexión que se usará en toda la aplicación. Se le estás pasando los parámetros 
esenciales para que Sequelize sepa a dónde y cómo conectarse:

    -'express': Es el nombre de la base de datos a la que se quiere conectar.

    -'root': Es el nombre de usuario de la base de datos (típico usuario por defecto de MySQL/MariaDB).

    -'': Es la contraseña del usuario.

    -"{ host: 'localhost' }": Indica que la base de datos se ejecuta en la máquina local.

    -"{ dialect: 'mysql' }": Especifica que se está usando la base de datos MySQL.

    -"{ logging: false }": Es una opción útil. Si estuviera en "true", Sequelize mostraría en la consola 
    todas las consultas SQL que ejecuta (útil para depuración, pero se desactiva para mantener la consola limpia).
*/
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect:'postgres',
    logging: false, // Depuración, cambiar a "console.log" si se quiere mostrar toda la comprobación en consola
    dialectOptions: {
        // Indica a Sequelize que debe trabajar con las fechas en UTC
        useUTC: true, 
    },
    // Le dice a la base de datos (PostgreSQL) que la zona horaria es UTC ('Z')
    timezone: '+00:00', // O 'Z'
    hooks: {
        afterConnect: (connection, config) => {
            // Ejecuta el comando SET TIME ZONE 'UTC' después de que la conexión de pg esté lista.
            return connection.query("SET TIME ZONE 'UTC'");
        }
    }
});



/* Se exporta dos elementos clave para que puedan ser usados por el resto de la aplicación (principalmente en server.js):

    -sequelize: La instancia de conexión (necesaria en server.js para llamar a sequelize.sync(), y necesaria en los modelos/controladores para hacer consultas).

    -connectDB: La función para iniciar la autenticación al arrancar el servidor. 
*/
module.exports = sequelize;


