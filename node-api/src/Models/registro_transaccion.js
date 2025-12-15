// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');




const Registro_Transaccion = sequelize.define('Registro_Transaccion', {

    id_transaccion: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },


    // ===============================================
    // clave foránea para la obligación financiera
    // ===============================================
    id_obligacion: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'obligacion_financiera', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_obligacion'
        }
    },


    // ===============================================
    // clave foránea para la identidad que realiza la transacción
    // ===============================================
    id_entidad_realiza: {
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
    // clave foránea para el tipo de movimiento 
    // ===============================================
    id_tipo_movimiento: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_movimiento', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tipo_movimiento'
        }
    },


    // ===============================================
    // clave foránea para el método de pago
    // ===============================================
    id_metodo_pago: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'metodo_pago', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_metodo_pago'
        }
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


    monto_transaccion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    referencia_transaccion: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    
    fecha_transaccion: {
        type: DataTypes.DATEONLY,
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
    tableName: 'registro_transaccion', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Registro_Transaccion.associate = (models) => {


    // Un registro de transacción solo puede tener una obligación de "obligación financiera"
    Registro_Transaccion.belongsTo(models.Obligacion_Financiera, {
        foreignKey: 'id_obligacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'obligacion_financiera' // Usamos éste prefijo para obtener los datos del otro modelo (la obligación financiera de un registro de transacción)
    });

    // Un registro de transacción solo puede tener una entidad de "entidad"
    Registro_Transaccion.belongsTo(models.Entidad, {
        foreignKey: 'id_entidad_realiza', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'entidad' // Usamos éste prefijo para obtener los datos del otro modelo (la entidad de un registro de transacción)
    });

    // Un registro de transacción solo puede tener un tipo de movimiento de "tipo_movimiento"
    Registro_Transaccion.belongsTo(models.Tipo_Movimiento, {
        foreignKey: 'id_tipo_movimiento', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_movimiento' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de movimiento de un registro de transacción)
    });

    // Un registro de transacción solo puede tener un método de pago de "metodo_pago"
    Registro_Transaccion.belongsTo(models.Metodo_Pago, {
        foreignKey: 'id_metodo_pago', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'metodo_pago' // Usamos éste prefijo para obtener los datos del otro modelo (el método de pago de un registro de transacción)
    });

    // Un registro de transacción solo puede tener una divisa de "divisa"
    Registro_Transaccion.belongsTo(models.Divisa, {
        foreignKey: 'id_divisa', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'divisa' // Usamos éste prefijo para obtener los datos del otro modelo (la divisa de un registro de transacción)
    });

    //Un registro de transacción puede aparecer muchas veces en "asiento_encabezado"
    Registro_Transaccion.hasMany(models.Asiento_Encabezado, {
        foreignKey: 'id_transaccion_origen', // La FK que está en la tabla 'asiento_encabezado'
         as: 'asientos_encabezados' // Usamos éste prefijo para obtener los datos del otro modelo (todos los encabezados de asiento de un registro de transacción)
    }); 


     // Un registro de transacción solo puede aparecer una vez en "transaccion_bancaria"
    Registro_Transaccion.hasOne(models.Transaccion_Bancaria, {
        foreignKey: 'id_transaccion', // La FK que está en la tabla 'transaccion_bancaria'
        as: 'transaccion_bancaria' 
    });



};

module.exports = Registro_Transaccion;