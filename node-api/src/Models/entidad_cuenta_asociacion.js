// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Entidad_Cuenta_Asociacion = sequelize.define('Entidad_Cuenta_Asociacion', {

    id_asociacion : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la cuenta bancaria
    // ===============================================
    id_cuenta_bancaria: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'cuenta_bancaria', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_cuenta_bancaria'
        }
    },

    // ===============================================
    // clave foránea para la entidad pagada 
    // ===============================================
    id_entidad_asociada: {
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
    // clave foránea para el tipo de rol 
    // ===============================================
    id_tipo_rol : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_rol_asociado', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tipo_rol'
        }
    },

    es_vigente: {
        type:DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },


    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'entidad_cuenta_asociacion', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Entidad_Cuenta_Asociacion.associate = (models) => {

    // Una asociación bancaria solo puede tener un tipo de rol de "tipo_rol_asociado"
    Entidad_Cuenta_Asociacion.belongsTo(models.Tipo_Rol_Asociado, {
        foreignKey: 'id_tipo_rol', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_rol' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de rol de una asociacion de cuenta bancaria)
    });

};

module.exports = Entidad_Cuenta_Asociacion;