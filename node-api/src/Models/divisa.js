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


    // Una divisa puede aparecer muchas veces en "obligacion_financiera"
    Divisa.hasMany(models.Obligacion_Financiera, {
        foreignKey: 'id_divisa', // La FK que está en la tabla 'obligacion_financiera'
        as: 'obligaciones_financieras' // Usamos éste prefijo para obtener los datos del otro modelo (todas las obligaciones financieras de una divisa)
    });

    // Una divisa puede aparecer muchas veces en "registro_transaccion"
    Divisa.hasMany(models.Registro_Transaccion, {
        foreignKey: 'id_divisa', // La FK que está en la tabla 'registro_transaccion'
        as: 'registros_transaccionales' // Usamos éste prefijo para obtener los datos del otro modelo (todos los registros transaccionales de una divisa)
    });


};

module.exports = Divisa;