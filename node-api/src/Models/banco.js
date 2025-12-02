// Modelo de la tabla "tb_naturaleza"

// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Banco = sequelize.define('Banco', {
    id_banco: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    codigo_nacional: {
        type: DataTypes.STRING(4),
        allowNull: false,
        unique: true
    },
    codigo_swift: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'banco', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Banco.associate = (models) => {

    // Un banco puede aparecer muchas veces en "cuenta_bancaria"
    Banco.hasMany(models.Cuenta_Bancaria, {
        foreignKey: 'id_banco', // La FK que está en la tabla 'cuenta_bancaria'
        as: 'cuentas_bancarias' // Usamos éste prefijo para obtener los datos del otro modelo (todas las cuentas bancarias de un banco)
    });
    
};

module.exports = Banco;