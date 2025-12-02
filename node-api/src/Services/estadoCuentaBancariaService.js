/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const estado_Cuenta_Bancaria_Model = require('../Models/estado_cuenta_bancaria'); 


class EstadoCuentaBancariaService {

    // Se obtienen los estados de cuenta bancaria
    async obtenerEstadosCuentaBancaria() {

        const resultado = await estado_Cuenta_Bancaria_Model.findAll({
            // La clave 'order' acepta un array de arrays
            order: [
                // Cada array interno define la columna y la dirección de ordenamiento
                ['id_estado_cuenta', 'ASC'] // Ordenar por id_estado_cuenta de forma ascendente (ASC)
            ]
        });

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        // Se usa "filter" para eliminar la instancia "Pendiente de Validación"
        const estadosFiltrados = resultado.filter(instancia => {
            // Retorna TRUE para mantener el elemento, FALSE para eliminarlo
            return instancia.nombre.toString() !== "Pendiente de Validación";
        });

        // Se usa "map" para transformar solo los elementos restantes
        return estadosFiltrados.map(instancia => ({
            id: instancia.id_estado_cuenta, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString(), 
            permite_operacion: instancia.permite_operacion === true ? "Si" : "No"
        }));
        
             
    }


}

module.exports = EstadoCuentaBancariaService;