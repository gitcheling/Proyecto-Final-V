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
        unique: 'grupo_unico',
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'curso', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_curso'
        }
    },

    // ===============================================
    // clave foránea para el periodo
    // ===============================================
    id_periodo : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        unique: 'grupo_unico',
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'periodo', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_periodo'
        }
    },

    // ===============================================
    // clave foránea para la modalidad
    // ===============================================
    id_modalidad : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'modalidad_clase', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_modalidad'
        }
    },

    // ===============================================
    // clave foránea para el docente
    // ===============================================
    id_docente : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'docente', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_docente'
        }
    },

    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: 'grupo_unico'
    },

    cupo_maximo  : {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    costo_inscripcion: {
        type: DataTypes.NUMERIC(10, 2), // 10 dígitos en total, 2 decimales 
        allowNull: false
    },

    costo_unitario_clase: {
        type: DataTypes.NUMERIC(10, 2), // 10 dígitos en total, 2 decimales 
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
        as: 'estado_grupo' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de un grupo)
    });


    // Un grupo solo puede tener un curso de "curso"
    Grupo.belongsTo(models.Curso, {
        foreignKey: 'id_curso', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'curso' // Usamos éste prefijo para obtener los datos del otro modelo (el curso de un grupo)
    });


    // Un grupo solo puede tener un periodo de "periodo"
    Grupo.belongsTo(models.Periodo, {
        foreignKey: 'id_periodo', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'periodo' // Usamos éste prefijo para obtener los datos del otro modelo (el periodo de un grupo)
    });

    // Un grupo solo puede tener una modalidad de "modalidad_clase"
    Grupo.belongsTo(models.Modalidad_Clase, {
        foreignKey: 'id_modalidad', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'modalidad' // Usamos éste prefijo para obtener los datos del otro modelo (la modalidad de clase de un grupo)
    });


    // Un grupo solo puede tener un docente de "docente"
    Grupo.belongsTo(models.Docente, {
        foreignKey: 'id_docente', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'docente' // Usamos éste prefijo para obtener los datos del otro modelo (el docente de un curso)
    });














    // --------------------------- Revision ------------------------

    // Un grupo puede aparecer muchas veces en "asignacion_horario_grupo"
    Grupo.hasMany(models.Asignacion_Horario_Grupo, {
        foreignKey: 'id_grupo', // La FK que está en la tabla 'asignacion_horario_grupo'
        as: 'asignaciones' // Usamos éste prefijo para obtener los datos del otro modelo (todas las asignaciones de un grupo)
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