const Estudiante_Model = require('../Models/estudiante'); 

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

/**
 * Genera el siguiente código estudiantil único para la base de datos (YYMM####).
 * Esta función debe ser llamada DENTRO de un Mutex para garantizar la unicidad.
 * @returns {string} El código estudiantil generado.
 */
async function generarCodigoEstudiantil() {
    
    // 1. Definir el Prefijo (YYMM)
    const ahora = new Date();
    const anioDosDigitos = ahora.getFullYear().toString().slice(-2); // YY (ej: '25')
    const mesDosDigitos = (ahora.getMonth() + 1).toString().padStart(2, '0'); // MM (ej: '11')
    
    const prefijoActual = `${anioDosDigitos}${mesDosDigitos}`; // YYMM (ej: '2511')

    const longitudSecuencia = 4; // La longitud de la secuencia de estudiantes inscritos en ese año y mes

    // 2. Buscar el último estudiante registrado con el prefijo actual
    // Usamos LIKE para encontrar todos los códigos que comienzan con el prefijo de este mes.
    const ultimoEstudiante = await Estudiante_Model.findOne({
        where: {
            codigo_estudiantil: {
                // Filtra por códigos que comienzan con el prefijo del mes y año actual
                [Op.like]: `${prefijoActual}%` 
            }
        },
        order: [
            ['codigo_estudiantil', 'DESC'] // Ordenar descendente para encontrar el número más alto
        ],
        attributes: ['codigo_estudiantil'],
        limit: 1
    });

    let siguienteSecuencia = 1;

    // 3. Determinar la siguiente secuencia
    if (ultimoEstudiante) {
        const codigoCompleto = ultimoEstudiante.codigo_estudiantil; // Ej: '25110045'
        
        // Extraer los últimos 4 dígitos y convertirlos a número
        const secuenciaAnterior = parseInt(codigoCompleto.slice(-longitudSecuencia), 10);
        
        // Incrementar la secuencia
        siguienteSecuencia = secuenciaAnterior + 1;
    }

    // 4. Formatear la secuencia con ceros iniciales (padStart)
    // Ej: 46 -> '0046'
    const secuenciaFormateada = siguienteSecuencia.toString().padStart(longitudSecuencia, '0');

    // 5. Crear el código final y devolverlo
    const nuevoCodigo = `${prefijoActual}${secuenciaFormateada}`; // Ej: '25110046'

    return nuevoCodigo;
}


module.exports = { generarCodigoEstudiantil };
