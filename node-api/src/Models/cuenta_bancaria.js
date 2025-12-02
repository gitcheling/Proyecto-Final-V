// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Cuenta_Bancaria = sequelize.define('Cuenta_Bancaria', {
    id_cuenta_bancaria: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    numero_cuenta: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // El nombre del grupo: 'cuenta_unica ' (para hacer una restriccion con varias columnas)
        unique: 'cuenta_unica'
    },

    // ===============================================
    // clave foránea para el tipo de cuenta
    // ===============================================
    id_tipo_cuenta: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_cuenta_bancaria', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tipo_cuenta'
        }
    },

    // ===============================================
    // clave foránea para el banco
    // ===============================================
    id_banco: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'banco', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_banco'
        },
        // El nombre del grupo: 'cuenta_unica ' (para hacer una restriccion con varias columnas)
        unique: 'cuenta_unica'
    },

    // ===============================================
    // clave foránea para la entidad titular de la cuenta
    // ===============================================
    id_entidad_titular: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'entidad', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_entidad'
        },

    },

    // ===============================================
    // clave foránea para el estado de la cuenta
    // ===============================================
    id_estado_cuenta: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_cuenta_bancaria', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estado_cuenta'
        },

    },


    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    approvedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'cuenta_bancaria', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Cuenta_Bancaria.associate = (models) => {

    // Una cuenta bancaria solo puede tener un tipo de cuenta de "tipo_cuenta_bancaria"
    Cuenta_Bancaria.belongsTo(models.Tipo_Cuenta_Bancaria, {
        foreignKey: 'id_tipo_cuenta', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_cuenta' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de cuenta de una cuenta bancaria)
    });

    // Una cuenta bancaria solo puede tener un tipo de estado de "estado_cuenta_bancaria"
    Cuenta_Bancaria.belongsTo(models.Estado_Cuenta_Bancaria, {
        foreignKey: 'id_estado_cuenta', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_cuenta' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de cuenta de una cuenta bancaria)
    });

    // Una cuenta bancaria solo puede tener un banco de "banco"
    Cuenta_Bancaria.belongsTo(models.Banco, {
        foreignKey: 'id_banco', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'banco' // Usamos éste prefijo para obtener los datos del otro modelo (el banco de una cuenta bancaria)
    });

    // Una cuenta bancaria solo puede tenera entidad titular de "entidad"
    Cuenta_Bancaria.belongsTo(models.Entidad, {
        foreignKey: 'id_entidad_titular', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'entidad' // Usamos éste prefijo para obtener los datos del otro modelo (la entidad titular de una cuenta bancaria)
    });

  
    // Una cuenta bancaria puede tener muchas entidades asociadas con "entidad" en la tabla intermedia "entidad_cuenta_asociacion"
    Cuenta_Bancaria.belongsToMany(models.Entidad, {
        through: models.Entidad_Cuenta_Asociacion, // El modelo de la tabla intermedia
        foreignKey: 'id_cuenta_bancaria', // La FK que este modelo (cuenta_bancaria) tiene en la tabla intermedia (entidad_cuenta_asociacion)
        otherKey: 'id_entidad_asociada', // La FK del otro modelo (entidad) tiene en la tabla intermedia (entidad_cuenta_asociacion)
        as: 'entidades_pago' // Usamos éste prefijo para obtener los datos del otro modelo (todas las entidades de pago asociadas a una cuenta bancaria)
    });

};

module.exports = Cuenta_Bancaria;