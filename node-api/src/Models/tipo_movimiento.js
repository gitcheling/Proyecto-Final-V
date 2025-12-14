const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Tipo_Movimiento = sequelize.define('Tipo_Movimiento', {
    id_tipo_movimiento: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_movimiento', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Tipo_Movimiento.associate = (models) => {

    // Un tipo de movimiento puede aparecer muchas veces en "registro_transaccion"
    Tipo_Movimiento.hasMany(models.Registro_Transaccion, {
        foreignKey: 'id_tipo_movimiento', // La FK que está en la tabla 'registro_transaccion'
        as: 'registros_transaccionales' // Usamos éste prefijo para obtener los datos del otro modelo (todos los registros transaccionales de un tipo de movimiento)
    });

};

module.exports = Tipo_Movimiento;