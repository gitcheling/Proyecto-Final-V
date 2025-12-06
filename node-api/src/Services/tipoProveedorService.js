/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Tipo_Proveedor_Model = require('../Models/tipo_proveedor'); 


class TipoProveedorService {


    async obtenerTiposProveedor() {

        const resultado = await Tipo_Proveedor_Model.findAll();

        // Función auxiliar para convertir booleanos a "Si"/"No"
        // Nota: si recibe "undefined" sería: "undefined === true" es false
        const boolToText = (value) => value === true ? "Si" : "No";

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_tipo_proveedor, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString()         
        }));
        
    }
    
}

module.exports = TipoProveedorService;