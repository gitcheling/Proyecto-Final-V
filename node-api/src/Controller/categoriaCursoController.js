// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const CategoriaCursoService = require('../Services/categoriaCursoService');

const categoriaCursoService = new CategoriaCursoService();

exports.buscarCategorias = async (req, res) => {

    try {

        const { padre } = req.query || {}; 

        const categorias = await categoriaCursoService.buscarCategorias(padre);

        if (!categorias) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Categorías de cursos no encontradas.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Categorías de cursos obtenidos exitosamente.",
            data: categorias
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener las categorías de cursos: " + error.message
        });
    }
};


