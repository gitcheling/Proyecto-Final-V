// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Obligacion_Financiera = sequelize.define('Obligacion_Financiera', {

    id_obligacion: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la entidad
    // ===============================================
    id_entidad: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'entidad', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_entidad'
        }
    },

    // ===============================================
    // clave foránea para el concepto (nomina por pagar, servicio por pagar, inscripción por pagar de un estudiante, etc)
    // ===============================================
    id_concepto: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'concepto_financiero', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_concepto'
        }
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


    // ===============================================
    // clave foránea para el estado
    // ===============================================
    id_estado: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_obligacion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estado_obligacion'
        }
    },


    numero_documento: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },

    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    
    fecha_emision: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    monto_original: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },


    // ===============================================
    // clave foránea para la divisa
    // ===============================================
    id_divisa: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'divisa', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_divisa'
        }
    },
  


    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'obligacion_financiera', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Obligacion_Financiera.associate = (models) => {

    // Una obligación financiera solo puede tener una entidad de "entidad"
    Obligacion_Financiera.belongsTo(models.Entidad, {
        foreignKey: 'id_entidad', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'entidad' // Usamos éste prefijo para obtener los datos del otro modelo (la entidad una obligación financiera)
    });

    // Una obligación financiera solo puede tener un concepto de "concepto_financiero"
    Obligacion_Financiera.belongsTo(models.Concepto_Financiero, {
        foreignKey: 'id_concepto', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'concepto' // Usamos éste prefijo para obtener los datos del otro modelo (el concepto de una obligación financiera)
    });

    // Una obligación financiera solo puede tener un tipo de comprobante de "tipo_comprobante"
    Obligacion_Financiera.belongsTo(models.Tipo_Comprobante, {
        foreignKey: 'id_tipo_comprobante', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_comprobante' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de comprobante de una obligación financiera)
    });

    // Una obligación financiera solo puede tener un estado de "estado_obligación"
    Obligacion_Financiera.belongsTo(models.Estado_Obligacion, {
        foreignKey: 'id_estado', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de una obligación financiera)
    });

    // Una obligación financiera solo puede tener una divisa de "divisa"
    Obligacion_Financiera.belongsTo(models.Divisa, {
        foreignKey: 'id_divisa', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'divisa' // Usamos éste prefijo para obtener los datos del otro modelo (la divisa de una obligación financiera)
    });


    // Una obligación financiera solo puede tener una obligación de inscripción de "obligacion_inscripcion"
    Obligacion_Financiera.hasOne(models.Obligacion_Inscripcion, {
        foreignKey: 'id_obligacion', // La FK que está en la tabla 'obligacion_inscripcion'
        as: 'obligacion_inscripcion' // Usamos éste prefijo para obtener los datos del otro modelo (la obligación de inscripción de una obligación financiera)
    });


    //Una obligación financiera puede aparecer muchas veces en "registro_transaccion"
    Obligacion_Financiera.hasMany(models.Registro_Transaccion, {
        foreignKey: 'id_obligacion', // La FK que está en la tabla 'registro_transaccion'
        as: 'registros_transaccionales' // Usamos éste prefijo para obtener los datos del otro modelo (todos los registros transaccionales de una obligación financiera)
    }); 

    //Una obligación financiera puede aparecer muchas veces en "asiento_encabezado"
    Obligacion_Financiera.hasMany(models.Asiento_Encabezado, {
        foreignKey: 'id_obligacion_origen', // La FK que está en la tabla 'asiento_encabezado'
        as: 'asientos_encabezados' // Usamos éste prefijo para obtener los datos del otro modelo (todos los encabezados de asiento de una obligación financiera)
    }); 


};

module.exports = Obligacion_Financiera;