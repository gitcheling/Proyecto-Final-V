// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');


const Curso = sequelize.define('Curso', {
    id_curso : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },

    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },

    descripcion : {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    // ===============================================
    // clave foránea para la categoría
    // ===============================================
    id_categoria : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'categoria_curso', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_categoria_curso'
        }
    },

    total_clases  : {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },

    // ===============================================
    // clave foránea para el estado
    // ===============================================
    id_estado : {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {

            // Nombre exacto de la tabla foránea en la base de datos
            model: 'estado_curso', 

            // El nombre exacto de la columna en la tabla foránea (model) a la que apunta. Que sería, la clave primaria
            key: 'id_estado_curso'
        }
    },

    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'curso', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

Curso.associate = (models) => {

    // Un curso solo puede tener una categoría de "categoria_curso"
    Curso.belongsTo(models.Categoria_Curso, {
        foreignKey: 'id_categoria', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'categoria' // Usamos éste prefijo para obtener los datos del otro modelo (la categoría de un curso)
    });

    
    // Un curso solo puede tener un estado de "estado_curso"
    Curso.belongsTo(models.Estado_Curso, {
        foreignKey: 'id_estado', // La FK que está en ESTA MISMA tabla (en este caso que es el lado muchos)
        as: 'estado' // Usamos éste prefijo para obtener los datos del otro modelo (el estado de un curso)
    });

    
    // Un curso puede aparecer muchas veces en "grupo"
    Curso.hasMany(models.Grupo, {
        foreignKey: 'id_curso', // La FK que está en la tabla 'grupo'
        as: 'grupos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los grupos de un curso)
    });

};

module.exports = Curso;