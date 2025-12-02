// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Dia = sequelize.define('Dia', {
    id_dia: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    nombre: {
        type: DataTypes.STRING(10),
        allowNull: false,
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'dia', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Dia.associate = (models) => {

    // Un día puede aparecer muchas veces en "bloque_horario"
    Dia.hasMany(models.Bloque_Horario, {
        foreignKey: 'id_dia', // La FK que está en la tabla 'bloque_horario'
        as: 'bloques' // Usamos éste prefijo para obtener los datos del otro modelo (todos los bloques horarios de un día)
    });
    
};


module.exports = Dia;