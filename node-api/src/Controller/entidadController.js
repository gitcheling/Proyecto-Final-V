// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const EntidadService = require('../Services/entidadService');

const entidadService = new EntidadService();

// -------------------------- Creación ------------------------------------

    /* Esta función maneja la creación de nuevas cuentas. Tiene como parámetros:

        -req (Request / Solicitud): Contiene toda la información enviada por el cliente (cuerpo, parámetros, encabezados).

        -res (Response / Respuesta): Contiene métodos para enviar la respuesta de vuelta al cliente en su navegador. 
    */
    exports.crearEntidad = async (req, res) => {
        try {

            /* Se extrae las propiedades del objeto "req.body" y se le asigna a variables locales con el mismo nombre.

                Nota: La desestructuración de objetos en JavaScript se basa en los nombres de las propiedades, no en la posición u orden. Por 
                lo que, cualquier objeto que no se especifique en la desestructuració, será ignorado (lo cual es mas seguro para no tener en 
                cuenta datos sobrantes y maliciosos de parte del cliente).
            */
            const {tipo_identificacion, prefijo, numero_identificacion, nombre, apellido, email, telefono, direccion} = req.body || {};

            // Se llama a la función del servicio que se encarga de validar y mandar a crear la entidad
            const nuevaEntidad = await entidadService.crearEntidad({tipo_identificacion, prefijo, numero_identificacion, nombre, apellido, email, telefono, direccion });

        // Se responde con éxito (201 Created)
            res.status(201).json({
                message: "Entidad creada exitosamente.",
                data: nuevaEntidad
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
     * Actualizar una entidad
     */
    exports.actualizarEntidad = async (req, res) => {


        const { id } = req.params;

        // Se obtienen los datos permitidos de modificar del cuerpo de la solicitud
        const {nombre, apellido, email, telefono, direccion} = req.body; 
        
        try {
            // 3. Delegar la tarea al servicio. El servicio valida, actualiza y recarga el objeto.
            const entidadActualizada = await entidadService.actualizarEntidad(id, nombre, apellido, email, telefono, direccion);

            if (!entidadActualizada) {
                // Si el servicio devuelve null (porque el findByPk falló)
                return res.status(404).json({
                    error: true,
                    message: `Entidad con ID ${id} no encontrada.`
                });
            }

            // Respuesta de éxito (200 OK)
            res.status(200).json({
                message: `Entidad ${id} actualizada exitosamente.`,
                data: entidadActualizada
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
    exports.cambiarEstadoEntidad = async (req, res) => {

        const { id } = req.params || {}; 

        // Se captura el nuevo estado del cuerpo (ej: { "estado": false })
        const { estado } = req.body || {}; 

        try {
            const completado = await entidadService.cambiarEstadoEntidad(id, estado);

            if (!completado) {
                return res.status(404).json({
                    error: true,
                    message: `Entidad con ID ${id} no encontrada.`
                });
            }

            res.status(200).json({
                message: `Estado de la entidad ${id} cambiado a ${estado ? 'ACTIVO' : 'INACTIVO'} exitosamente.`,
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
     * Obtener cuentas por filtros
     */
    exports.obtenerEntidades = async (req, res) => {
        try {

            const criteriosBusqueda = req.query || {};

            // Llama al servicio para obtener la lista de cuentas
            const entidades = await entidadService.obtenerEntidades(criteriosBusqueda); 

            // 200 OK y devuelve el arreglo
            res.status(200).json({
                message: "Entidades obtenidas exitosamente.",
                data: entidades
            });
            
        } catch (error) {
            // Manejo de errores generales del servidor
            res.status(500).json({
                error: true,
                message: "Error al obtener las entidades: " + error.message
            });
        }
    };


    /**
     * Obtener una entidad por su ID (id_entidad).
     */
    exports.obtenerEntidadPorId = async (req, res) => {

        const { id } = req.params || {}; 

        try {
            // Llama al servicio para buscar la cuenta
            const entidad = await entidadService.obtenerEntidadPorId(id);

            if (!entidad) {
                // 404 Not Found si la cuenta no existe
                return res.status(404).json({
                    error: true,
                    message: `Entidad con ID ${id} no encontrada.`
                });
            }

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Entidad obtenida exitosamente.",
                data: entidad
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener la entidad: " + error.message
            });
        }
    };


    /**
     * Obtener los prefijos de un tipo de identificación
     */
    exports.obtenerPrefijos = async (req, res) => {

        const { id } = req.params || {}; 

        try {
            // Llama al servicio para buscar la cuenta
            const prefijos = await entidadService.obtenerPrefijos(id);

            if (!prefijos) {
                // 404 Not Found si la cuenta no existe
                return res.status(404).json({
                    error: true,
                    message: `No se encontraron prefijos para el tipo de identificación seleccionado.`
                });
            }

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Prefijos obtenidos exitosamente.",
                data: prefijos
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener los prefijos: " + error.message
            });
        }
    };



    exports.buscarEntidades = async (req, res) => {

        /* Se obtiene los criterios de búsqueda de la URL (req.query). Express automáticamente los coloca en este objeto.
        Nota: Al enviar datos a través de los parámetros de consulta de una URL (usando el método GET con req.query en Express), 
        los datos siempre se envían y se reciben en el backend a modo de texto (cadenas de string). */
        const criteriosBusqueda = req.query || {};

        try {
            // Se llama al servicio con los criterios
            // La función del servicio ya se encarga de limpiar, validar y construir el WHERE.
            const entidadesEncontradas = await entidadService.buscarEntidades(criteriosBusqueda);

            // Se devuelve la respuesta
            if (entidadesEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron entidades que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de entidades completada exitosamente.", 
                data: entidadesEncontradas 
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



    exports.contarEntidades = async (req, res) => {

        /* Se obtiene los criterios de búsqueda de la URL (req.query). Express automáticamente los coloca en este objeto.
        Nota: Al enviar datos a través de los parámetros de consulta de una URL (usando el método GET con req.query en Express), 
        los datos siempre se envían y se reciben en el backend a modo de texto (cadenas de string). */
        const criteriosBusqueda = req.query || {};

        try {
            // Se llama al servicio con los criterios
            // La función del servicio ya se encarga de limpiar, validar y construir el WHERE.
            const entidadesEncontradas = await entidadService.obtenerConteoPorMes(criteriosBusqueda);

            // Se devuelve la respuesta
            if (entidadesEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron entidades que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de entidades completada exitosamente.", 
                data: entidadesEncontradas 
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

            const entidadesEncontradas = await entidadService.obtenerEstadosTotales(criteriosBusqueda);


            if (entidadesEncontradas.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron entidades que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de entidades completada exitosamente.", 
                data: entidadesEncontradas 
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


// -------------------------- Comprobación ------------------------------------

    /**
     * Comprobar si ya existe una cuenta en la base de datos.
     */
    exports.comprobarEntidadExistente = async (req, res) => {

        const { email, tipo_identificacion, prefijo, numero_identificacion, idExcluido } = req.body || {}; 

        try {

            // Convertir y limpiar datos
            const emailLowerCase = email ? String(email).toLowerCase() : '';
            const tipoIdentificacionLowerCase = tipo_identificacion ? String(tipo_identificacion).toLowerCase() : '';
            const prefijoLowerCase = prefijo ? String(prefijo).toLowerCase() : '';
            const numero_identificacionLimpio = numero_identificacion ? String(numero_identificacion) : '';
            const id = idExcluido ? parseInt(idExcluido) : null;

            const entidadDuplicada = await entidadService.verificarEntidadDuplicada(emailLowerCase, tipoIdentificacionLowerCase, prefijoLowerCase, numero_identificacionLimpio, id);

            let existeEmail = false;
            let existeIdentidad = false;

            if (entidadDuplicada === 'email' || entidadDuplicada === 'ambos') {
                existeEmail = true;
            }

            if (entidadDuplicada === 'identidad' || entidadDuplicada === 'ambos') {
                existeIdentidad = true;
            }

            // El backend retorna el objeto final
            return res.status(200).json({ 
                message: 'Comprobación de unicidad realizada.', 
                existeEmail: existeEmail, 
                existeIdentidad: existeIdentidad  
            });


        } catch (error) {
        console.error('Error al comprobar entidad:', error);
            return res.status(500).json({ message: 'Error interno del servidor al verificar la entidad.' });
        }
    };




