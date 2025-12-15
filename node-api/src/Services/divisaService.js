const Divisa_Model = require('../Models/divisa'); 

class DivisaService {

    async obtenerDivisas() {

        const resultado = await Divisa_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_divisa, 
            nombre: instancia.nombre.toString(),
            codigo: instancia.codigo.toString(),   
            simbolo: instancia.simbolo.toString()
        }));
        
    }
    
}

module.exports = DivisaService;