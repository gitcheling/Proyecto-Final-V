// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Asignacion_Docente = sequelize.define('Asignacion_Docente', {
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
        unique: true
    },
    

    // ===============================================
    // clave foránea para el docente
    // ===============================================
    id_docente  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            // Nombre exacto de la tabla foránea en la base de datos
            model: 'docente',

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_docente'
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
    tableName: 'asignacion_docente', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Asignacion_Docente.associate = (models) => {
    
    // Una asignación solo puede tener un docente de "docente"
    Asignacion_Docente.belongsTo(models.Docente, {
        foreignKey: 'id_docente', // La clave que está en esta misma tabla
        as: 'docente' // Usamos éste prefijo para obtener los datos del otro modelo (el docente de una asignación)
    });


    // Una asignación solo puede tener un grupo de "grupo"
    Asignacion_Docente.belongsTo(models.Grupo, {
        foreignKey: 'id_grupo', // La clave que está en esta misma tabla
        as: 'grupo' // Usamos éste prefijo para obtener los datos del otro modelo (el grupo de una asignación)
    });


    // Una asignación solo puede tener una tarifa de "tarifa_docente_grupo"
    Asignacion_Docente.hasOne(models.Tarifa_Docente_Grupo, {
        foreignKey: 'id_asignacion', // La FK que está en la tabla "tarifa_docente_grupo"
        as: 'tarifa' // Usamos éste prefijo para obtener los datos del otro modelo (la tarifa de una asignación)
    });

};

module.exports = Asignacion_Docente;