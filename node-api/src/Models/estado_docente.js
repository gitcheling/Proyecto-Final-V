const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Estado_Docente = sequelize.define('Estado_Docente', {
    id_estado_docente: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    permite_asignacion: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    },
    aplica_pago: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_docente', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Docente.associate = (models) => {

    // Un estado docente puede aparecer muchas veces en "docente"
    Estado_Docente.hasMany(models.Docente, {
        foreignKey: 'id_estado_docente', // La FK que está en la tabla 'docente'
        as: 'docentes' // Usamos éste prefijo para obtener los datos del otro modelo (todos los docentes de un estado docente)
    });
    
};

module.exports = Estado_Docente;