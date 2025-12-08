const PeriodoService = require('../Services/periodoService');

const periodoService = new PeriodoService();

exports.crearPeriodo = async (req, res) => {
    try {

        const {nombre, inicio, fin} = req.body || {};

        const nuevoPeriodo = await periodoService.crearPeriodo({nombre, inicio, fin});

       // Se responde con éxito (201 Created)
        res.status(201).json({
            message: "Perido creado exitosamente.",
            data: nuevoPeriodo
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


exports.actualizarPeriodo = async (req, res) => {


    const { id } = req.params;

    // Se obtienen los datos permitidos de modificar del cuerpo de la solicitud
    const {nombre, inicio, fin} = req.body; 
    
    try {
        // 3. Delegar la tarea al servicio. El servicio valida, actualiza y recarga el objeto.
        const completado = await periodoService.actualizarPeriodo(id, nombre, inicio, fin);

        if (!completado) {
            // Si el servicio devuelve null (porque el findByPk falló)
            return res.status(404).json({
                error: true,
                message: `Periodo con ID ${id} no encontrado.`
            });
        }

        // Respuesta de éxito (200 OK)
        res.status(200).json({
            message: `Periodo ${id} actualizada exitosamente.`,
            data: "Modificación realizada"
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



exports.obtenerPeriodoPorId = async (req, res) => {

    const { id } = req.params || {}; 

    try {

        const periodo = await periodoService.obtenerPeriodoPorId(id);

        if (!periodo) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Periodo con ID ${id} no encontrado.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Periodo obtenido exitosamente.",
            data: periodo
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener al periodo: " + error.message
        });
    }
};


exports.buscarPeriodos = async (req, res) => {

    const criteriosBusqueda = req.query || {};

    try {

        const periodosEncontrados = await periodoService.buscarPeriodos(criteriosBusqueda);

        // Se devuelve la respuesta
        if (periodosEncontrados.length === 0) {
            return res.status(200).json({ 
                message: "No se encontraron periodos que coincidan con los filtros.", 
                data: [] 
            });
        }

        return res.status(200).json({ 
            message: "Búsqueda de periodos completada exitosamente.", 
            data: periodosEncontrados 
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



