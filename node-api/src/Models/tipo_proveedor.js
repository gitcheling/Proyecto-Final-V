const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Tipo_Proveedor = sequelize.define('Tipo_Proveedor', {
    id_tipo_proveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_proveedor', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Tipo_Proveedor.associate = (models) => {

    // Un tipo de proveedor puede aparecer muchas veces en "proveedor"
    Tipo_Proveedor.hasMany(models.Proveedor, {
        foreignKey: 'id_tipo_proveedor', // La FK que está en la tabla 'proveedor'
        as: 'proveedores' // Usamos éste prefijo para obtener los datos del otro modelo (todos los proveedores de un tipo de proveedor)
    });

};

module.exports = Tipo_Proveedor;