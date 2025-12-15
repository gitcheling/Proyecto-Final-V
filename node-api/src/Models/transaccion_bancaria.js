// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Transaccion_Bancaria = sequelize.define('Transaccion_Bancaria', {

    // ===============================================
    // clave foránea (y primaria)
    // ===============================================
    id_transaccion: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        primaryKey: true, 
        autoIncrement: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'registro_transaccion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_transaccion'
        }
    },



    // ===============================================
    // clave foránea para la cuenta bancaria de origen
    // ===============================================
    id_cuenta_origen: {
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
    // clave foránea para la cuenta bancaria de destino
    // ===============================================
    id_cuenta_destino: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'cuenta_bancaria', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_cuenta_bancaria'
        }
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'transaccion_bancaria', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Transaccion_Bancaria.associate = (models) => {


    // Una transacción solo puede tener un registro en "registro_transaccion"
    Transaccion_Bancaria.belongsTo(models.Registro_Transaccion, {
        foreignKey: 'id_obligacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'registro_transaccion' 
    });

    // Una transacción solo puede tener una cuenta de origen
    Transaccion_Bancaria.belongsTo(models.Cuenta_Bancaria, {
        foreignKey: 'id_cuenta_origen', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'cuenta_origen' 
    });

    // Una transacción solo puede tener una cuenta de destino
    Transaccion_Bancaria.belongsTo(models.Cuenta_Bancaria, {
        foreignKey: 'id_cuenta_destino', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'cuenta_destino'
    });


};

module.exports = Transaccion_Bancaria;