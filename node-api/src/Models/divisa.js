const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Divisa = sequelize.define('Divisa', {
    id_divisa: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    simbolo: {
        type: DataTypes.STRING(5),
        allowNull: false,
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'divisa', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Divisa.associate = (models) => {

    // Una divisa puede aparecer muchas veces en "tasa_cambio"
    Divisa.hasMany(models.Tasa_Cambio, {
        foreignKey: 'divisa_origen', // La FK que está en la tabla 'tasa_cambio'
        as: 'tasa_cambio_origen' // Usamos éste prefijo para obtener los datos del otro modelo (todas las tasas de cambio de una divisa)
    });

    // Una divisa puede aparecer muchas veces en "tasa_cambio"
    Divisa.hasMany(models.Tasa_Cambio, {
        foreignKey: 'divisa_destino', // La FK que está en la tabla 'tasa_cambio'
        as: 'tasa_cambio_destino' // Usamos éste prefijo para obtener los datos del otro modelo (todas las tasas de cambio de una divisa)
    });

    // Nota: ambas apuntan a un mismo registro en "tasa_cambio"

    // Una divisa puede aparecer muchas veces en "pagos_estudiantes"
    Divisa.hasMany(models.Pagos_Estudiantes, {
        foreignKey: 'id_divisa_pagada', // La FK que está en la tabla 'pagos_estudiantes'
        as: 'pagos_estudiantes' // Usamos éste prefijo para obtener los datos del otro modelo (todos los pagos de estudiantes de una divisa)
    });


    // Una divisa puede aparecer muchas veces en "facturas_gasto"
    Divisa.hasMany(models.Facturas_Gasto, {
        foreignKey: 'divisa_factura', // La FK que está en la tabla 'facturas_gasto'
        as: 'facturas_gasto' // Usamos éste prefijo para obtener los datos del otro modelo (todas las facturas de gasto de una divisa)
    });
};

module.exports = Divisa;