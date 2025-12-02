const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/database');


const Pagos_Docentes = sequelize.define('Pagos_Docentes', {
    id_pago_docente: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la liquidación
    // ===============================================
    id_liquidacion    : {
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


    monto_pagado_bs: {
        type: DataTypes.NUMERIC(10, 2), // 10 dígitos en total, 2 decimales 
        allowNull: false
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
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'pagos_docentes', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Pagos_Docentes .associate = (models) => {

    // Un pago de docente solo puede tener una liquidación de "liquidacion_nomina"
    Pagos_Docentes.belongsTo(models.Liquidacion_Nomina, {
        foreignKey: 'id_liquidacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'liquidacion' // Usamos éste prefijo para obtener los datos del otro modelo (la liquidación de un pago de docente)
    });


    // Un pago de docente solo puede tener una tasa de cambio de "tasa_cambio"
    Pagos_Docentes.belongsTo(models.Tasa_Cambio, {
        foreignKey: 'id_tasa_cambio', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tasa_cambio' // Usamos éste prefijo para obtener los datos del otro modelo (la tasa de cambio de un pago de docente)
    });
};

module.exports = Pagos_Docentes;