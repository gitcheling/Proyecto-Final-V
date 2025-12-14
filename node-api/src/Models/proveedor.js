const {DataTypes} = require('sequelize');
const sequelize = require('../Config/database');


const Proveedor = sequelize.define('Proveedor',{
    id_proveedor  :{
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true, // Unico en éste lado de la relación para garantizar el 1 a 1 con la tabla Entidad
         references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'entidad', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_entidad'
        }
    },

           
    // ===============================================
    // clave foránea para el tipo de proveedor
    // ===============================================
    id_tipo_proveedor  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

             // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_proveedor', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria       
            key: 'id_tipo_proveedor'
        }
    },


    // ===============================================
    // clave foránea para el estado de proveedor
    // ===============================================
    id_estado_proveedor  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

             // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_proveedor', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria       
            key: 'id_estado_proveedor'
        }
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    
}, {
    tableName: 'proveedor', 
    timestamps: true,  
    
});



// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Proveedor.associate = (models) => {

    // Un proveedor solo puede tener una entidad de "entidad"
    Proveedor.belongsTo(models.Entidad, {
        foreignKey: 'id_proveedor', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'entidad' // Usamos éste prefijo para obtener los datos del otro modelo (la entidad de un docente)
    });


    // Un proveedor solo puede tener tipo de proveedor de "tipo_proveedor"
    Proveedor.belongsTo(models.Tipo_Proveedor, {
        foreignKey: 'id_tipo_proveedor', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_proveedor' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de proveedor de un proveedor)
    });


    // Un proveedor solo puede tener un estado de "estado_proveedor"
    Proveedor.belongsTo(models.Estado_Proveedor, {
        foreignKey: 'id_estado_proveedor', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado_proveedor' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de un proveedor)
    });


};

module.exports = Proveedor;