const GrupoService = require('../Services/grupoService');

const grupoService = new GrupoService();

// -------------------------- Creación ------------------------------------


    exports.crearGrupo = async (req, res) => {
        try {

            const {curso, periodo, modalidad, docente, nombre, cupo_maximo, costo_inscripcion, costo_clase } = req.body || {};

           
            const nuevaGrupo = await grupoService.crearGrupo({curso, periodo, modalidad, docente, nombre, cupo_maximo, costo_inscripcion, costo_clase });

            // Se responde con éxito (201 Created)
            res.status(201).json({
                message: "Grupo creado exitosamente.",
                data: nuevaGrupo
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

    exports.actualizarGrupo = async (req, res) => {


        const { id } = req.params;

        // Se obtienen los datos permitidos de modificar del cuerpo de la solicitud
        const {modalidad, docente, nombre, cupo_maximo, costo_inscripcion, costo_clase, estado} = req.body; 
        
        try {
            // 3. Delegar la tarea al servicio. El servicio valida, actualiza y recarga el objeto.
            const grupoActualizado = await grupoService.actualizarGrupo(id, modalidad, docente, nombre, cupo_maximo, costo_inscripcion, costo_clase, estado);

            if (!grupoActualizado) {
                // Si el servicio devuelve null (porque el findByPk falló)
                return res.status(404).json({
                    error: true,
                    message: `Grupo con ID ${id} no encontrado.`
                });
            }

            // Respuesta de éxito (200 OK)
            res.status(200).json({
                message: `Grupo ${id} actualizado exitosamente.`,
                data: grupoActualizado
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


// -------------------------- Obtención ------------------------------------


    exports.obtenerGrupoPorId = async (req, res) => {

        const { id } = req.params || {}; 

        try {

            const grupo = await grupoService.obtenerGrupoPorId(id);

            if (!grupo) {
                // 404 Not Found si la cuenta no existe
                return res.status(404).json({
                    error: true,
                    message: `Grupo con ID ${id} no encontrado.`
                });
            }

            // 200 OK y devuelve el objeto
            res.status(200).json({
                message: "Grupo obtenido exitosamente.",
                data: grupo
            });
            
        } catch (error) {
            // Manejo de errores (ej. ID inválido, error de base de datos)
            res.status(500).json({
                error: true,
                message: "Error al obtener al grupo: " + error.message
            });
        }
    };



    exports.buscargrupos = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {

            const gruposEncontrados = await grupoService.buscargrupos(criteriosBusqueda);


            if (gruposEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron grupos que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de grupos completada exitosamente.", 
                data: gruposEncontrados 
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



    exports.contarGrupos = async (req, res) => {

        const criteriosBusqueda = req.query || {};

        try {

            const gruposEncontrados = await grupoService.obtenerConteoPorMes(criteriosBusqueda);

            // Se devuelve la respuesta
            if (gruposEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron grupos que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de grupos completada exitosamente.", 
                data: gruposEncontrados 
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

            const gruposEncontrados = await grupoService.obtenerEstadosTotales(criteriosBusqueda);


            if (gruposEncontrados.length === 0) {
                return res.status(200).json({ 
                    message: "No se encontraron grupos que coincidan con los filtros.", 
                    data: [] 
                });
            }

            return res.status(200).json({ 
                message: "Búsqueda de grupos completada exitosamente.", 
                data: gruposEncontrados 
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




