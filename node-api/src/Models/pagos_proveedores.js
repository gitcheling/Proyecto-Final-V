const { DataTypes, Sequelize } = require('sequelize');
const  sequelize  = require('../Config/database');


const Pagos_Proveedores = sequelize.define('Pagos_Proveedores', {
    id_pago_proveedor: {
        type: DataTypes.BIGINT,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la factura de gasto
    // ===============================================
    id_factura_gasto: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'facturas_gasto', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_factura_gasto'
        }
    },

    fecha_pago: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },


    // ===============================================
    // clave foránea para el banco 
    // ===============================================
    id_banco: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'banco', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_banco'
        }
    },

    // ===============================================
    // clave foránea para la tasa de cambio  
    // ===============================================
    id_tasa_cambio: {
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
        type: DataTypes.NUMERIC(12, 2), // 12 dígitos en total, 2 decimales 
        allowNull: false
    },


    referencia_pago : {
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
    tableName: 'pagos_proveedores', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Pagos_Proveedores.associate = (models) => {

    // Un pago de proveedor solo puede tener una factura de gasto de "facturas_gasto"
    Pagos_Proveedores.belongsTo(models.Facturas_Gasto, {
        foreignKey: 'id_factura_gasto', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'factura_gasto' // Usamos éste prefijo para obtener los datos del otro modelo (la factura de gasto de un pago de proveedor)
    });


    // Un pago de proveedor solo puede tener una tasa de cambio de "tasa_cambio"
    Pagos_Proveedores.belongsTo(models.Tasa_Cambio, {
        foreignKey: 'id_tasa_cambio', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tasa_cambio' // Usamos éste prefijo para obtener los datos del otro modelo (la tasa de cambio de un pago de proveedor)
    });


};

module.exports = Pagos_Proveedores;