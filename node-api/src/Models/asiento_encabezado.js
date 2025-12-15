// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Asiento_Encabezado = sequelize.define('Asiento_Encabezado', {
    id_asiento : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },


    // ===============================================
    // clave foránea para el tipo de comprobante
    // ===============================================
    id_tipo_comprobante: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_comprobante', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_comprobante'
        }
    },

    // Enlaces a la tabla Operacional que origina el asiento (la fuente de verdad del negocio)
    // Pueden ser null ambos o uno (rompe un poco la 3era forma normal, explicado en el txt de "normalizacion")
    
            // ===============================================
            // clave foránea para la obligación financiera que hizo surgir el asiento (si existe dicha obligación)
            // ===============================================
            id_obligacion_origen: {
                type: DataTypes.INTEGER,
                allowNull: true, 
                references: {

                    // Nombre exacto de la tabla foránea en la base de datos
                    model: 'obligacion_financiera', 

                    // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
                    key: 'id_obligacion'
                }
            },

            // ===============================================
            // clave foránea para el registro de transacción que hizo surgir el asiento (si existe dicho registro transaccional)
            // ===============================================
            id_transaccion_origen: {
                type: DataTypes.INTEGER,
                allowNull: true, 
                references: {

                    // Nombre exacto de la tabla foránea en la base de datos
                    model: 'registro_transaccion', 

                    // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
                    key: 'id_transaccion'
                }
            },


    numero_comprobante: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    fecha_transaccion: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    descripcion : {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    total_debito: {
        type: DataTypes.DECIMAL(12, 2), // 12 dígitos en total, 2 decimales 
        allowNull: false
    },

    total_credito : {
        type: DataTypes.DECIMAL(12, 2), // 12 dígitos en total, 2 decimales 
        allowNull: false
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'asiento_encabezado', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Asiento_Encabezado.associate = (models) => {

    // Un encabezado de asiento solo puede tener un tipo de comprobante de "tipo_comprobante"
    Asiento_Encabezado.belongsTo(models.Tipo_Comprobante, {
        foreignKey: 'id_tipo_comprobante', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_comprobante' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de comprobante de un encabezado de asiento)
    });

    // Un encabezado de asiento solo puede tener una obligación financiera "obligacion_financiera"
    Asiento_Encabezado.belongsTo(models.Obligacion_Financiera, {
        foreignKey: 'id_obligacion_origen', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'obligacion_financiera' // Usamos éste prefijo para obtener los datos del otro modelo (la obligacion financiera de un encabezado de asiento)
    });

    // Un encabezado de asiento solo puede tener un registro transaccional de "registro_transaccion"
    Asiento_Encabezado.belongsTo(models.Registro_Transaccion, {
        foreignKey: 'id_transaccion_origen', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'registro_transaccion' // Usamos éste prefijo para obtener los datos del otro modelo (El registro transaccional de un encabezado de asiento)
    });

    // Un encabezado de asiento puede aparecer muchas veces en "asiento_detalle"
    Asiento_Encabezado.hasMany(models.Asiento_Detalle, {
        foreignKey: 'id_asiento', // La FK que está en la tabla 'asiento_detalle'
        as: 'asiento_detalles' // Usamos éste prefijo para obtener los datos del otro modelo (todos los detalles de un encabezado de asiento)
    });

};

module.exports = Asiento_Encabezado;