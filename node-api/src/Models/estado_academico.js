// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Academico = sequelize.define('Estado_Academico', {
    id_estado_academico: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(120),
        allowNull: false
    },
    permite_inscripcion: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    },
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_academico', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Academico.associate = (models) => {

    // Un estado académico puede aparecer muchas veces en "estudiante"
    Estado_Academico.hasMany(models.Estudiante, {
        foreignKey: 'id_estado_academico', // La FK que está en la tabla 'estudiante'
        as: 'estudiantes' // Usamos éste prefijo para obtener los datos del otro modelo (todos los estudiantes de un estado académico)
    });

};


module.exports = Estado_Academico;