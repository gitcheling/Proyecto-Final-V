// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Categoria_Curso = sequelize.define('Categoria_Curso', {
    id_categoria_curso: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    estado: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    },
}, {
    // Configuraciones de Sequelize:
    tableName: 'categoria_curso', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Categoria_Curso.associate = (models) => {

    // Una categoría puede aparecer muchas veces en "curso"
    Categoria_Curso.hasMany(models.Curso, {
        foreignKey: 'id_categoria', // La FK que está en la tabla 'curso'
        as: 'cursos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los cursos de una categoría)
    });
    
};


module.exports = Categoria_Curso;