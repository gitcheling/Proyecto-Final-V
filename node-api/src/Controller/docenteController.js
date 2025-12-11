// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const DocenteService = require('../Services/docenteService');

const docenteService = new DocenteService();

// -------------------------- Creación ------------------------------------

    exports.crearDocente = async (req, res) => {

        try {

            const {id} = req.body || {};

            // Se llama a la función del servicio que se encarga de validar y mandar a crear el docente
            const nuevoDocente= await docenteService.crearDocente({id});

        // Se responde con éxito (201 Created)
            res.status(201).json({
                message: "Docente registrado exitosamente.",
                data: nuevoDocente
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

    /**
     * Cambiar el estado de un docente
     */
    exports.cambiarEstadoDocente = async (req, res) => {

        const { id } = req.params || {}; 

        // Se captura el nuevo estado del cuerpo (ej: { "estado": false })
        const { estado } = req.body || {}; 

        try {
            const nuevoEstado = await docenteService.cambiarEstadoDocente(id, estado);

            if (!nuevoEstado) {
                return res.status(404).json({
                    error: true,
                    message: `Docente con ID ${id} no encontrado.`
                });
            }

            res.status(200).json({
                message: `Estado del docente ${id} cambiado a '${nuevoEstado.nombre}' exitosamente.`,
                data: "Estado modificado"
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
     * Obtener un docente por su ID (id_estudiante).
     */
    exports.obtenerDocentePorId = async (req, res) => {

        const { id } = req.params || {}; 

        try {
            // Llama al servicio para buscar la cuenta
            const docente = await docenteService.obtenerDocentePorId(id);

            if (!docente) {
                // 404 Not Found si la cuenta no existe
                return res.status(404).json({
                    error: true,
                    message: `Docente con ID ${id} no encontrada.`
                });
            }

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Docente obtenido exitosamente.",
                data: docente
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener al docente: " + error.message
            });
        }
    };


/**
 * Obtener docentes por filtros
 */
    exports.buscarDocentes = async (req, res) => {

        /* Se obtiene los criterios de búsqueda de la URL (req.query). Express automáticamente los coloca en este objeto.
        Nota: Al enviar datos a través de los parámetros de consulta de una URL (usando el método GET con req.query en Express), 
        los datos siempre se envían y se reciben en el backend a modo de texto (cadenas de string). */
        const criteriosBusqueda = req.query || {};

        try {
            const docentesEncontrados = await docenteService.buscarDocentes(criteriosBusqueda);

            // Se devuelve la respuesta
            if (docentesEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron docentes que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de docentes completada exitosamente.", 
                data: docentesEncontrados 
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


    exports.contarDocentes = async (req, res) => {


        const criteriosBusqueda = req.query || {};

        try {
            const docentesEncontrados = await docenteService.obtenerConteoPorMes(criteriosBusqueda);

            // Se devuelve la respuesta
            if (docentesEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron docentes que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de docentes completada exitosamente.", 
                data: docentesEncontrados 
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
            const docentesEncontrados = await docenteService.obtenerEstadosTotales(criteriosBusqueda);

            // Se devuelve la respuesta
            if (docentesEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron docentes que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de docentes completada exitosamente.", 
                data: docentesEncontrados 
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


