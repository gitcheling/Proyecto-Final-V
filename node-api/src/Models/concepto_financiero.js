// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Concepto_Financiero = sequelize.define('Concepto_Financiero', {
    id_concepto: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    // ===============================================
    // CLAVE FORÁNEA PARA LA JERARQUÍA (id categoria padre)
    // ===============================================
    id_concepto_padre: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            /* La tabla foránea (ya que "id_concepto_padre" es una clave foránea en la base de datos, y en este caso se referencia a 
            la misma tabla por recursividad) */
            model: 'concepto_financiero', 

            // La columna de la tabla foránea
            key: 'id_concepto'
        }
    },

    es_por_cobrar: {
        type:DataTypes.BOOLEAN,
        allowNull: true 
    },
    es_obligacion_negativa: {
        type:DataTypes.BOOLEAN,
        allowNull: false 
    },


    // ===============================================
    // CLAVE FORÁNEA PARA LA CUENTA AFECTADA
    // ===============================================
    id_cuenta_afectada: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'plan_cuenta', 
            key: 'id_plan_cuenta'
        }
    },

}, {
    // Configuraciones de Sequelize:
    tableName: 'concepto_financiero', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Concepto_Financiero.associate = (models) => {

     /* La Relación "Hijo a Padre" (belongsTo). Un concepto pertenece a su concepto padre. Es el lado del hijo y le dice a
    Sequelize como encontrar al padre */
    Concepto_Financiero.belongsTo(Concepto_Financiero, {
        foreignKey: 'id_concepto_padre',
        as: 'concepto_padre', // (el padre de una categoría)
    });

    /* La Relación "Padre a Hijo" (hasMany). Un concepto padre tiene muchos conceptos hijos. Es el lado del padre y le dice a 
    Sequelize como encontrar a los hijos */
    Concepto_Financiero.hasMany(Concepto_Financiero, {
        foreignKey: 'id_concepto_padre',
        as: 'subconceptos', // (las subconceptos de un concepto)
    });

    // Un concepto financiero puede aparecer muchas veces en "obligacion_financiera"
    Concepto_Financiero.hasMany(models.Obligacion_Financiera, {
        foreignKey: 'id_concepto', // La FK que está en la tabla 'obligacion_financiera'
        as: 'obligaciones_financieras' // Usamos éste prefijo para obtener los datos del otro modelo (todas las obligaciones financieras de un concepto)
    }); 


    // Un concepto financiero solo puede tener una cuenta afectada de "plan_cuenta"
    Concepto_Financiero.belongsTo(models.Plan_Cuenta, {
        foreignKey: 'id_cuenta_afectada', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'cuenta' // Usamos éste prefijo para obtener los datos del otro modelo (la cuenta afectada de un concepto financiero)
    });

};


module.exports = Concepto_Financiero;