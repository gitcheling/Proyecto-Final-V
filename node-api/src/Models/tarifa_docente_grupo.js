const {DataTypes} = require('sequelize');
const sequelize = require('../Config/database');


const Tarifa_Docente_Grupo = sequelize.define('Tarifa_Docente_Grupo',{
    id_tarifa :{
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la asignación
    // ===============================================
    id_asignacion: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'asignacion_docente', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_asignacion'
        },
        unique: true
    },

    tarifa_hora_usd: {
        type: DataTypes.NUMERIC(8, 2), // 8 dígitos en total, 2 decimales 
        allowNull: true
    },

    fecha_vigencia_desde: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    tableName: 'tarifa_docente_grupo', 
    timestamps: true,  
    
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Tarifa_Docente_Grupo.associate = (models) => {

    // Una tarifa solo puede tener una asignacion de "asignacion_docente"
    Tarifa_Docente_Grupo.hasOne(models.Asignacion_Docente, {
        foreignKey: 'id_asignacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'asignacion' // Usamos éste prefijo para obtener los datos del otro modelo (la asignacion de una tarifa)
    });
 
};

module.exports = Tarifa_Docente_Grupo;