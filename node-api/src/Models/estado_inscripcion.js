const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Inscripcion = sequelize.define('Estado_Inscripcion', {
    id_estado_inscripcion: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    ciclo_cerrado: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    },
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_inscripcion', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Inscripcion.associate = (models) => {
    
    // Un estado de inscripción puede aparecer muchas veces en "inscripcion"
    Estado_Inscripcion.hasMany(models.Inscripcion, {
        foreignKey: 'id_estado_inscripcion', // La FK que está en la tabla 'inscripcion'
        as: 'inscripciones' // Usamos éste prefijo para obtener los datos del otro modelo (todas las inscripciones de un estado de inscripcion)
    });

};




module.exports = Estado_Inscripcion;