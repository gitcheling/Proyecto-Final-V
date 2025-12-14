// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Entidad = sequelize.define('Entidad', {
    id_entidad: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    // ===============================================
    // clave foránea para el tipo de entidad
    // ===============================================
    id_tipo_entidad: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_entidad', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tipo_entidad'
        }
    },

    // ===============================================
    // clave foránea para el tipo de identificación
    // ===============================================
    id_tipo_identificacion: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'tipo_identificacion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_tipo_identificacion'
        },
        // El nombre del grupo: 'entidad_unica ' (para hacer una restriccion con varias columnas)
        unique: 'entidad_unica'
    },

    // ===============================================
    // clave foránea para el prefijo a poner en el número de identificación
    // ===============================================
    id_prefijo: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'prefijo_identificacion', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_prefijo'
        },
        // El nombre del grupo: 'entidad_unica ' (para hacer una restriccion con varias columnas)
        unique: 'entidad_unica'
    },


    numero_identificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // El nombre del grupo: 'entidad_unica ' (para hacer una restriccion con varias columnas)
        unique: 'entidad_unica'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    estado: {
        type:DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'entidad', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Entidad.associate = (models) => {

    // Una entidad solo puede tener un prefijo de "prefijo_identificacion"
    Entidad.belongsTo(models.Prefijo_Identificacion, {
        foreignKey: 'id_prefijo', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'prefijo' // Usamos éste prefijo para obtener los datos del otro modelo (el prefijo de una entidad)
    });


    // Una entidad solo puede tener un tipo de identificación de "tipo_identificacion"
    Entidad.belongsTo(models.Tipo_Identificacion, {
        foreignKey: 'id_tipo_identificacion', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_identificacion' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de identificación de una entidad)
    });


    // Una entidad solo puede tener un tipo de entidad de "tipo_entidad"
    Entidad.belongsTo(models.Tipo_Entidad, {
        foreignKey: 'id_tipo_entidad', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'tipo_entidad' // Usamos éste prefijo para obtener los datos del otro modelo (el tipo de entidad de una entidad)
    });

    
    // Una entidad solo puede tener un estudiante de "estudiante"
    Entidad.hasOne(models.Estudiante, {
        foreignKey: 'id_estudiante', // La FK que está en la tabla 'estudiante'
        as: 'estudiante' // Usamos éste prefijo para obtener los datos del otro modelo (el estudiante de una entidad)
    });

    // Una entidad solo puede tener un docente de "docente"
    Entidad.hasOne(models.Docente, {
        foreignKey: 'id_docente', // La FK que está en la tabla 'docente'
        as: 'docente' // Usamos éste prefijo para obtener los datos del otro modelo (el docente de una entidad)
    });

    // Una entidad solo puede tener un proveedor de "proveedor"
    Entidad.hasOne(models.Proveedor, {
        foreignKey: 'id_proveedor', // La FK que está en la tabla 'proveedor'
        as: 'proveedor' // Usamos éste prefijo para obtener los datos del otro modelo (el proveedor de una entidad)
    });

    // Una entidad puede aparecer muchas veces en "cuenta_bancaria"
    Entidad.hasMany(models.Cuenta_Bancaria, {
        foreignKey: 'id_entidad_titular', // La FK que está en la tabla 'cuenta_bancaria'
        as: 'cuentas_bancarias' // Usamos éste prefijo para obtener los datos del otro modelo (todas las cuentas bancarias de una entidad)
    });

    // Una entidad puede tener muchas cuentas asociadas con "cuenta_bancaria" en la tabla intermedia "entidad_cuenta_asociacion"
    Entidad.belongsToMany(models.Cuenta_Bancaria, {
        through: models.Entidad_Cuenta_Asociacion, // El modelo de la tabla intermedia
        foreignKey: 'id_entidad_asociada', // La FK que este modelo (entidad) tiene en la tabla intermedia (entidad_cuenta_asociacion)
        otherKey: 'id_cuenta_bancaria', // La FK del otro modelo (cuenta_bancaria) tiene en la tabla intermedia (entidad_cuenta_asociacion)
        as: 'cuentas_pago' // Usamos éste prefijo para obtener los datos del otro modelo (todas las cuentas bancarias asociadas a una entidad)
    });


    // Una entidad puede aparecer muchas veces en "obligacion_financiera"
    Entidad.hasMany(models.Obligacion_Financiera, {
        foreignKey: 'id_entidad', // La FK que está en la tabla 'obligacion_financiera'
        as: 'obligaciones_financieras' // Usamos éste prefijo para obtener los datos del otro modelo (todas las obligaciones financieras de una entidad)
    });

    // Una entidad puede aparecer muchas veces en "registro_transaccion"
    Entidad.hasMany(models.Registro_Transaccion, {
        foreignKey: 'id_entidad_realiza', // La FK que está en la tabla 'registro_transaccion'
        as: 'registros_transaccionales' // Usamos éste prefijo para obtener los datos del otro modelo (todos los registros transaccionales de una entidad)
    });
    
};

module.exports = Entidad;