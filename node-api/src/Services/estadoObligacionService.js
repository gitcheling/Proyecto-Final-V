const Estado_Obligacion_Model = require('../Models/estado_obligacion'); 

class EstadoObligacionService {


    async obtenerEstadosObligacion() {

        const resultado = await Estado_Obligacion_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_estado_obligacion, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString(),   
            es_finalizado: instancia.es_finalizado == true ? "Si" : "No"      
        }));
        
    }
    
}

module.exports = EstadoObligacionService;