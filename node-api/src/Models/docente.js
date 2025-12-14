const {DataTypes} = require('sequelize');
const sequelize = require('../Config/database');


const Docente = sequelize.define('Docente',{
    id_docente :{
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
           
    // ===============================================
    // clave foránea para el estado docente
    // ===============================================
    id_estado_docente : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

             // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_docente', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria       
            key: 'id_estado_docente'
        }
    },
    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    tableName: 'docente', 
    timestamps: true,  
    
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Docente.associate = (models) => {

    // Un docente solo puede tener una entidad de "entidad"
    Docente.belongsTo(models.Entidad, {
        foreignKey: 'id_docente', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'entidad' // Usamos éste prefijo para obtener los datos del otro modelo (la entidad de un docente)
    });


    // Un docente solo puede tener estado docente de "estado_docente"
    Docente.belongsTo(models.Estado_Docente, {
        foreignKey: 'id_estado_docente', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_docente' // Usamos éste prefijo para obtener los datos del otro modelo (el estado docente de un docente)
    });


    // Un docente puede aparecer muchas veces en "grupo"
    Docente.hasMany(models.Grupo, {
        foreignKey: 'id_docente', // La FK que está en la tabla 'grupo'
        as: 'grupos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los grupos de un docente)
    });



};

module.exports = Docente;