const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Tipo_Comprobante = sequelize.define('Tipo_Comprobante', {
    id_comprobante: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    es_legal: {
        type:DataTypes.BOOLEAN,
        allowNull: false 
    },
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_comprobante', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Tipo_Comprobante.associate = (models) => {

    // Un tipo de comprobante puede aparecer muchas veces en "asiento_encabezado"
    Tipo_Comprobante.hasMany(models.Asiento_Encabezado, {
        foreignKey: 'id_tipo_comprobante', // La FK que está en la tabla 'asiento_encabezado'
        as: 'asientos_encabezados' // Usamos éste prefijo para obtener los datos del otro modelo (todos los encabezados de asientos de un tipo de comprobante)
    });

    // Un tipo de comprobante puede aparecer muchas veces en "obligacion_financiera"
    Tipo_Comprobante.hasMany(models.Obligacion_Financiera, {
        foreignKey: 'id_tipo_comprobante', // La FK que está en la tabla 'obligacion_financiera'
        as: 'obligaciones_financieras' // Usamos éste prefijo para obtener los datos del otro modelo (todas las obligaciones financieras de un tipo de comprobante)
    });

};

module.exports = Tipo_Comprobante;