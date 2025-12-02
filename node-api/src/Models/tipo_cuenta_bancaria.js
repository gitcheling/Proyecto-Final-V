const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Tipo_Cuenta_Bancaria = sequelize.define('Tipo_Cuenta_Bancaria', {
    id_tipo_cuenta: {
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
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_cuenta_bancaria', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Tipo_Cuenta_Bancaria.associate = (models) => {

    // Un tipo de cuenta bancaria puede aparecer muchas veces en "cuenta_bancaria"
    Tipo_Cuenta_Bancaria.hasMany(models.Cuenta_Bancaria, {
        foreignKey: 'id_tipo_cuenta', // La FK que está en la tabla 'cuenta_bancaria'
        as: 'cuentas_bancarias' // Usamos éste prefijo para obtener los datos del otro modelo (todas las cuentas bancarias de un tipo de cuenta)
    });
    
    
};

module.exports = Tipo_Cuenta_Bancaria;
