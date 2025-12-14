const EstadoInscripcionService = require('../Services/estadoInscripcionService');

const estadoInscripcionService = new EstadoInscripcionService();

exports.obtenerEstadosInscripcion = async (req, res) => {

    try {

        const estados = await estadoInscripcionService.obtenerEstadosInscripcion();

        if (!estados) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Estados de inscripción no encontrados.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Estados de inscripción obtenidos exitosamente.",
            data: estados
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los estados de inscripción: " + error.message
        });
    }
};


