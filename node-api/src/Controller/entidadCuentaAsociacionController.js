const EntidadCuentaAsociacionService = require('../Services/entidadCuentaAsociacionService');

const entidadCuentaAsociacionService = new EntidadCuentaAsociacionService();

   
// Registro

    exports.asociarCuentasBancarias = async (req, res) => {
        try {

            const {entidad, concepto, cuentasIds} = req.body || {};

            // Se llama a la función del servicio que se encarga de validar y mandar a crear la cuenta
            const completado = await entidadCuentaAsociacionService.asociarCuentasBancarias({ entidad, concepto, cuentasIds});


            if (!completado) {
                return res.status(404).json({
                    error: true,
                    message: `No se ha podido realizar la operación, intente de nuevo.`
                });
            }

            // Se responde con éxito (201 Created)
            res.status(201).json({
                message: "Cuenta(s) asociada(s) exitosamente",
                data: true
            });

        } catch (error) {
            // La mayoría de los errores son de "Bad Request" (400) debido a la validación
            // (código no numérico, prefijo incorrecto, padre inexistente, etc.)
            const statusCode = error.message.includes('existe') || error.message.includes('válido') || error.message.includes('obligatorio') ? 400 : 500;
            
            res.status(statusCode).json({
                error: true,
                message: error.message
            });
        }
    };

// Modificación

    exports.cambiarEstadoAsociacion = async (req, res) => {

        const { id} = req.params || {}; 

        // Se captura el nuevo estado del cuerpo (ej: { "estado": false })
        const { nuevoEstado } = req.body || {}; 

        try {
            const completado = await entidadCuentaAsociacionService.cambiarEstadoAsociacion(id, nuevoEstado);

            if (!completado) {
                return res.status(404).json({
                    error: true,
                    message: `Asociación con ID ${id} no encontrada.`
                });
            }

            res.status(200).json({
                message: `Estado de la asociación ${id} cambiado a ${nuevoEstado ? 'ACTIVO' : 'INACTIVO'} exitosamente.`,
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

// Obtención

    exports.obtenerEntidadesAsociadas = async (req, res) => {
        // 1. Capturar el parámetro de la ruta
        const { id } = req.params || {}; 

        try {

            const entidades = await entidadCuentaAsociacionService.obtenerEntidadesAsociadas(id);

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Entidades asociadas obtenidas exitosamente.",
                data: entidades
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener las entidades asociadas: " + error.message
            });
        }
    };

// Conteo

    exports.ContarPorEntidad = async (req, res) => {

        const { id, rol} = req.query || {}; 

        try {
            // Convertir y limpiar datos
            const id_cadena = id ? String(id) : null;
            const rol_cadena = rol ? String(rol) : null;
            
            const cantidad = await entidadCuentaAsociacionService.ContarPorEntidad(id_cadena, rol_cadena);

            // El backend retorna el objeto final
            return res.status(200).json({ 
                message: 'Cantidad de cuentas bancarias obtenida.', 
                cantidad: cantidad  
            });


        } catch (error) {
            
            // La mayoría de los errores son de "Bad Request" (400) debido a la validación
            // (código no numérico, prefijo incorrecto, padre inexistente, etc.)
            const statusCode = error.message.includes('existe') || error.message.includes('válido') || error.message.includes('obligatorio') ? 400 : 500;
            
            res.status(statusCode).json({
                error: true,
                message: error.message
            });
        }
    };

