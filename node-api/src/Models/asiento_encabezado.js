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
    // clave foránea para la fuente del asiento
    // ===============================================
    id_fuente: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'fuente_asiento', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_fuente'
        }
    },

    id_referencia_origen: { // PK de la tabla de origen (Por ejemplo, pagos_estudiantes.id_pago_estudiante)
        type: DataTypes.INTEGER,
        allowNull: false
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
        type: DataTypes.NUMERIC(12, 2), // 12 dígitos en total, 2 decimales 
        allowNull: false
    },

    total_credito : {
        type: DataTypes.NUMERIC(12, 2), // 12 dígitos en total, 2 decimales 
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

    // Un encabezado de asiento solo puede tener una fuente de "fuente_asiento"
    Asiento_Encabezado.belongsTo(models.Fuente_Asiento, {
        foreignKey: 'id_fuente', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'fuente' // Usamos éste prefijo para obtener los datos del otro modelo (la fuente de un encabezado de asiento)
    });


    // Un encabezado de asiento solo puede tener un tipo de comprobante de "tipo_comprobante"
    Asiento_Encabezado.belongsTo(models.Tipo_Comprobante, {
        foreignKey: 'id_tipo_comprobante', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_comprobante' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de comprobante de un encabezado de asiento)
    });

    // Un encabezado de asiento puede aparecer muchas veces en "asiento_detalle"
    Asiento_Encabezado.hasMany(models.Asiento_Detalle, {
        foreignKey: 'id_asiento', // La FK que está en la tabla 'asiento_detalle'
        as: 'asiento_detalles' // Usamos éste prefijo para obtener los datos del otro modelo (todos los detalles de un encabezado de asiento)
    });

};

module.exports = Asiento_Encabezado;