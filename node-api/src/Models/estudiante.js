const {DataTypes} = require('sequelize');
const sequelize = require('../Config/database');


const Estudiante = sequelize.define('Estudiante',{
    id_estudiante:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true, // Unico en éste lado de la relación para garantizar el 1 a 1 con la tabla Entidad
         references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'entidad', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_entidad'
        }
    },
    codigo_estudiantil: {
        type:DataTypes.STRING(8),
        allowNull: false, // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
        unique: true,
    },
   
                      
    // ===============================================
    // clave foránea para el estado académico
    // ===============================================
    id_estado_academico: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            /* La tabla foránea (ya que "id_padre" es una clave foránea en la base de datos, y en este caso se referencia a la misma tabla
            por recursividad) */
            model: 'estado_academico', 

            // La columna de la tabla foránea
            key: 'id_estado_academico'
        }
    },
    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    tableName: 'estudiante', 
    timestamps: true,  
    
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estudiante.associate = (models) => {

    // Un estudiante solo puede tener una entidad de "entidad"
    Estudiante.belongsTo(models.Entidad, {
        foreignKey: 'id_estudiante', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'entidad' // Usamos éste prefijo para obtener los datos del otro modelo (la entidad de un estudiante)
    });


    // Un estudiante solo puede tener una estado académico de "estado_Academico"
    Estudiante.belongsTo(models.Estado_Academico, {
        foreignKey: 'id_estado_academico', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_academico' // Usamos éste prefijo para obtener los datos del otro modelo (el estado académico de un estudiante)
    });


    // Un estudiante puede aparecer muchas veces en "inscripcion"
    Estudiante.hasMany(models.Inscripcion, {
        foreignKey: 'id_estudiante', // La FK que está en la tabla 'inscripcion'
        as: 'inscripciones' // Usamos éste prefijo para obtener los datos del otro modelo (todas las inscripciones de un estudiante)
    });

    
};

module.exports = Estudiante;