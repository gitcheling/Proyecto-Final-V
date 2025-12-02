const {DataTypes} = require('sequelize');

const sequelize = require('../Config/database');


const Bloque_Horario = sequelize.define('Bloque_Horario',{
    id_bloque   :{
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el día
    // ===============================================
    id_dia: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'dia', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_dia'
        },
        // El nombre del grupo: 'bloque_unico ' (para hacer una restriccion con varias columnas)
        unique: 'bloque_unico'
        
    },

    bloque_numero: {
        type:DataTypes.INTEGER,
        allowNull: false,
        // El nombre del grupo: 'bloque_unico ' (para hacer una restriccion con varias columnas)
        unique: 'bloque_unico'
    },
   
    hora_inicio: {
        type: DataTypes.TIME, 
        allowNull: false
    },

    hora_fin : {
        type: DataTypes.TIME, 
        allowNull: false
    },

    nombre : {
        type:DataTypes.STRING(50),
        allowNull: false
    }
   

}, {
    tableName: 'bloque_horario', 
    timestamps: false,  
    
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Bloque_Horario.associate = (models) => {

    // Un bloque horario solo puede tener un día de "dia"
    Bloque_Horario.belongsTo(models.Dia, {
        foreignKey: 'id_dia', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'dia' // Usamos éste prefijo para obtener los datos del otro modelo (el día de un bloque horario)
    });

    // Un bloque horario puede aparecer muchas veces en "asignacion_horario_grupo"
    Bloque_Horario.hasMany(models.Asignacion_Horario_Grupo, {
        foreignKey: 'id_bloque', // La FK que está en la tabla 'asignacion_horario_grupo'
        as: 'asignaciones' // Usamos éste prefijo para obtener los datos del otro modelo (todas las asignaciones de un bloque horario)
    });

};

module.exports = Bloque_Horario;