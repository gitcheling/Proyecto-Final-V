const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/database');


const Pagos_Estudiantes = sequelize.define('Pagos_Estudiantes', {
    id_pago   : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el plan de pago 
    // ===============================================
    id_plan_pago   : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'plan_pago', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_plan_pago'
        }
    },

    fecha_pago: {
        type: 'TIMESTAMP WITHOUT TIME ZONE',
        allowNull: false, 
        defaultValue: Sequelize.NOW
    },


    // ===============================================
    // clave foránea para el tipo de pago 
    // ===============================================
    id_tipo_pago : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_pago', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tipo_pago'
        }
    },

    // ===============================================
    // clave foránea para la divisa pagada 
    // ===============================================
    id_divisa_pagada  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'divisa', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_divisa'
        }
    },

    // ===============================================
    // clave foránea para la tasa de cambio  
    // ===============================================
    id_tasa_cambio   : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tasa_cambio', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tasa_cambio'
        }
    },

    referencia_pago: {
    type: DataTypes.STRING(50), 
    allowNull: false
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },

    monto_pagado: {
        type: DataTypes.NUMERIC(10, 2), // 10 dígitos en total, 2 decimales 
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'pagos_estudiantes', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Pagos_Estudiantes .associate = (models) => {

    // Un pago de estudiante solo puede tener un tipo de pago de "tipo_pago"
    Pagos_Estudiantes.belongsTo(models.Tipo_Pago, {
        foreignKey: 'id_tipo_pago', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_pago' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de pago de un pago de estudiante)
    });


    // Un pago de estudiante solo puede tener un plan de pago de "plan_pago"
    Pagos_Estudiantes.belongsTo(models.Plan_Pago, {
        foreignKey: 'id_plan_pago', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'plan_pago' // Usamos éste prefijo para obtener los datos del otro modelo (el plan de pago de un pago de estudiante)
    });


    // Un pago de estudiante solo puede tener una divisa del pago de "divisa"
    Pagos_Estudiantes.belongsTo(models.Divisa, {
        foreignKey: 'id_divisa_pagada', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'divisa' // Usamos éste prefijo para obtener los datos del otro modelo (la divisa de un pago de estudiante)
    });


     // Un pago de estudiante solo puede tener una tasa de cambio de "tasa_cambio"
    Pagos_Estudiantes.belongsTo(models.Tasa_Cambio, {
        foreignKey: 'id_tasa_cambio', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tasa_cambio' // Usamos éste prefijo para obtener los datos del otro modelo (la tasa de cambio de un pago de estudiante)
    });

};

module.exports = Pagos_Estudiantes;