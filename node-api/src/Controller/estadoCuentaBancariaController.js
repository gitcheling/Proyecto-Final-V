// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const EstadoCuentaBancariaService = require('../Services/estadoCuentaBancariaService');

const estadoCuentaBancariaService = new EstadoCuentaBancariaService();


/**
 * Obtener los estados de una cuenta bancaria
 */
exports.obtenerEstadosCuentaBancaria = async (req, res) => {

    try {
        // Llama al servicio para buscar los prefijos
        const estados = await estadoCuentaBancariaService.obtenerEstadosCuentaBancaria();

        if (!estados) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `No se encontraron estados de cuenta bancaria.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Estados de cuenta bancaria obtenidos exitosamente.",
            data: estados
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los estados de cuenta bancaria: " + error.message
        });
    }
};





