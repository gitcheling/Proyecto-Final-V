// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const PrefijosService = require('../Services/prefijosService');

const prefijosService = new PrefijosService();


/**
 * Obtener los prefijos de un tipo de identificación
 */
exports.obtenerPrefijos = async (req, res) => {

    const { id } = req.params || {}; 

    try {
        // Llama al servicio para buscar los prefijos
        const prefijos = await prefijosService.obtenerPrefijos(id);

        if (!prefijos) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `No se encontraron prefijos para el tipo de identificación seleccionado.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Prefijos obtenidos exitosamente.",
            data: prefijos
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los prefijos: " + error.message
        });
    }
};





