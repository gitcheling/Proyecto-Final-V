/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Banco_Model = require('../Models/banco'); 


// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

class BancoService {


    // Se obtienen los bancos
    async obtenerBancos() {

        const resultado = await Banco_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_banco, 
            nombre: instancia.nombre.toString(),
            codigo_nacional : instancia.codigo_nacional.toString(),
            codigo_swift : instancia.codigo_swift.toString(),           
        }));
        
    }
    
}

module.exports = BancoService;