const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Tipo_Identificacion = sequelize.define('Tipo_Identificacion', {
    id_tipo_identificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    abreviatura: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_identificacion', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Tipo_Identificacion.associate = (models) => {

    Tipo_Identificacion.belongsToMany(models.Prefijo_Identificacion, {
        through: models.Regla_Prefijo_Documento, // El modelo de la tabla intermedia
        foreignKey: 'id_tipo_identificacion',  // La FK que este modelo (tipo_identificacion) tiene en la tabla intermedia (regla_prefijo_documento)
        otherKey: 'id_prefijo',  // La FK del otro modelo (prefijo_identificacion) tiene en la tabla intermedia (regla_prefijo_documento)
        as: 'prefijos_sociados', // Usamos éste prefijo para obtener los datos del otro modelo (todos los prefijos asociados a un tipo de identificación)
    });
    

    // Un tipo de identificación puede aparecer muchas veces en "entidad"
    Tipo_Identificacion.hasMany(models.Entidad, {
        foreignKey: 'id_tipo_identificacion', // La FK que está en la tabla 'regla_prefijo_documento'
        as: 'entidades' // Usamos éste prefijo para obtener los datos del otro modelo (todas las entidades de un tipo de identificación)
    });

};



module.exports = Tipo_Identificacion;