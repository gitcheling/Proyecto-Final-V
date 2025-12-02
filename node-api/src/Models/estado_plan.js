const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Plan = sequelize.define('Estado_Plan', {
    id_estado_plan: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_plan', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Estado_Plan.associate = (models) => {

    // Un estado de plan puede aparecer muchas veces en "plan_pago"
    Estado_Plan.hasMany(models.Plan_Pago, {
        foreignKey: 'id_estado_plan', // La FK que está en la tabla 'plan_pago'
        as: 'planes_pago' // Usamos éste prefijo para obtener los datos del otro modelo (todos los planes de pago de un estado de pago)
    });

};

module.exports = Estado_Plan;