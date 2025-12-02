const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Estado_Factura = sequelize.define('Estado_Factura', {
    id_estado_factura: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'estado_factura', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Estado_Factura.associate = (models) => {

    // Un estado de factura puede aparecer muchas veces en "facturas_gasto"
    Estado_Factura.hasMany(models.Facturas_Gasto, {
        foreignKey: 'id_estado_factura', // La FK que está en la tabla 'facturas_gasto'
        as: 'facturas_gasto' // Usamos éste prefijo para obtener los datos del otro modelo (todas las facturas de gasto de un estado de factura)
    });

};

module.exports = Estado_Factura;