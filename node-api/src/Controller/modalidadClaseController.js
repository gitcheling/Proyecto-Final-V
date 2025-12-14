const ModalidadClaseService = require('../Services/modalidadClaseService');

const modalidadClaseService = new ModalidadClaseService();

exports.obtenerModalidadesClase = async (req, res) => {

    try {

        const modalidades = await modalidadClaseService.obtenerModalidadesClase();

        if (!modalidades) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Modalidades no encontradas.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Modalidades obtenidas exitosamente.",
            data: modalidades
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener las modalidades: " + error.message
        });
    }
};


