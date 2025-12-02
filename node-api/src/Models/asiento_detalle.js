// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Asiento_Detalle = sequelize.define('Asiento_Detalle', {
    id_detalle : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el encabezado del asiento
    // ===============================================
    id_asiento : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'asiento_encabezado', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_asiento'
        }
    },

    // ===============================================
    // clave foránea para la cuenta afectada del plan de cuentas
    // ===============================================
    id_plan_cuenta: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'plan_cuenta', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_plan_cuenta'
        }
    },

    monto: {
        type: DataTypes.NUMERIC(12, 2), // 12 dígitos en total, 2 decimales 
        allowNull: false,
        defaultValue: 0
    },


    // ===============================================
    // clave foránea para la naturaleza del movimiento 
    // ===============================================
    naturaleza_movimiento: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'naturaleza', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_naturaleza'
        }
    },

    descripcion : {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'asiento_detalle', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Asiento_Detalle.associate = (models) => {

    // Un detalle de asiento solo puede tener un encabezado de "asiento_encabezado"
    Asiento_Detalle.belongsTo(models.Asiento_Encabezado, {
        foreignKey: 'id_asiento', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'encabezado' // Usamos éste prefijo para obtener los datos del otro modelo (el encabezado de un detalle de asiento)
    });


    // Un detalle de asiento solo puede tener una naturaleza de "naturaleza"
    Asiento_Detalle.belongsTo(models.Naturaleza, {
        foreignKey: 'id_naturaleza', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'naturaleza' // Usamos éste prefijo para obtener los datos del otro modelo (la naturaleza de un detalle de asiento)
    });


    // Un detalle de asiento solo puede tener una cuenta de "plan_cuenta"
    Asiento_Detalle.belongsTo(models.Plan_Cuenta, {
        foreignKey: 'id_plan_cuenta', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'cuenta' // Usamos éste prefijo para obtener los datos del otro modelo (la cuenta de un detalle de asiento)
    });

};

module.exports = Asiento_Detalle;