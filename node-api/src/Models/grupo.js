const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Grupo = sequelize.define('Grupo', {
    id_grupo : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el curso
    // ===============================================
    id_curso : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'curso', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_curso'
        }
    },

    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    fecha_inicio: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    fecha_fin: {
        type: DataTypes.DATEONLY, 
        allowNull: true //Permite nulos
    },

    cupo_maximo  : {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // ===============================================
    // clave foránea para el estado de grupo
    // ===============================================
    id_estado_grupo : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_grupo', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estado_grupo'
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
    tableName: 'grupo', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Grupo.associate = (models) => {

    // Un grupo solo puede tener un estado de grupo
    Grupo.belongsTo(models.Estado_Grupo, {
        foreignKey: 'id_estado_grupo', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_grupo' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de grupo de un grupo)
    });


    // Un grupo solo puede tener un curso de "curso"
    Grupo.belongsTo(models.Tipo_Identificacion, {
        foreignKey: 'id_curso', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'curso' // Usamos éste prefijo para obtener los datos del otro modelo (el curso de un grupo)
    });


    // Un grupo puede aparecer muchas veces en "asignacion_horario_grupo"
    Grupo.hasMany(models.Asignacion_Horario_Grupo, {
        foreignKey: 'id_grupo', // La FK que está en la tabla 'asignacion_horario_grupo'
        as: 'asignaciones' // Usamos éste prefijo para obtener los datos del otro modelo (todas las asignaciones de un grupo)
    });


    // Un grupo solo puede tener una asignación de "asignacion_docente"
    Grupo.hasOne(models.Asignacion_Docente, {
        foreignKey: 'id_grupo', // La FK que está en la tabla 'asignacion_docente'
        as: 'asignacion' // Usamos éste prefijo para obtener los datos del otro modelo (la asignación de un grupo)
    });


    // Un grupo puede aparecer muchas veces en "inscripcion"
    Grupo.hasMany(models.Inscripcion, {
        foreignKey: 'id_grupo', // La FK que está en la tabla 'inscripcion'
        as: 'inscripciones' // Usamos éste prefijo para obtener los datos del otro modelo (todas las inscripciones de un grupo)
    });


    // Un grupo puede aparecer muchas veces en "registro_horas"
    Grupo.hasMany(models.Registro_Horas, {
        foreignKey: 'id_grupo', // La FK que está en la tabla 'registro_horas'
        as: 'horas_registradas' // Usamos éste prefijo para obtener los datos del otro modelo (todas las horas registradas de un grupo)
    });
};

module.exports = Grupo;