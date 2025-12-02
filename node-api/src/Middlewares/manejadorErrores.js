// Se importa la función "errorResponse" que se usa para estandarizar las respuestas de error
// Asumimos que también necesitas "responses" para el caso de ValidationError
const {errorResponse, responses} = require('../Utils/responses');

const manejadorErrores = (err, req, res, next) => {
    console.error("Error capturado por el manejador de errores:", err);

    // Variable para manejar el código de error de la DB (más común como err.code)
    const dbErrorCode = err.code || err.name;
    const errorMessageLower = err.message ? err.message.toLowerCase() : '';

    // Manejo de errores de validación (Ej: Joi, Sequelize Validation Error)
    if(err.name === 'ValidationError') {
        // Asumimos que 'responses(err)' devuelve un objeto de respuesta formateado
        return res.status(400).json(responses(err)); 
    }
    
    // Manejo de códigos de error de PostgreSQL (usamos dbErrorCode para más robustez)
    if(dbErrorCode === '23505'){
        // 23505: Violación de restricción de unicidad (DUPLICADO)
        return errorResponse(res, 'REGISTRO DUPLICADO. Revise los campos únicos.', 400);
    }
    if(dbErrorCode === '23503'){
        // 23503: Violación de clave foránea (Intento de eliminar o modificar un registro referenciado)
        return errorResponse(res, 'Imposible de eliminar, tiene registros relacionados.', 400);
    }
    
    // Manejo de errores de JSON malformado (antes de que Express llegue a la ruta)
    if (err.type === 'entity.parse.failed' && err.statusCode === 400) {
        return errorResponse(res, 'JSON de solicitud inválido o malformado. Revise la sintaxis.', 400);
    }
    
    // Manejo de errores de negocio que contienen "no encontrado" (robusto a mayúsculas/minúsculas)
    if (errorMessageLower.includes('no encontrada') || errorMessageLower.includes('no encontrado')) {
        return errorResponse(res, err.message, 404);
    }


    // Respuesta de error genérica 500 para errores internos no capturados
    errorResponse(res, 'Error interno del servidor. Por favor, contacte a soporte.', 500);
}

module.exports = {
    manejadorErrores
};