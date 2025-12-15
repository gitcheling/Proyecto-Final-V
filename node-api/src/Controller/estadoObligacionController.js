// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const EstadoObligacionService = require('../Services/estadoObligacionService');

const estadoObligacionService = new EstadoObligacionService();

exports.obtenerEstadosObligacion = async (req, res) => {

    try {

        const estados = await estadoObligacionService.obtenerEstadosObligacion();

        if (!estados) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Estados de obligación no encontrados.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Estados de obligación obtenidos exitosamente.",
            data: estados
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los estados de obligación: " + error.message
        });
    }
};


