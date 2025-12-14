const CursoService = require('../Services/cursoService');

const cursoService = new CursoService();


exports.crearCurso = async (req, res) => {
    try {

        const {nombre, descripcion, categoria, total_clases} = req.body || {};

     
        const nuevoCurso = await cursoService.crearCurso({ nombre, descripcion, categoria, total_clases });

        res.status(201).json({
            message: "Curso creado exitosamente.",
            data: nuevoCurso
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



exports.actualizarCurso = async (req, res) => {


    const { id } = req.params;

    const {nombre, descripcion, categoria, total_clases, estado} = req.body; 
    try {

        const cursoActualizado = await cursoService.actualizarCurso(id, nombre, descripcion, categoria, total_clases, estado);

        if (!cursoActualizado) {
            // Si el servicio devuelve null (porque el findByPk falló)
            return res.status(404).json({
                error: true,
                message: `Curso con ID ${id} no encontrado.`
            });
        }

        // Respuesta de éxito (200 OK)
        res.status(200).json({
            message: `Curso actualizado exitosamente.`,
            data: cursoActualizado
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



exports.obtenerCursoPorId = async (req, res) => {

    const { id } = req.params || {}; 

    try {
        // Llama al servicio para buscar la cuenta
        const curso = await cursoService.obtenerCursoPorId(id);

        if (!curso) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Curso con ID ${id} no encontrada.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Curso obtenida exitosamente.",
            data: curso
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener al curso: " + error.message
        });
    }
};




exports.buscarCursos = async (req, res) => {

    const criteriosBusqueda = req.query || {};

    try {

        const cursosEncontrados = await cursoService.buscarCursos(criteriosBusqueda);

        // Se devuelve la respuesta
        if (cursosEncontrados.length === 0) {
            return res.status(200).json({ 
                message: "No se encontraron cursos que coincidan con los filtros.", 
                data: [] 
            });
        }

        return res.status(200).json({ 
            message: "Búsqueda de cursos completada exitosamente.", 
            data: cursosEncontrados 
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




