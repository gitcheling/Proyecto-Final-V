// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const ProveedorService = require('../Services/proveedorService');

const proveedorService = new ProveedorService();

// -------------------------- Creación ------------------------------------

    exports.crearProveedor = async (req, res) => {
        try {

            const {id, tipo} = req.body || {};

            console.log("id: ", id)
            console.log("tipo: ", tipo)

            // Se llama a la función del servicio que se encarga de validar y mandar a crear la entidad
            const nuevoProveedor = await proveedorService.crearProveedor({id, tipo});

        // Se responde con éxito (201 Created)
            res.status(201).json({
                message: "Proveedor registrado exitosamente.",
                data: nuevoProveedor
            });

        } catch (error) {
            // La mayoría de los errores son de "Bad Request" (400) debido a la validación
            const statusCode = error.message.includes('existe') || error.message.includes('válido') || error.message.includes('obligatorio') ? 400 : 500;
            
            res.status(statusCode).json({
                error: true,
                message: error.message
            });
        }
    };



// -------------------------- Modificación ------------------------------------

    exports.modificarProveedor = async (req, res) => {

        const { id } = req.params || {}; 

        const { estado, tipo } = req.body || {}; 

        try {
            const completado = await proveedorService.modificarProveedor(id, estado, tipo);

            if (!completado) {
                return res.status(404).json({
                    error: true,
                    message: `Proveedor con ID ${id} no encontrado.`
                });
            }

            res.status(200).json({
                message: `Proveedor modificado exitosamente.`,
                data: "Datos modificados"
            });

        } catch (error) {
            // Manejo de errores de validación (400) o servidor (500)
            const statusCode = error.message.includes('inválido') || error.message.includes('verdadero') ? 400 : 500;
            
            res.status(statusCode).json({
                error: true,
                message: error.message
            });
        }
    };


// -------------------------- Obtención ------------------------------------

    /**
     * Obtener un proveedor por su ID (id_estudiante).
     */
    exports.obtenerProveedorPorId = async (req, res) => {

        const { id } = req.params || {}; 

        try {
            // Llama al servicio para buscar la cuenta
            const proveedor = await proveedorService.obtenerProveedorPorId(id);

            if (!proveedor) {
                // 404 Not Found si la cuenta no existe
                return res.status(404).json({
                    error: true,
                    message: `Proveedor con ID ${id} no encontrada.`
                });
            }

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Proveedor obtenido exitosamente.",
                data: proveedor
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener al proveedor: " + error.message
            });
        }
    };


    /**
     * Obtener proveedores por filtros
     */
    exports.buscarProveedores = async (req, res) => {

        /* Se obtiene los criterios de búsqueda de la URL (req.query). Express automáticamente los coloca en este objeto.
        Nota: Al enviar datos a través de los parámetros de consulta de una URL (usando el método GET con req.query en Express), 
        los datos siempre se envían y se reciben en el backend a modo de texto (cadenas de string). */
        const criteriosBusqueda = req.query || {};

        try {
            const proveedoresEncontrados = await proveedorService.buscarProveedores(criteriosBusqueda);

            // Se devuelve la respuesta
            if (proveedoresEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron proveedores que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de proveedores completada exitosamente.", 
                data: proveedoresEncontrados 
            });

        } catch (error) {
            console.error("Error de Validación/Lógica en la búsqueda:", error.message);

            // Si tiene un mensaje (y no es un error de sistema), lo asumimos como validación (400)
            if (error.message) {
                return res.status(400).json({ 
                    error: true, 
                    message: error.message 
                });
            }
            
            // Si no, devolvemos 500
            return res.status(500).json({ 
                error: true, 
                message: "Error interno del servidor al procesar la búsqueda." 
            });
        }
    }


    exports.contarProveedores = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {
            const proveedoresEncontrados = await proveedorService.obtenerConteoPorMes(criteriosBusqueda);

            // Se devuelve la respuesta
            if (proveedoresEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron proveedores que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de proveedores completada exitosamente.", 
                data: proveedoresEncontrados 
            });

        } catch (error) {
            console.error("Error de Validación/Lógica en la búsqueda:", error.message);

            // Si tiene un mensaje (y no es un error de sistema), lo asumimos como validación (400)
            if (error.message) {
                return res.status(400).json({ 
                    error: true, 
                    message: error.message 
                });
            }
            
            // Si no, devolvemos 500
            return res.status(500).json({ 
                error: true, 
                message: "Error interno del servidor al procesar la búsqueda." 
            });
        }
    }


    exports.obtenerEstadosTotales = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {
            const proveedoresEncontrados = await proveedorService.obtenerEstadosTotales(criteriosBusqueda);

            // Se devuelve la respuesta
            if (proveedoresEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron proveedores que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de proveedores completada exitosamente.", 
                data: proveedoresEncontrados 
            });

        } catch (error) {
            console.error("Error de Validación/Lógica en la búsqueda:", error.message);

            // Si tiene un mensaje (y no es un error de sistema), lo asumimos como validación (400)
            if (error.message) {
                return res.status(400).json({ 
                    error: true, 
                    message: error.message 
                });
            }
            
            // Si no, devolvemos 500
            return res.status(500).json({ 
                error: true, 
                message: "Error interno del servidor al procesar la búsqueda." 
            });
        }
    }



