// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const TipoProveedorService = require('../Services/tipoProveedorService');

const tipoProveedorService = new TipoProveedorService();


exports.obtenerTiposProveedor = async (req, res) => {

    try {
        // Llama al servicio para buscar la cuenta
        const tipos = await tipoProveedorService.obtenerTiposProveedor();

        if (!tipos) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Tipos de proveedor no encontrados.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Tipos de proveedor obtenidos exitosamente.",
            data: tipos
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los tipos de proveedor: " + error.message
        });
    }
};


