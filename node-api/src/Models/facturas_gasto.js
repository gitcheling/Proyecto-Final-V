const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/database');


const Facturas_Gasto = sequelize.define('Facturas_Gasto', {
    id_factura_gasto: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el proveedor 
    // ===============================================
    id_proveedor: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'proveedor', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_proveedor'
        }
    },

    numero_factura: {
        type: DataTypes.STRING(50), 
        allowNull: false
    },


    fecha_emision: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    fecha_vencimiento : {
        type: DataTypes.DATEONLY, 
        allowNull: true
    },

    // ===============================================
    // clave foránea para el tipo de comprobante
    // ===============================================
    id_tipo_comprobante: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_comprobante', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_comprobante'
        }
    },

    monto_total : {
        type: DataTypes.NUMERIC(12, 2), // 12 dígitos en total, 2 decimales 
        allowNull: false
    },


    // ===============================================
    // clave foránea para la divisa 
    // ===============================================
    divisa_factura: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'divisa', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_divisa'
        }
    },

    // ===============================================
    // clave foránea para la tasa de cambio  
    // ===============================================
    id_tasa_registro: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tasa_cambio', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tasa_cambio'
        }
    },

    // ===============================================
    // clave foránea para el estado de la factura  
    // ===============================================
    id_estado_factura: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_factura', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estado_factura'
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
    tableName: 'facturas_gasto', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Facturas_Gasto.associate = (models) => {

    // Una factura de gasto solo puede tener un estado de factura "estado_factura"
    Facturas_Gasto.belongsTo(models.Estado_Factura, {
        foreignKey: 'id_estado_factura', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_factura' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de factura de una factura de gasto)
    });


    // Una factura de gasto solo puede tener un proveedor de "proveedor"
    Facturas_Gasto.belongsTo(models.Estado_Factura, {
        foreignKey: 'id_proveedor', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'proveedor' // Usamos éste prefijo para obtener los datos del otro modelo (el proveedor de una factura de gasto)
    });


    // Una factura de gasto solo puede tener una tasa de cambio de "tasa_cambio"
    Facturas_Gasto.belongsTo(models.Tasa_Cambio, {
        foreignKey: 'id_tasa_registro', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tasa_cambio' // Usamos éste prefijo para obtener los datos del otro modelo (la tasa de cambio de una factura de gasto)
    });


    // Una factura de gasto solo puede tener una divisa de "divisa"
    Facturas_Gasto.belongsTo(models.Divisa, {
        foreignKey: 'divisa_factura', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'divisa' // Usamos éste prefijo para obtener los datos del otro modelo (la divisa de una factura de gasto)
    });


    // Una factura de gasto solo puede tener un tipo de comprobante de "tipo_comprobante"
    Facturas_Gasto.belongsTo(models.Tipo_Comprobante, {
        foreignKey: 'id_tipo_comprobante', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_comprobante' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de comprobante de una factura de gasto)
    });


    // Una factura de gasto puede aparecer muchas veces en "detalle_factura"
    Facturas_Gasto.hasMany(models.Detalle_Factura, {
        foreignKey: 'id_factura_gasto', // La FK que está en la tabla 'detalle_factura'
        as: 'detalle_factura' // Usamos éste prefijo para obtener los datos del otro modelo (todos los detalles de factura de una factura de gasto)
    });


    // Una factura de gasto puede aparecer muchas veces en "pagos_proveedores"
    Facturas_Gasto.hasMany(models.Pagos_Proveedores, {
        foreignKey: 'id_factura_gasto', // La FK que está en la tabla 'pagos_proveedores'
        as: 'pagos_proveedor' // Usamos éste prefijo para obtener los datos del otro modelo (todos los pagos de proveedor de una factura de gasto)
    });


};

module.exports = Facturas_Gasto;