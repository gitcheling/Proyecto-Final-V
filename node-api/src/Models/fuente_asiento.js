const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Fuente_Asiento = sequelize.define('Fuente_Asiento', {
    id_fuente: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre_tabla: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'fuente_asiento', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Fuente_Asiento.associate = (models) => {

    // Una fuente de asiento puede aparecer muchas veces en "asiento_encabezado"
    Fuente_Asiento.hasMany(models.Asiento_Encabezado, {
        foreignKey: 'id_fuente', // La FK que está en la tabla 'asiento_encabezado'
        as: 'asientos_encabezados' // Usamos éste prefijo para obtener los datos del otro modelo (todos los encabezados de asientos de una fuente)
    });

};

module.exports = Fuente_Asiento;