// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Obligacion = sequelize.define('Estado_Obligacion', {
    id_estado_obligacion: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    es_finalizado: {
        type:DataTypes.BOOLEAN,
        allowNull: false 
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_obligacion', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Obligacion.associate = (models) => {

    //Un estado puede aparecer muchas veces en "obligacion_financiera"
    Estado_Obligacion.hasMany(models.Obligacion_Financiera, {
        foreignKey: 'id_estado', // La FK que está en la tabla 'obligacion_financiera'
        as: 'obligaciones_financieras' // Usamos éste prefijo para obtener los datos del otro modelo (todas las obligaciones financieras de un estado)
    }); 

};

module.exports = Estado_Obligacion;