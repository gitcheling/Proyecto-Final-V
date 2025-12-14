const EstadoGrupoService = require('../Services/estadoGrupoService');

const estadoGrupoService = new EstadoGrupoService();

exports.obtenerEstadosGrupo = async (req, res) => {

    try {
        // Llama al servicio para buscar la cuenta
        const estados = await estadoGrupoService.obtenerEstadosGrupo();

        if (!estados) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Estados de grupo no encontrados.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Estados de grupo obtenidos exitosamente.",
            data: estados
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los estados de grupo: " + error.message
        });
    }
};


