// Modelo de la tabla "tb_plan_cuenta"


/*Se importa el objeto "DataTypes", que contiene todos los tipos de datos SQL (como INTEGER, STRING, BOOLEAN, etc.). 
Se Necesita esto para definir las columnas de la tabla. 
*/
const {DataTypes} = require('sequelize');

/* Se importa la instancia de conexión que se definió en "db.js". El Modelo necesita esta instancia para saber a qué 
base de datos y conexión debe asociarse.
*/
const sequelize = require('../Config/database');

/*La función "sequelize.define()" es donde se crea el modelo. Recibe tres argumentos:

    -Nombre del Modelo ('User'): El nombre singular que se usará para referenciar este modelo en el código 
    (ej. const newUser = await User.create(...)). Sequelize usará una versión plural de esto como nombre de 
    tabla por defecto, pero nosotros lo sobrescribimos.

    -Definición de Atributos (Columnas): El objeto donde se describe cada campo de la tabla.

    -Opciones del Modelo: Un objeto para configuraciones globales del modelo. 
*/
const Plan_Cuenta = sequelize.define('Plan_Cuenta',{
    id_plan_cuenta:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo: {
        type:DataTypes.STRING(8),
        allowNull: false, // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
        unique: true,
        validate: {
            // [mínimo, máximo] - La longitud (len) debe estar entre 2 y 8 caracteres.
            len: [2, 8], 
        }
    },
    nivel: {
        type:DataTypes.INTEGER,
        allowNull: false, // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
        validate: {
            // Asegura que el valor del nivel sea como mínimo 2.
            min: 2, 
            
            // Asegura que el valor del nivel sea como máximo 8.
            max: 8 
            }
    },
    nombre: {
        type:DataTypes.STRING(30),
        allowNull: false, // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
        unique: true
    },
    estado: {
        type:DataTypes.BOOLEAN,
        allowNull: false, // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
        defaultValue: true // Valor por defecto
    },

    /* Con estas dos opciones nos aseguramos que las columnas de la base de datos se mantengan como UTC (esto debido a que por defecto, 
    se guardan con la zona horaria de venezuela, siendo -4, y provoca errores en los filtros, como elementos que no se muestran en las 
    fechas limite que indicamos, a pesar de que en la base de datos si se cumpla con eso) */                       
    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },

    // ===============================================
    // CLAVE FORÁNEA PARA LA JERARQUÍA (ID PADRE)
    // ===============================================
    id_padre: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            /* La tabla foránea (ya que "id_padre" es una clave foránea en la base de datos, y en este caso se referencia a la misma tabla
            por recursividad) */
            model: 'plan_cuenta', 

            // La columna de la tabla foránea
            key: 'id_plan_cuenta'
        }
    },
    
    // ===============================================
    // CLAVE FORÁNEA PARA LA NATURALEZA
    // ===============================================
    id_naturaleza: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            // La tabla foránea
            model: 'naturaleza',

            // La columna de la tabla foránea
            key: 'id_naturaleza'
        }
    },
    
    // ===============================================
    // CLAVE FORÁNEA PARA LA CLASIFICACIÓN
    // ===============================================
    id_clasificacion: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            model: 'clasificacion', 
            key: 'id_clasificacion'
        }
    }
}, {
    tableName: 'plan_cuenta', /* Propósito: Especifica exactamente cómo se debe llamar a la tabla en la base de datos MySQL.

                           Contexto: Sequelize tiene una regla por defecto: toma el nombre del modelo que se le diste (por ejemplo 'User') 
                           y automáticamente lo pluraliza y lo pone en minúsculas (lo convertiría a 'users').
    
                           Uso: Al definir explícitamente el tableName, se está confirmando y sobrescribiendo el comportamiento por defecto.
                        */

    timestamps: true,   /* Le dice a Sequelize si debe gestionar o no las columnas que registran cuándo se creó o actualizó una fila. Es deci, 
                        por defecto, Sequelize agregaría automáticamente dos columnas a la tabla:

                            -createdAt (Fecha y hora de creación de la fila).

                            -updatedAt (Fecha y hora de la última actualización de la fila).

                        Al establecer "timestamps: false", se está indicando que NO se quiere estas dos columnas en la tabla. El control de 
                        tiempo se dejas fuera de Sequelize. En este caso es "true" ya que al mandar a hacer una actualización, Sequelize se encarga
                        automáticamente de actualizar la columna "updatedAt"

                        Nota: La utilidad de los timestamps (createdAt y updatedAt) se centra en la auditoría, la depuración y la lógica de negocio.
                        Los casos en los cuales puede ser útil son:

                            1. 🔍 Para Auditoría y Depuración
                            Saber la Creación: Permite saber exactamente cuándo se registró un usuario, producto o cualquier dato. Esto es 
                            crucial para análisis de crecimiento (ej., "Tuvimos 500 registros el martes pasado").

                            Seguimiento de Cambios: updatedAt nos dice cuándo fue la última vez que se modificó un registro. Esto es vital 
                            para depurar problemas (ej., "Este usuario se reportó como defectuoso, veamos cuándo fue la última vez que cambiaron 
                            sus datos").

                            Cacheo: Facilita la invalidación de caché. Si un registro tiene una fecha de actualización reciente, sabemos que 
                            se necesita recargar los datos en el frontend o en la caché del servidor.

                            2. 📈 Para Lógica de Negocio
                            Política de Privacidad: Se necesitas el createdAt para la lógica de negocio (ej., "Borrar cuentas inactivas o 
                            datos de sesión con más de 90 días").

                            Antigüedad: Clasificar elementos por antigüedad (ej., "Mostrar los 5 artículos más recientes").

                            Optimización de Consultas: A menudo, es más eficiente consultar solo los registros que han sido updatedAt después 
                            de una cierta hora, en lugar de escanear toda la tabla.

                        🚫 Cuándo NO es Útil (timestamps: false)
                        Solo se recomienda desactivar los timestamps cuando se tiene una razón fuerte y específica, típicamente para optimización o compatibilidad.

                            Tablas de Unión Simples (Muchos-a-Muchos): Si se tiene una tabla intermedia que solo conecta dos IDs 
                            (ej., product_tag que solo tiene product_id y tag_id), a menudo no es relevante auditar cuándo se creó esa conexión.

                            Rendimiento Extremo/Legacy: Si se trabaja con bases de datos heredadas (legacy) donde la estructura de la tabla 
                            está estrictamente definida y debe ser lo más ligera posible, o si se está optimizando al extremo y se sabe que 
                            nunca se usará esa información.

                            Gestión Manual: Cuando nosotros mismos queremos manejar los campos de fecha, quizás con nombres diferentes 
                            (fecha_creacion en lugar de createdAt), y se prefiere que Sequelize no interfiera.
                            */
    
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Plan_Cuenta.associate = (models) => {

    // Una cuenta solo puede tener una naturaleza de "naturaleza"
    Plan_Cuenta.belongsTo(models.Naturaleza, {
        foreignKey: 'id_naturaleza', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'naturaleza' // Usamos éste prefijo para obtener los datos del otro modelo (la naturaleza de una cuenta)
    });


    // Una cuenta solo puede tener una clasificación de "clasificacion"
    Plan_Cuenta.belongsTo(models.Clasificacion, {
        foreignKey: 'id_clasificacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'clasificacion' // Usamos éste prefijo para obtener los datos del otro modelo (la clasificación de una cuenta)
    });


    // Relación de Jerarquía (Recursividad)
    // Una Cuenta pertenece a una Cuenta Padre (que también es una Cuenta)
    Plan_Cuenta.belongsTo(models.Plan_Cuenta, {
        foreignKey: 'id_padre', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'cuentaPadre'// Usamos éste prefijo para obtener los datos del otro modelo (la cuenta padre de una cuenta)
    });


    // Una cuenta puede aparecer muchas veces en "asiento_detalle"
    Plan_Cuenta.hasMany(models.Asiento_Detalle, {
        foreignKey: 'id_plan_cuenta', // La FK que está en la tabla 'asiento_detalle'
        as: 'asientos_detalles' // Usamos éste prefijo para obtener los datos del otro modelo (todos los detalles de asientos de una cuenta)
    });


    // Una cuenta puede aparecer muchas veces en "detalle_factura"
    Plan_Cuenta.hasMany(models.Detalle_Factura, {
        foreignKey: 'id_cuenta_gasto', // La FK que está en la tabla 'detalle_factura'
        as: 'detalles_facturas' // Usamos éste prefijo para obtener los datos del otro modelo (todos los detalles de facturas de una cuenta)
    });
};

module.exports = Plan_Cuenta;