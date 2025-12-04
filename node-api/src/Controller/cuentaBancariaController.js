// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const CuentaBancariaService = require('../Services/cuentaBancariaService');

const cuentaBancariaService = new CuentaBancariaService();

// Registro

    exports.crearCuentaBancaria = async (req, res) => {
        try {

            const {numero_cuenta, tipo_cuenta, banco, entidad_titular} = req.body || {};

            // Se llama a la función del servicio que se encarga de validar y mandar a crear la cuenta
            const nuevaCuenta = await cuentaBancariaService.crearCuentaBancaria({ numero_cuenta, tipo_cuenta, banco, entidad_titular});

        // Se responde con éxito (201 Created)
            res.status(201).json({
                message: "Cuenta creada exitosamente",
                data: nuevaCuenta
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

    exports.cambiarEstadoCuentaBancaria = async (req, res) => {

        const { id } = req.params || {}; 

        const { estado } = req.body || {}; 

        try {
            const completado = await cuentaBancariaService.cambiarEstadoCuentaBancaria(id, estado);

            if (!completado) {
                return res.status(404).json({
                    error: true,
                    message: `Cuenta bancaria con ID ${id} no encontrada.`
                });
            }

            res.status(200).json({
                message: `Estado de la cuenta bancaria cambiado a '${completado.nombre}' exitosamente.`,
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

    // Aprobar y eliminar cuenta
        exports.aprobarCuentaBancaria = async (req, res) => {

            const { id } = req.body || {}; 

            try {
                const completado = await cuentaBancariaService.aprobarCuentaBancaria(id);

                if (!completado) {
                    return res.status(404).json({
                        error: true,
                        message: `Cuenta bancaria con ID ${id} no encontrada.`
                    });
                }

                res.status(200).json({
                    message: `Cuenta bancaria aprobada exitosamente.`,
                    data: true
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


        exports.eliminarCuentaBancaria = async (req, res) => {

            const { id } = req.body || {}; 

            console.log("id en controller: ", id);

            try {
                const completado = await cuentaBancariaService.eliminarCuentaBancaria(id);

                if (!completado) {
                    return res.status(404).json({
                        error: true,
                        message: `Cuenta bancaria con ID ${id} no encontrada.`
                    });
                }

                res.status(200).json({
                    message: `Cuenta bancaria eliminada exitosamente.`,
                    data: true
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

    exports.obtenerCuentaBancariaPorId = async (req, res) => {
        // 1. Capturar el parámetro de la ruta
        const { id } = req.params || {}; 

        try {
            // Llama al servicio para buscar la cuenta bancaria
            const cuenta = await cuentaBancariaService.obtenerCuentaBancariaPorId(id);

            if (!cuenta) {
                // 404 Not Found si la cuenta bancaria no existe
                return res.status(404).json({
                    error: true,
                    message: `Cuenta bancaria con ID ${id} no encontrada.`
                });
            }

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Cuenta bancaria obtenida exitosamente.",
                data: cuenta
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener la cuenta bancaria: " + error.message
            });
        }
    };



    exports.obtenerCuentasBancariasPorRol = async (req, res) => {
        
        const { id, rol } = req.query || {}; 

        try {

            const cuentas = await cuentaBancariaService.obtenerCuentasBancariasPorRol(id, rol);

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Cuentas bancarias obtenidas exitosamente.",
                data: cuentas
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener las cuentas bancarias: " + error.message
            });
        }
    };


     
    exports.obtenerIdsCuentasBancariasPorRol = async (req, res) => {
        
        const { id, rol } = req.query || {}; 

        try {

            const cuentas = await cuentaBancariaService.obtenerIdsCuentasBancariasPorRol(id, rol);

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "IDs de cuentas bancarias obtenidas exitosamente.",
                data: cuentas
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener las cuentas bancarias: " + error.message
            });
        }
    };


    exports.obtenerCuentasBancariasDeTitular = async (req, res) => {
        
        const { id} = req.params || {}; 

        try {

            const cuentas = await cuentaBancariaService.obtenerCuentasBancariasDeTitular(id);

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Cuentas bancarias obtenidas exitosamente.",
                data: cuentas
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener las cuentas bancarias: " + error.message
            });
        }
    };



    exports.buscarCuentasAprobadas = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {
            // Se llama al servicio con los criterios
            // La función del servicio ya se encarga de limpiar, validar y construir el WHERE.
            const cuentasBancariasEncontradas = await cuentaBancariaService.buscarCuentasBancarias(criteriosBusqueda);

            // Se devuelve la respuesta
            if (cuentasBancariasEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron cuentas bancarias que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de cuentas bancarias completada exitosamente.", 
                data: cuentasBancariasEncontradas 
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



    exports.buscarCuentasPorAprobar = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {
            // Se llama al servicio con los criterios
            // La función del servicio ya se encarga de limpiar, validar y construir el WHERE.
            const cuentasBancariasEncontradas = await cuentaBancariaService.buscarCuentasBancarias(criteriosBusqueda, true);

            // Se devuelve la respuesta
            if (cuentasBancariasEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron cuentas bancarias que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de cuentas bancarias completada exitosamente.", 
                data: cuentasBancariasEncontradas 
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



// Comprobación
    exports.comprobarCuentaBancariaExistente = async (req, res) => {

        const { numero_cuenta, banco} = req.body || {}; 

        try {
            // Convertir y limpiar datos
            const numero_cuenta_cadena = numero_cuenta ? String(numero_cuenta) : null;
            const banco_cadena = banco ? String(banco) : null;


            const existeCuenta = await cuentaBancariaService.verificarCuentaBancariaExistente(numero_cuenta_cadena, banco_cadena);

            // El backend retorna el objeto final
            return res.status(200).json({ 
                message: 'Comprobación de existencia realizada.', 
                existeCuenta: existeCuenta  
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






