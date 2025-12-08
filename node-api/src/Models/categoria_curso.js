// Se importa la conexión y los tipos de datos
const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/database');


const Categoria_Curso = sequelize.define('Categoria_Curso', {
    id_categoria_curso: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Indica que este es el campo de la clave primaria
        autoIncrement: true // Asumiendo que es autoincremental
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    // ===============================================
    // CLAVE FORÁNEA PARA LA JERARQUÍA (id categoria padre)
    // ===============================================
    id_categoria_padre: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            /* La tabla foránea (ya que "id_categoria_padre" es una clave foránea en la base de datos, y en este caso se referencia a 
            la misma tabla por recursividad) */
            model: 'categoria_curso', 

            // La columna de la tabla foránea
            key: 'id_categoria_curso'
        }
    },
    
}, {
    // Configuraciones de Sequelize:
    tableName: 'categoria_curso', // Nombre de la tabla exacto
    timestamps: false, // La tabla no usa createdAt/updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});


// Asociaciones (para relacionar las claves foráneas con sus tablas, y asi obtener también datos de esas tablas)
Categoria_Curso.associate = (models) => {

    /* La Relación "Hijo a Padre" (belongsTo). Una categoría pertenece a su categoría padre. Es el lado del hijo y le dice a
    Sequelize como encontrar al padre */
    Categoria_Curso.belongsTo(Categoria_Curso, {
        foreignKey: 'id_categoria_padre',
        as: 'categoria_padre', // (el padre de una categoría)
    });

    /* La Relación "Padre a Hijo" (hasMany). Una categoría padre tiene muchas categorías hijas. Es el lado del padre y le dice a 
    Sequelize como encontrar a los hijos */
    Categoria_Curso.hasMany(Categoria_Curso, {
        foreignKey: 'id_categoria_padre',
        as: 'subcategorias', // (las subcategorías de una categoría)
    });

    // Una categoría puede aparecer muchas veces en "curso"
    Categoria_Curso.hasMany(models.Curso, {
        foreignKey: 'id_categoria', // La FK que está en la tabla 'curso'
        as: 'cursos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los cursos de una categoría)
    });
    
};


module.exports = Categoria_Curso;