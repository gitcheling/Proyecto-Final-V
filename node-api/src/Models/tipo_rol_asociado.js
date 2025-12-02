const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Tipo_Rol_Asociado = sequelize.define('Tipo_Rol_Asociado', {
    id_tipo_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true 
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_rol_asociado', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Tipo_Rol_Asociado.associate = (models) => {

    // Un tipo de rol puede aparecer muchas veces en "entidad_cuenta_asociacion"
    Tipo_Rol_Asociado.hasMany(models.Entidad_Cuenta_Asociacion, {
        foreignKey: 'id_tipo_rol', // La FK que está en la tabla 'entidad_cuenta_asociacion'
        as: 'asociación' // Usamos éste prefijo para obtener los datos del otro modelo (todas las asociaciones de cuenta bancaria de un tipo de rol)
    });

};

module.exports = Tipo_Rol_Asociado;
