const TipoComprobanteService = require('../Services/tipoComprobanteService');

const tipoComprobanteService = new TipoComprobanteService();

exports.obtenerTiposComprobante = async (req, res) => {

    try {

        const comprobantes = await tipoComprobanteService.obtenerTiposComprobante();

        if (!comprobantes) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Tipos de comprobante no encontrados.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Tipos de comprobantes obtenidos exitosamente.",
            data: comprobantes
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los tipos de comprobantes: " + error.message
        });
    }
};


