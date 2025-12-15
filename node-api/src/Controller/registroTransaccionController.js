const RegistroTransaccionService = require('../Services/registroTransaccionService');

const registroTransaccionService = new RegistroTransaccionService();

// -------------------------- Creación ------------------------------------


    exports.crearTransaccionFinanciera = async (req, res) => {
        try {

            const { obligacion, entidad, tipo_movimiento, monto, divisa, metodo_pago, referencia, fecha_transaccion, cuenta_origen, cuenta_destino} = req.body || {};

           
            await registroTransaccionService.crearTransaccionFinanciera({ obligacion, entidad, tipo_movimiento, monto, divisa, metodo_pago, referencia, fecha_transaccion, cuenta_origen, cuenta_destino});

            // Se responde con éxito (201 Created)
            res.status(201).json({
                message: "Transferencia registrada exitosamente.",
                data: "Completado"
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


// -------------------------- Obtención ------------------------------------


    exports.obtenerTransaccionPorId = async (req, res) => {

        const { id } = req.params || {}; 

        try {

            const transaccion = await registroTransaccionService.obtenerTransaccionPorId(id);

            if (!transaccion) {
                // 404 Not Found si la cuenta no existe
                return res.status(404).json({
                    error: true,
                    message: `Transacción con ID ${id} no encontrada.`
                });
            }

            // 200 OK y devuelve el objeto
            res.status(200).json({
                data: transaccion,
                message: "Transacción obtenida exitosamente.",
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener la transacción: " + error.message
            });
        }
    };




    exports.buscarTransacciones = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {

            const transaccionesEncontradas = await registroTransaccionService.buscarTransacciones(criteriosBusqueda);


            if (transaccionesEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron transacciones que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de transacciones completada exitosamente.", 
                data: transaccionesEncontradas 
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


    exports.contarInscripciones = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {

            const inscripcionesEncontradas = await inscripcionService.obtenerConteoPorMes(criteriosBusqueda);

            // Se devuelve la respuesta
            if (inscripcionesEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron inscripciones que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de inscripciones completada exitosamente.", 
                data: inscripcionesEncontradas 
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

            const inscripcionesEncontradas = await inscripcionService.obtenerEstadosTotales(criteriosBusqueda);


            if (inscripcionesEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron inscripciones que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de inscripciones completada exitosamente.", 
                data: inscripcionesEncontradas 
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






