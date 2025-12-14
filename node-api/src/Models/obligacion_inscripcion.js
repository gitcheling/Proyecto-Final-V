const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Obligacion_Inscripcion = sequelize.define('Obligacion_Inscripcion', {
    id_obligacion: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: false, // Asumiendo que es autoincremental
         references: {
            // Nombre exacto de la tabla foránea en la base de datos
            model: 'obligacion_financiera', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_obligacion'
        }
    },


    // ===============================================
    // clave foránea para la inscripción 
    // ===============================================
    id_inscripcion: {
        type: DataTypes.INTEGER,
        allowNull: false, // Debe ser true, ya que sólo se van a crear cuentas hijas de las cuentas base
        references: {
            // Nombre exacto de la tabla foránea en la base de datos
            model: 'inscripcion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_inscripcion'
        }
    }

}, {
    // Configuraciones de Sequelize:
    tableName: 'obligacion_inscripcion', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Obligacion_Inscripcion.associate = (models) => {

    // Una obligación de inscripción solo puede tener una obligación financiera de "obligacion_financiera"
    Obligacion_Inscripcion.belongsTo(models.Obligacion_Financiera, {
        foreignKey: 'id_obligacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'obligacion_financiera' // Usamos éste prefijo para obtener los datos del otro modelo (la obligación financiera una obligación de inscripción)
    });


     // Una obligación de inscripción solo puede tener una inscripción de "inscripcion"
    Obligacion_Inscripcion.belongsTo(models.Inscripcion, {
        foreignKey: 'id_inscripcion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'inscripcion' // Usamos éste prefijo para obtener los datos del otro modelo (la inscripcion de una obligación de inscripción)
    });

};


module.exports = Obligacion_Inscripcion;