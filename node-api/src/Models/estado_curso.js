// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Curso = sequelize.define('Estado_Curso', {
    id_estado_curso: {
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
        type: DataTypes.STRING(255),
        allowNull: false
    },
    permite_nuevos_grupos: {
        type:DataTypes.BOOLEAN,
        allowNull: false 
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_curso', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Curso.associate = (models) => {

    //Un estado de curso puede aparecer muchas veces en "curso"
    Estado_Curso.hasMany(models.Curso, {
        foreignKey: 'id_estado', // La FK que está en la tabla 'curso'
        as: 'cursos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los cursos de un estado de curso)
    }); 

};


module.exports = Estado_Curso;