// Se importan la clase que hará las validaciones y las llamadas a la base de datos
const ConceptoFinancieroService = require('../Services/conceptoFinancieroService');

const conceptoFinancieroService = new ConceptoFinancieroService();

exports.buscarConceptos = async (req, res) => {

    try {

        const { padre } = req.query || {}; 

        const conceptos = await conceptoFinancieroService.buscarConceptos(padre);

        if (!conceptos) {
            // 404 Not Found si la cuenta no existe
            return res.status(404).json({
                error: true,
                message: `Conceptos financieros no encontradas.`
            });
        }

        // 200 OK y devuelve el objeto
        res.status(200).json({
            message: "Conceptos financieros obtenidos exitosamente.",
            data: conceptos
        });
        
    } catch (error) {
        // Manejo de errores (ej. ID inválido, error de base de datos)
        res.status(500).json({
            error: true,
            message: "Error al obtener los conceptos financieros: " + error.message
        });
    }
};


