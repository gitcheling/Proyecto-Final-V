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
        type: DataTypes.STRING(100),
        allowNull: false
    },

    descripcion : {
        type: DataTypes.STRING(100),
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

    costo_matricula_base_usd : {
        type: DataTypes.NUMERIC(5, 2), // 5 dígitos en total, 2 decimales
        allowNull: false
    },

    costo_cuota_base_usd  : {
        type: DataTypes.NUMERIC(5, 2), 
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

    
    // Un curso puede aparecer muchas veces en "grupo"
    Curso.hasMany(models.Grupo, {
        foreignKey: 'id_curso', // La FK que está en la tabla 'grupo'
        as: 'grupos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los grupos de un curso)
    });

};

module.exports = Curso;