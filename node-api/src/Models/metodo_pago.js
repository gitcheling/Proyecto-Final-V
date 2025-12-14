const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Metodo_Pago = sequelize.define('Metodo_Pago', {
    id_metodo_pago: {
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
    requiere_referencia: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'metodo_pago', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Metodo_Pago.associate = (models) => {

    // Un método de pago puede aparecer muchas veces en "registro_transaccion"
    Metodo_Pago.hasMany(models.Registro_Transaccion, {
        foreignKey: 'id_metodo_pago', // La FK que está en la tabla 'registro_transaccion'
        as: 'registros_transaccionales' // Usamos éste prefijo para obtener los datos del otro modelo (todos los registros transaccionales de un método de pago)
    });

};

module.exports = Metodo_Pago;