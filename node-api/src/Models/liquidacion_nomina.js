const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Liquidacion_Nomina = sequelize.define('Liquidacion_Nomina', {
    id_liquidacion: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el docente
    // ===============================================
    id_docente  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'docente', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_docente'
        }
    },

    fecha_inicio_periodo: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    fecha_fin_periodo : {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },

    total_horas: {
        type: DataTypes.NUMERIC(6, 2), // 6 dígitos en total, 2 decimales 
        allowNull: false
    },

    monto_calculado_usd: {
        type: DataTypes.NUMERIC(10, 2), // 10 dígitos en total, 2 decimales 
        allowNull: false
    },

    pagado: {
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: false
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'liquidacion_nomina', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Liquidacion_Nomina.associate = (models) => {

    // Una liquidación solo puede tener un docente de "docente"
    Liquidacion_Nomina.belongsTo(models.Docente, {
        foreignKey: 'id_docente', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'docente' // Usamos éste prefijo para obtener los datos del otro modelo (el docente de una liquidación)
    });


    // Una liquidación puede aparecer muchas veces en "registro_horas"
    Liquidacion_Nomina.hasMany(models.Registro_Horas, {
        foreignKey: 'id_liquidacion', // La FK que está en la tabla 'registro_horas'
        as: 'horas_registradas' // Usamos éste prefijo para obtener los datos del otro modelo (todas las horas registradas de una liquidación)
    });


    // Una liquidación puede aparecer muchas veces en "pagos_docentes"
    Liquidacion_Nomina.hasMany(models.Pagos_Docentes, {
        foreignKey: 'id_liquidacion', // La FK que está en la tabla 'pagos_docentes'
        as: 'pagos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los pagos de una liquidación)
    });

};

module.exports = Liquidacion_Nomina;