const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Regla_Prefijo_Documento = sequelize.define('Regla_Prefijo_Documento', {
    id_regla: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },


    // ===============================================
    // clave foránea para el tipo_identificacion
    // ===============================================
    id_tipo_identificacion: {
        type: DataTypes.INTEGER,
        allowNull: false, // Debe ser true, ya que sólo se van a crear cuentas hijas de las cuentas base
        references: {
            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_identificacion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tipo_identificacion'
        }
    },
    

    // ===============================================
    // clave foránea para el prefijo_identificacion
    // ===============================================
    id_prefijo: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            // Nombre exacto de la tabla foránea en la base de datos
            model: 'prefijo_identificacion',

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_prefijo'
        }
    },



    es_obligatorio: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    },
}, {
    // Configuraciones de Sequelize:
    tableName: 'regla_prefijo_documento', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


module.exports = Regla_Prefijo_Documento;