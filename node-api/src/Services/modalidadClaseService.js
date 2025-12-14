const Modalidad_Clase_Model = require('../Models/modalidad_clase'); 

class ModalidadClaseService {

    // Se obtienen las modalidades de clase
    async obtenerModalidadesClase() {

        const resultado = await Modalidad_Clase_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_modalidad, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString()    
        }));
        
    }
    
}

module.exports = ModalidadClaseService;