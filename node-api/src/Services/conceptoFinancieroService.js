const Concepto_Financiero_Model = require('../Models/concepto_financiero'); 


// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico} = require('../Utils/validators');


class ConceptoFinancieroService {

    /**
     * Obtiene conceptos principales (padres) o subconceptos (hijos) de un ID específico.
     * * @param {number|null} padre - El ID del concepto padre para buscar subconcepto. 
     * Si es null o no se proporciona, busca concepto principales.
     * @returns {Promise<Array>} Lista de concepto.
     */
    async buscarConceptos(padre = null) {

        let padre_limpio = null;
        if(validarExistencia(padre, "", false)){
            padre_limpio = String(padre).trim();
            validarIdNumerico(padre_limpio, "El id del concepto padre debe contener solo números (dígitos 0-9).")
        }

        // --- 1. Definir la Condición de Búsqueda (WHERE) ---
        const condicionWhere = {};
        
        if (padre_limpio !== null) {
            // A) Buscar Subcategorías:
            // Criterio: id_concepto_padre = padre
            condicionWhere.id_concepto_padre = padre_limpio;
            
        } else {
            // B) Buscar Categorías Principales (Raíz):
            // Criterio: id_concepto_padre IS NULL
            condicionWhere.id_concepto_padre = null;
        }
        
        //  Ejecutar la Consulta con Sequelize ---
      
        const conceptos = await Concepto_Financiero_Model.findAll({
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
        
        return conceptos.map(instance =>({
            id: instance.id_concepto,
            nombre: instance.nombre,
            descripcion: instance.descripcion,
        }));

    }


}

module.exports = ConceptoFinancieroService;