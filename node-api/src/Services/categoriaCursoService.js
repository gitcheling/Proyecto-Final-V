const Categoria_Curso_Model = require('../Models/categoria_curso'); 


// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico} = require('../Utils/validators');


class CategoriaCursoService {

    /**
     * Obtiene categorías principales (padres) o subcategorías (hijas) de un ID específico.
     * * @param {number|null} padre - El ID de la categoría padre para buscar subcategorías. 
     * Si es null o no se proporciona, busca categorías principales.
     * @returns {Promise<Array>} Lista de categorías.
     */
    async buscarCategorias(padre = null) {

        console.log("padre: ", padre)

        let padre_limpio = null;
        if(validarExistencia(padre, "", false)){
            padre_limpio = String(padre).trim();
            validarIdNumerico(padre_limpio, "El id de la categoría padre debe contener solo números (dígitos 0-9).")
        }

        // --- 1. Definir la Condición de Búsqueda (WHERE) ---
        const condicionWhere = {};
        
        if (padre_limpio !== null) {
            // A) Buscar Subcategorías:
            // Criterio: id_categoria_padre = padre
            condicionWhere.id_categoria_padre = padre_limpio;
            
        } else {
            // B) Buscar Categorías Principales (Raíz):
            // Criterio: id_categoria_padre IS NULL
            condicionWhere.id_categoria_padre = null;
        }
        
        //  Ejecutar la Consulta con Sequelize ---
      
        const categorias = await Categoria_Curso_Model.findAll({
            where: condicionWhere,
            // Opcional: Incluir las subcategorías de estas categorías (relación hasMany)
            // include: [{ 
            //     model: Categoria_Curso_Model,
            //     as: 'subcategorias' 
            // }],
            order: [
                ['nombre', 'ASC']
            ],
            // Se puede agregar 'attributes' si solo se quiere campos específicos.
        });
        
        return categorias.map(instance =>({
            id: instance.id_categoria_curso,
            nombre: instance.nombre,
            descripcion: instance.descripcion,
        }));

    }


}

module.exports = CategoriaCursoService;