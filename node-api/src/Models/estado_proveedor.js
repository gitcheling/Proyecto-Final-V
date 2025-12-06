const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Estado_Proveedor = sequelize.define('Estado_Proveedor', {
    id_estado_proveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    permite_pago: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_proveedor', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Proveedor.associate = (models) => {

    // Un estado proveedor puede aparecer muchas veces en "proveedor"
    Estado_Proveedor.hasMany(models.Proveedor, {
        foreignKey: 'id_estado_proveedor', // La FK que está en la tabla 'proveedor'
        as: 'proveedores' // Usamos éste prefijo para obtener los datos del otro modelo (todos los proveedores de un estado proveedor)
    });
    
};

module.exports = Estado_Proveedor;