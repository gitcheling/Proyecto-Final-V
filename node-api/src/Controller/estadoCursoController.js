// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const EstadoCursoService = require('../Services/estadoCursoService');

const estadoCursoService = new EstadoCursoService();

exports.obtenerEstadosCurso = async (req, res) => {

    try {
        // Llama al servicio para buscar la cuenta
        const estados = await estadoCursoService.obtenerEstadosCurso();

        if (!estados) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Estados de curso no encontrados.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Estados de curso obtenidos exitosamente.",
            data: estados
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los estados de curso: " + error.message
        });
    }
};


