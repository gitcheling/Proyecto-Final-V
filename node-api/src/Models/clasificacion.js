const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');

const Clasificacion = sequelize.define('Clasificacion', {
    id_clasificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(10),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'clasificacion', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true
});

Clasificacion.associate = (models) => {

    // Una clasificación puede aparecer muchas veces en "plan_cuenta"
    Clasificacion.hasMany(models.Plan_Cuenta, {
        foreignKey: 'id_clasificacion', // La FK que está en la tabla 'plan_cuenta'
        as: 'cuentas' // Usamos éste prefijo para obtener los datos del otro modelo (todas las cuentas de una clasificación)
    });

};

module.exports = Clasificacion;
