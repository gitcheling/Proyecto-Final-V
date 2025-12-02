/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Estado_Academico_Model = require('../Models/estado_academico'); 


class EstadoAcademicoService {

    // Se obtienen los estados académicos
    async obtenerEstadosAcademicos() {

        const resultado = await Estado_Academico_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_estado_academico, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString(),           
        }));
        
    }
    
}

module.exports = EstadoAcademicoService;