// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const CuentaService = require('../Services/cuentaService');

const cuentaService = new CuentaService();

/* Esta función maneja la creación de nuevas cuentas. Tiene como parámetros:

    -req (Request / Solicitud): Contiene toda la información enviada por el cliente (cuerpo, parámetros, encabezados).

    -res (Response / Respuesta): Contiene métodos para enviar la respuesta de vuelta al cliente en su navegador. 
*/
exports.crearCuenta = async (req, res) => {
    try {

        /* Se extrae las propiedades como "codigo" y "nombre" del objeto "req.body" y se le asigna a variables locales con el mismo nombre.

            Nota: La desestructuración de objetos en JavaScript se basa en los nombres de las propiedades, no en la posición u orden. Por 
            lo que, cualquier objeto que no se especifique en la desestructuració, será ignorado (lo cual es mas seguro para no tener en 
            cuenta datos sobrantes y maliciosos de parte del cliente).
        */
        const {codigo, nombre, naturaleza, cuenta_padre} = req.body || {};

        // Se llama a la función del servicio que se encarga de validar y mandar a crear la cuenta
        const nuevaCuenta = await cuentaService.crearCuenta({ codigo, nombre, naturaleza, cuenta_padre });

       // Se responde con éxito (201 Created)
        res.status(201).json({
            message: "Cuenta creada exitosamente y jerarquía establecida.",
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


/**
 * Obtener cuentas por filtros
 */
exports.obtenerCuentas = async (req, res) => {
    try {
        // Llama al servicio para obtener la lista de cuentas
        const cuentas = await cuentaService.obtenerCuentas(); 

        // 200 OK y devuelve el arreglo
        res.status(200).json({
            message: "Cuentas obtenidas exitosamente.",
            data: cuentas
        });
        
    } catch (error) {
        // Manejo de errores generales del servidor
        res.status(500).json({
            error: true,
            message: "Error al obtener las cuentas: " + error.message
        });
    }
};


/**
 * Obtener una cuenta por su ID (id_plan_cuenta).
 */
exports.obtenerCuentaPorId = async (req, res) => {
    // 1. Capturar el parámetro de la ruta
    const { id } = req.params || {}; 

    try {
        // Llama al servicio para buscar la cuenta
        const cuenta = await cuentaService.obtenerCuentaPorId(id);

        if (!cuenta) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Cuenta con ID ${id} no encontrada.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Cuenta obtenida exitosamente.",
            data: cuenta
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener la cuenta: " + error.message
        });
    }
};


/**
 * Actualizar una cuenta
 */
exports.actualizarCuenta = async (req, res) => {

    /* Se obtiene el id de la cuenta a modificar desde la url 

    Nota: Se debe enviar en la url y no en el cuerpo de la solicitud ya que es la convención estándar en el diseño de APIs REST
    */
    const { id } = req.params || {};

    // Se obtienen los datos permitidos de modificar del cuerpo de la solicitud
    const {nombre} = req.body || {}; 
    
    try {
        // 3. Delegar la tarea al servicio. El servicio valida, actualiza y recarga el objeto.
        const cuentaActualizada = await cuentaService.actualizarCuenta(id, nombre);

        if (!cuentaActualizada) {
            // Si el servicio devuelve null (porque el findByPk falló)
            return res.status(404).json({
                error: true,
                message: `Cuenta con ID ${id} no encontrada.`
            });
        }

        // Respuesta de éxito (200 OK)
        res.status(200).json({
            message: `Cuenta ${id} actualizada exitosamente.`,
            data: cuentaActualizada
        });

    } catch (error) {

        const validationErrorMessages = [
            'inválido', 'solo texto', 'true/false', 'duplicado', 'válido para actualizar'
        ];

        const isValidationError = validationErrorMessages.some(msg => error.message.includes(msg));
        
        const statusCode = isValidationError ? 400 : 500;
        
        res.status(statusCode).json({
            error: true,
            message: error.message
        });
    }
};


/**
 * Desactivar o activar una cuenta (alternativa a la eliminación).
 */
exports.cambiarEstadoCuenta = async (req, res) => {

    const { id } = req.params || {}; 

    // Se captura el nuevo estado del cuerpo (ej: { "estado": false })
    const { estado } = req.body || {}; 

    try {
        const completado = await cuentaService.cambiarEstadoCuenta(id, estado);

        if (!completado) {
            return res.status(404).json({
                error: true,
                message: `Cuenta con ID ${id} no encontrada.`
            });
        }

        res.status(200).json({
            message: `Estado de la cuenta ${id} cambiado a ${estado ? 'ACTIVO' : 'INACTIVO'} exitosamente.`,
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



/**
 * Comprobar si ya existe una cuenta en la base de datos.
 */
exports.comprobarCuentaExistente = async (req, res) => {

    const { codigo, nombre, idExcluido } = req.body || {}; 

    try {

        // Convertir y limpiar datos
        const codigoLowerCase = codigo ? String(codigo).toLowerCase() : null;
        const nombreLowerCase = nombre ? String(nombre).toLowerCase() : null;
        const id = idExcluido ? parseInt(idExcluido) : null;

        const campoDuplicado = await cuentaService.verificarCuentaDuplicada(codigoLowerCase, nombreLowerCase, id);

        let existeCodigo = false;
        let existeNombre = false;

        if (campoDuplicado === 'codigo' || campoDuplicado === 'ambos') {
            existeCodigo = true;
        }

        if (campoDuplicado === 'nombre' || campoDuplicado === 'ambos') {
            existeNombre = true;
        }

        // El backend retorna el objeto final
        return res.status(200).json({ 
            message: 'Comprobación de unicidad realizada.', 
            existeCodigo: existeCodigo, 
            existeNombre: existeNombre  
        });


    } catch (error) {
       console.error('Error al comprobar cuenta:', error);
        return res.status(500).json({ message: 'Error interno del servidor al verificar la cuenta.' });
    }
};


exports.buscarCuentas = async (req, res) => {

    /* Se obtiene los criterios de búsqueda de la URL (req.query). Express automáticamente los coloca en este objeto.
    Nota: Al enviar datos a través de los parámetros de consulta de una URL (usando el método GET con req.query en Express), 
    los datos siempre se envían y se reciben en el backend a modo de texto (cadenas de string). */
    const criteriosBusqueda = req.query || {};

    try {
        // Se llama al servicio con los criterios
        // La función del servicio ya se encarga de limpiar, validar y construir el WHERE.
        const cuentasEncontradas = await cuentaService.buscarCuentas(criteriosBusqueda);

        // Se devuelve la respuesta
        if (cuentasEncontradas.length === 0) {
            return res.status(200).json({ 
                message: "No se encontraron cuentas que coincidan con los filtros.", 
                data: [] 
            });
        }

        return res.status(200).json({ 
            message: "Búsqueda de cuentas completada exitosamente.", 
            data: cuentasEncontradas 
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

