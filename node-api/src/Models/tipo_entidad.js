const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Tipo_Entidad = sequelize.define('Tipo_Entidad', {
    id_tipo_entidad: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_entidad', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});



Tipo_Entidad.associate = (models) => {

     // Un tipo de entidad puede aparecer muchas veces en "entidad"
    Tipo_Entidad.hasMany(models.Entidad, {
        foreignKey: 'id_tipo_entidad', // La FK que está en la tabla 'entidad'
        as: 'entidades' // Usamos éste prefijo para obtener los datos del otro modelo (todas las entidades de un tipo de entidad)
    });
};


module.exports = Tipo_Entidad;