const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Grupo = sequelize.define('Estado_Grupo', {
    id_estado_grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    permite_inscripcion: {
        type:DataTypes.BOOLEAN,
        allowNull: false 
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_grupo', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Grupo.associate = (models) => {

    // Un estado de grupo puede aparecer muchas veces en "grupo"
    Estado_Grupo.hasMany(models.Grupo, {
        foreignKey: 'id_estado', // La FK que está en la tabla 'grupo'
        as: 'grupos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los grupos de un estado de grupo)
    });

};

module.exports = Estado_Grupo;