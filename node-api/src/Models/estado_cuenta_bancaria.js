const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Cuenta_Bancaria = sequelize.define('Estado_Cuenta_Bancaria', {
    id_estado_cuenta : {
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
    permite_operacion: {
        type:DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_cuenta_bancaria', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Estado_Cuenta_Bancaria.associate = (models) => {

    // Un estado de cuenta bancaria puede aparecer muchas veces en "cuenta_bancaria"
    Estado_Cuenta_Bancaria.hasMany(models.Cuenta_Bancaria, {
        foreignKey: 'id_estado_cuenta', // La FK que está en la tabla 'cuenta_bancaria'
        as: 'cuentas_bancarias' // Usamos éste prefijo para obtener los datos del otro modelo (todas las cuentas bancarias de un estado de cuenta)
    });

};

module.exports = Estado_Cuenta_Bancaria;