// Se importa la conexión y los tipos de datos
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/database');


const Detalle_Factura = sequelize.define('Detalle_Factura', {
    id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la factura de gasto
    // ===============================================
    id_factura_gasto: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'facturas_gasto', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_factura_gasto'
        }
    },

    descripcion: {
        type: DataTypes.STRING(255), 
        allowNull: false
    },


    // ===============================================
    // clave foránea para la cuenta de gasto afectada del plan de cuentas
    // ===============================================
    id_cuenta_gasto: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'plan_cuenta', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_plan_cuenta'
        }
    },

    monto_usd: {
        type: DataTypes.NUMERIC(12, 2), // 12 dígitos en total, 2 decimales 
        allowNull: false
    },

    monto_ves: {
        type: DataTypes.NUMERIC(12, 2), // 12 dígitos en total, 2 decimales 
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
    tableName: 'detalle_factura', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Detalle_Factura.associate = (models) => {

    // Un detalle de factura solo puede tener una factura de gasto de "facturas_gasto"
    Detalle_Factura.belongsTo(models.Facturas_Gasto, {
        foreignKey: 'id_factura_gasto', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'factura_gasto' // Usamos éste prefijo para obtener los datos del otro modelo (la factura de gasto de un detalle de factura)
    });


    // Un detalle de factura solo puede tener una cuenta de de gasto de "plan_cuenta"
    Detalle_Factura.belongsTo(models.Plan_Cuenta, {
        foreignKey: 'id_cuenta_gasto', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'cuenta_gasto' // Usamos éste prefijo para obtener los datos del otro modelo (la cuenta de gasto de un detalle de factura)
    });


};

module.exports = Detalle_Factura;