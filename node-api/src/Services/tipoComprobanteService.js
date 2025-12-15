const Tipo_Comprobante_Model = require('../Models/tipo_comprobante'); 

class TipoComprobanteService {

    // Se obtienen los tipos de comprobante
    async obtenerTiposComprobante() {

        const resultado = await Tipo_Comprobante_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_comprobante, 
            nombre: instancia.nombre.toString(),  
            es_legal: instancia.es_legal == true ? "Si" : "No"      
        }));
        
    }
    
}

module.exports = TipoComprobanteService;