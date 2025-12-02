// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Asignacion_Horario_Grupo = sequelize.define('Asignacion_Horario_Grupo', {
    id_asignacion : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },


    // ===============================================
    // clave foránea para el grupo
    // ===============================================
    id_grupo : {
        type: DataTypes.INTEGER,
        allowNull: false, // Debe ser true, ya que sólo se van a crear cuentas hijas de las cuentas base
        references: {
            // Nombre exacto de la tabla foránea en la base de datos
            model: 'grupo', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_grupo'
        },
        // El nombre del grupo: 'asignacion_unica ' (para hacer una restriccion con varias columnas)
        unique: 'asignacion_unica'
    },
    

    // ===============================================
    // clave foránea para el bloque horario
    // ===============================================
    id_bloque : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            // Nombre exacto de la tabla foránea en la base de datos
            model: 'bloque_horario',

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_bloque'
        },
        // El nombre del grupo: 'asignacion_unica ' (para hacer una restriccion con varias columnas)
        unique: 'asignacion_unica'
    }


}, {
    // Configuraciones de Sequelize:
    tableName: 'asignacion_horario_grupo', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Asignacion_Horario_Grupo.associate = (models) => {
    
    // Una asignacion solo puede tener un bloque horario de "bloque_horario"
    Asignacion_Horario_Grupo.belongsTo(models.Bloque_Horario, {
        foreignKey: 'id_bloque', // La clave que está en esta misma tabla
        as: 'bloque' // Usamos éste prefijo para obtener los datos del otro modelo (el bloque de una asignacion)
    });

    // Una asignacion solo puede tener un grupo de "grupo"
    Asignacion_Horario_Grupo.belongsTo(models.Grupo, {
        foreignKey: 'id_grupo', // La clave que está en esta misma tabla
        as: 'grupo' // Usamos éste prefijo para obtener los datos del otro modelo (el grupo de una asignacion)
    });

};

module.exports = Asignacion_Horario_Grupo;