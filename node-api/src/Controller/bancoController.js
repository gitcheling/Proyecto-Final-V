// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const BancoService = require('../Services/bancoService');

const bancoService = new BancoService();


/**
 * Obtener los bancos
 */
exports.obtenerBancos = async (req, res) => {

    try {
        // Llama al servicio para buscar los bancos
        const bancos = await bancoService.obtenerBancos();

        if (!bancos) {
            // 404 Not Found si el banco no existe
            return res.status(404).json({
                error: true,
                message: `No se encontraron bancos.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Bancos obtenidos exitosamente.",
            data: bancos
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los bancos: " + error.message
        });
    }
};





