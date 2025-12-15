const DivisaService = require('../Services/divisaService');

const divisaService = new DivisaService();

exports.obtenerDivisas = async (req, res) => {

    try {

        const divisas = await divisaService.obtenerDivisas();

        if (!divisas) {

            return res.status(404).json({
                error: true,
                message: `Divisas no encontradas.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Divisas obtenidas exitosamente.",
            data: divisas
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener las divisas: " + error.message
        });
    }
};


