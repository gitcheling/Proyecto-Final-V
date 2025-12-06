// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const EstadoProveedorService = require('../Services/estadoProveedorService');

const estadoProveedorService = new EstadoProveedorService();

/**
 * Obtener estados proveedor
 */
exports.obtenerEstadosProveedor = async (req, res) => {

    try {
        // Llama al servicio para buscar la cuenta
        const estados = await estadoProveedorService.obtenerEstadosProveedor();

        if (!estados) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Estados proveedor no encontrados.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Estados proveedor obtenidos exitosamente.",
            data: estados
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los estados proveedor: " + error.message
        });
    }
};


