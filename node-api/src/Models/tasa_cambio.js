const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Tasa_Cambio = sequelize.define('Tasa_Cambio', {
    id_tasa_cambio: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para la divisa de origen
    // ===============================================
    divisa_origen  : {
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
    // clave foránea para la divisa de destino 
    // ===============================================
    divisa_destino   : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'divisa', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_divisa'
        }
    },

    fecha_vigencia: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },


    tasa_valor: {
        type: DataTypes.NUMERIC(8, 2), // 8 dígitos en total, 2 decimales 
        allowNull: false
    },

    fuente: {
        type: DataTypes.STRING(50),
        allowNull: false
    }

}, {
    // Configuraciones de Sequelize:
    tableName: 'tasa_cambio', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Tasa_Cambio.associate = (models) => {

    // Una tasa de cambio solo puede tener una divisa de "divisa"
    Tasa_Cambio.belongsTo(models.Divisa, {
        foreignKey: 'divisa_origen', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'divisa_de_origen' // Usamos éste prefijo para obtener los datos del otro modelo (la divisa de origen de una tasa de cambio)
    });


    // Una tasa de cambio solo puede tener una divisa de "divisa"
    Tasa_Cambio.belongsTo(models.Divisa, {
        foreignKey: 'divisa_destino', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'divisa_de_destino' // Usamos éste prefijo para obtener los datos del otro modelo (la divisa de destino de una tasa de cambio)
    });


 
};

module.exports = Tasa_Cambio;