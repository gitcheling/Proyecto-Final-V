const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Registro_Horas = sequelize.define('Registro_Horas', {
    id_registro: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el docente
    // ===============================================
    id_docente  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'docente', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_docente'
        }
    },

    // ===============================================
    // clave foránea para el grupo
    // ===============================================
    id_grupo: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'grupo', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_grupo'
        }
    },

    fecha_clase: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    numero_clase_secuencial: {
        type: DataTypes.INTEGER, 
        allowNull: false
    },

    horas_impartidas: {
        type: DataTypes.NUMERIC(5, 2), // 5 dígitos en total, 2 decimales 
        allowNull: false
    },

    // ===============================================
    // clave foránea para la liquidación
    // ===============================================
    id_liquidacion: {
        type: DataTypes.INTEGER,
        allowNull: true, // NULL si no ha sido pagado
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'liquidacion_nomina', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_liquidacion'
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
    tableName: 'registro_horas', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Registro_Horas.associate = (models) => {

    // Un registro de horas solo puede tener un docente de "docente"
    Registro_Horas.belongsTo(models.Docente, {
        foreignKey: 'id_docente', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'docente' // Usamos éste prefijo para obtener los datos del otro modelo (el docente de un registro de horas)
    });


    // Un registro de horas solo puede tener una liquidación de "liquidacion_nomina"
    Registro_Horas.belongsTo(models.Liquidacion_Nomina, {
        foreignKey: 'id_liquidacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'liquidacion' // Usamos éste prefijo para obtener los datos del otro modelo (la liquidación de un registro de horas)
    });


    // Un registro de horas solo puede tener un grupo de "grupo"
    Registro_Horas.belongsTo(models.Grupo, {
        foreignKey: 'id_grupo', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'grupo' // Usamos éste prefijo para obtener los datos del otro modelo (el grupo de un registro de horas)
    });


};

module.exports = Registro_Horas;