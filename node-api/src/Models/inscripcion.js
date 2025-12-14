const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Inscripcion = sequelize.define('Inscripcion', {
    id_inscripcion : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },


    // ===============================================
    // clave foránea para el grupo 
    // ===============================================
    id_grupo : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'grupo', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_grupo'
        },
        // El nombre del grupo: 'inscripcion_unica ' (para hacer una restriccion con varias columnas)
        unique: 'inscripcion_unica'
    },


    // ===============================================
    // clave foránea para el estudiante
    // ===============================================
    id_estudiante : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estudiante', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estudiante'
        },
        // El nombre del grupo: 'inscripcion_unica ' (para hacer una restriccion con varias columnas)
        unique: 'inscripcion_unica'
    },

   
    // ===============================================
    // clave foránea para el estado de la inscripción
    // ===============================================
    id_estado : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_inscripcion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estado_inscripcion'
        }
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'inscripcion', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Inscripcion.associate = (models) => {

    // Una inscripcion solo puede tener un estudiante de "estudiante"
    Inscripcion.belongsTo(models.Estudiante, {
        foreignKey: 'id_estudiante', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estudiante' // Usamos éste prefijo para obtener los datos del otro modelo (el estudiante de una inscripción)
    });

    // Una inscripcion solo puede tener un grupo de "grupo"
    Inscripcion.belongsTo(models.Grupo, {
        foreignKey: 'id_grupo', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'grupo' // Usamos éste prefijo para obtener los datos del otro modelo (el grupo de una inscripción)
    });

    // Una inscripcion solo puede tener un estado de incripción de "estado_inscripcion"
    Inscripcion.belongsTo(models.Estado_Inscripcion, {
        foreignKey: 'id_estado', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_inscripcion' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de inscripción de una inscripción)
    });


    //Una inscripción puede aparecer muchas veces en "obligacion_inscripcion"
    Inscripcion.hasMany(models.Obligacion_Inscripcion, {
        foreignKey: 'id_inscripcion', // La FK que está en la tabla 'obligacion_inscripcion'
        as: 'obligaciones_inscripcion' // Usamos éste prefijo para obtener los datos del otro modelo (todas las obligaciones de inscripción de una inscripción)
    }); 

};

module.exports = Inscripcion;