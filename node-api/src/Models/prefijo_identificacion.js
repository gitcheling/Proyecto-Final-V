const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Prefijo_Identificacion = sequelize.define('Prefijo_Identificacion', {
    id_prefijo: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    letra_prefijo: {
        type: DataTypes.CHAR(1),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'prefijo_identificacion', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Prefijo_Identificacion.associate = (models) => {
    
    Prefijo_Identificacion.belongsToMany(models.Tipo_Identificacion, {
        through: models.Regla_Prefijo_Documento, // El modelo de la tabla intermedia
        foreignKey: 'id_prefijo',  // La FK que este modelo (prefijo_identificacion) tiene en la tabla intermedia (regla_prefijo_documento)
        otherKey: 'id_tipo_identificacion', // La FK del otro modelo (tipo_identificacion) tiene en la tabla intermedia (regla_prefijo_documento)
        as: 'tipos_asociados', // Usamos éste prefijo para obtener los datos del otro modelo (todos los tipo de identificación asociados a un prefijo)
    });
    

    // Un prefijo puede aparecer muchas veces en "Entidad"
    Prefijo_Identificacion.hasMany(models.Entidad, {
        foreignKey: 'id_prefijo', // La FK que está en la tabla 'entidad'
        as: 'entidades' // Usamos éste prefijo para obtener los datos del otro modelo (todas las entidades de un prefijo)
    });

};


module.exports = Prefijo_Identificacion;