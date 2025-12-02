const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Plan_Pago = sequelize.define('Plan_Pago', {
    id_plan_pago  : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la inscripción
    // ===============================================
    id_inscripcion  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'inscripcion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_inscripcion'
        }
    },

    numero_cuota   : {
        type: DataTypes.INTEGER, 
        allowNull: false, 
    },

    monto_cuota_usd : {
        type: DataTypes.NUMERIC(8, 2), // 8 dígitos en total, 2 decimales 
        allowNull: false
    },

    fecha_vencimiento: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    // ===============================================
    // clave foránea para el estado del plan 
    // ===============================================
    id_estado_plan: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_plan', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estado_plan'
        },
        // El nombre del grupo: 'inscripcion_unica ' (para hacer una restriccion con varias columnas)
        unique: 'inscripcion_unica'
    },

    // ===============================================
    // clave foránea para el estado de la inscripción
    // ===============================================
    id_estado_inscripcion : {
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
    tableName: 'plan_pago', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Plan_Pago.associate = (models) => {

    // Un plan de pago solo puede tener un estado de plan de "estado_plan"
    Plan_Pago.belongsTo(models.Estado_Plan, {
        foreignKey: 'id_estado_plan', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_plan' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de un plan de pago)
    });

    // Un plan de pago solo puede tener una inscripción de plan de "inscripcion"
    Plan_Pago.belongsTo(models.Inscripcion, {
        foreignKey: 'id_inscripcion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'inscripcion' // Usamos éste prefijo para obtener los datos del otro modelo (la inscripción de un plan de pago)
    });

    // Un plan de pago puede aparecer muchas veces en "pagos_estudiantes"
    Plan_Pago.hasMany(models.Pagos_Estudiantes, {
        foreignKey: 'id_plan_pago', // La FK que está en la tabla 'pagos_estudiantes'
        as: 'pagos_estudiantes' // Usamos éste prefijo para obtener los datos del otro modelo (todos los pagos de estudiantes de un plan de pago)
    });

};

module.exports = Plan_Pago;