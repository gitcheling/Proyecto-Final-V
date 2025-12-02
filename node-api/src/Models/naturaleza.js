const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Naturaleza = sequelize.define('Naturaleza', {
    id_naturaleza: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(10),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'naturaleza', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Naturaleza.associate = (models) => {

    // Una naturaleza puede aparecer muchas veces en "plan_cuenta"
    Naturaleza.hasMany(models.Plan_Cuenta, {
        foreignKey: 'id_naturaleza', // La FK que está en la tabla 'plan_cuenta'
        as: 'cuentas' // Usamos éste prefijo para obtener los datos del otro modelo (todas las cuentas de una naturaleza)
    });


    // Una naturaleza puede aparecer muchas veces en "asiento_detalle"
    Naturaleza.hasMany(models.Asiento_Detalle, {
        foreignKey: 'id_naturaleza', // La FK que está en la tabla 'asiento_detalle'
        as: 'asientos_detalles' // Usamos éste prefijo para obtener los datos del otro modelo (todos los detalles de asientos de una naturaleza)
    });

};

module.exports = Naturaleza;