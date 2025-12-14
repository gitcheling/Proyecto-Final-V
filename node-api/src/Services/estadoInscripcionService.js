const Estado_Inscripcion_Model = require('../Models/estado_inscripcion'); 

class EstadoInscripcionService {

    // Se obtienen los estados
    async obtenerEstadosInscripcion() {

        const resultado = await Estado_Inscripcion_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_estado_inscripcion, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString(),   
            puede_ver_clase: instancia.puede_ver_clase,
            ciclo_cerrado: instancia.ciclo_cerrado        
        }));

    
    }
    
}

module.exports = EstadoInscripcionService;