const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Modalidad_Clase = sequelize.define('Modalidad_Clase', {
    id_modalidad: {
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
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'modalidad_clase', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Modalidad_Clase.associate = (models) => {

    // Una modalidad de clase puede aparecer muchas veces en "grupo"
    Modalidad_Clase.hasMany(models.Grupo, {
        foreignKey: 'id_modalidad', // La FK que está en la tabla 'grupo'
        as: 'grupos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los grupos de una modalidad de clase)
    });

};

module.exports = Modalidad_Clase;