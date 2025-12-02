const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Tipo_Pago = sequelize.define('Tipo_Pago', {
    id_tipo_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    requiere_referencia: {
        type:DataTypes.BOOLEAN,
        allowNull: false // asegura que este campo siempre debe tener un valor; la base de datos no permitirá nulos.
    },
}, {
    // Configuraciones de Sequelize:
    tableName: 'tipo_pago', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Tipo_Pago.associate = (models) => {

    // Un tipo de pago puede aparecer muchas veces en "pagos_estudiantes"
    Tipo_Pago.hasMany(models.Pagos_Estudiantes, {
        foreignKey: 'id_tipo_pago', // La FK que está en la tabla 'pagos_estudiantes'
        as: 'pagos_estudiantes' // Usamos éste prefijo para obtener los datos del otro modelo (todos los pagos de estudiantes según un tipo de pago)
    });

};

module.exports = Tipo_Pago;